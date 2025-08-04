# /backend/app/rag_handler.py

import os
import faiss
import json
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
from googleapiclient.discovery import build
from google.generativeai.types import GenerationConfig

# (Path configuration remains the same)
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
DEFAULT_VECTOR_STORE_DIR = os.path.join(PROJECT_ROOT, "backend", "vector_store")

dotenv_path = os.path.join(PROJECT_ROOT, '.env')
load_dotenv(dotenv_path=dotenv_path)

class RAGSystem:
    def __init__(self, vector_store_dir=DEFAULT_VECTOR_STORE_DIR):
        # (Initialization remains the same)
        print("Initializing RAG System...")
        index_path = os.path.join(vector_store_dir, "faiss_index.bin")
        chunks_path = os.path.join(vector_store_dir, "legal_chunks.json")

        if not os.path.exists(index_path) or not os.path.exists(chunks_path):
            raise FileNotFoundError(f"Vector store not found. Please run 'build_index.py'.")

        self.index = faiss.read_index(index_path)
        self.chunks = json.load(open(chunks_path, 'r', encoding='utf-8'))
        
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=gemini_api_key)
        self.embedding_model = "models/text-embedding-004"
        self.generative_model = genai.GenerativeModel('gemini-1.5-flash-latest')
        
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.cse_id = os.getenv("CSE_ID")
        print("RAG System Initialized.")

    # --- HELPER FUNCTIONS (remain the same) ---
    def _get_query_embedding(self, query: str):
        result = genai.embed_content(model=self.embedding_model, content=query)
        return np.array([result['embedding']]).astype('float32')

    def search_local_docs(self, query: str, top_k: int = 5):
        query_embedding = self._get_query_embedding(query)
        distances, indices = self.index.search(query_embedding, top_k)
        results = [{"source": self.chunks[i].get('source', 'Unknown'), "text": self.chunks[i].get('text', '')} for i in indices[0]]
        return results

    def search_web(self, query: str):
        try:
            service = build("customsearch", "v1", developerKey=self.google_api_key)
            res = service.cse().list(q=query, cx=self.cse_id, num=3).execute()
            snippets = [f"Source: {item['link']}\nSnippet: {item['snippet']}" for item in res.get('items', [])]
            return "\n\n".join(snippets) if snippets else "No relevant web results found."
        except Exception as e:
            print(f"An error occurred during web search: {e}")
            return "Could not perform a web search at this time."

    # --- NEW "BRAIN" LAYER ---
    def analyze_user_intent(self, conversation_history: list):
        """Analyzes the conversation to determine intent and create a better search query."""
        
        # Format the history for the AI
        history_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history])
        
        prompt = f"""
        You are the "brain" of a legal chatbot. Analyze the following conversation history.
        Your task is to determine two things:
        1.  **response_type**: Is the user's latest message a new, detailed legal question that needs a full, structured analysis, or is it a short, conversational follow-up to the previous topic? Answer 'structured' or 'conversational'.
        2.  **search_query**: Create an optimal Google search query to find relevant case laws for the user's *actual* topic of conversation. This query should be self-contained and include context from the history.

        CONVERSATION HISTORY:
        ---
        {history_str}
        ---

        JSON OUTPUT:
        """

        json_schema = {
            "type": "object",
            "properties": {
                "response_type": {"type": "string", "enum": ["structured", "conversational"]},
                "search_query": {"type": "string"}
            },
            "required": ["response_type", "search_query"]
        }
        
        generation_config = GenerationConfig(response_mime_type="application/json", response_schema=json_schema)
        response = self.generative_model.generate_content(prompt, generation_config=generation_config)
        
        return json.loads(response.text)

    # --- UPDATED GENERATION FUNCTIONS ---
    def generate_response(self, query: str, local_context: str, web_context: str, response_type: str):
        """Generates either a structured or conversational response."""

        if response_type == 'structured':
            # Use the detailed, structured prompt from before
            return self.generate_structured_response(query, local_context, web_context)
        else:
            # Use a new, simpler prompt for conversational follow-ups
            prompt = f"""
            You are "Legal Sahayak," an expert AI legal assistant.
            A user has asked a follow-up question: "{query}"
            
            Using the provided context from internal documents and web search results, provide a direct, conversational answer.
            Do not use a structured format, lists, or bold headings. Just answer the question naturally.

            ---
            CONTEXT:
            {local_context}
            ---
            WEB SEARCH RESULTS:
            {web_context}
            ---

            CONVERSATIONAL ANSWER:
            """
            response = self.generative_model.generate_content(prompt)
            return {"response_text": response.text} # Return a simple object

    def generate_structured_response(self, query: str, local_context: str, web_context: str):
        # This function and its schema remain the same as before
        json_schema = {
            "type": "object",
            "properties": {
                "summaryOfRights": {"type": "string"},
                "relevantActsAndArticles": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "explanation": {"type": "string"}}}},
                "similarCaseLaw": {"type": "array", "items": {"type": "object", "properties": {"name": {"type": "string"}, "principle": {"type": "string"}}}},
                "nextSteps": {"type": "array", "items": {"type": "string"}}
            },
        }
        generation_config = GenerationConfig(response_mime_type="application/json", response_schema=json_schema)
        prompt = f"""
        You are "Legal Sahayak," an expert AI legal assistant in India.
        A user has the following question: "{query}"
        Analyze the context and populate a JSON object that strictly follows the provided schema.

        ---
        CONTEXT FROM INTERNAL DOCUMENTS: {local_context}
        ---
        LATEST WEB SEARCH RESULTS: {web_context}
        ---
        """
        response = self.generative_model.generate_content(prompt, generation_config=generation_config)
        return json.loads(response.text)
