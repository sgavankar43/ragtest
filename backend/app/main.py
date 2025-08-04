# /backend/app/main.py

import os
import sys
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import List, Dict, Any

# (Path configuration remains the same)
APP_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(APP_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
sys.path.append(BACKEND_DIR)

from app.rag_handler import RAGSystem

dotenv_path = os.path.join(PROJECT_ROOT, '.env')
load_dotenv(dotenv_path=dotenv_path)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("FastAPI app starting up...")
    app.state.rag_system = RAGSystem()
    yield
    print("FastAPI app shutting down...")

app = FastAPI(lifespan=lifespan)

# (CORS Middleware remains the same)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- UPDATED Pydantic Models ---
class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    history: List[Message]

class ChatResponse(BaseModel):
    response: Dict[str, Any]

# --- UPDATED API Endpoint ---
@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_rag_system(request: ChatRequest):
    if not request.history:
        raise HTTPException(status_code=400, detail="History cannot be empty.")
    
    try:
        rag_system = app.state.rag_system
        history = [msg.dict() for msg in request.history]
        latest_query = history[-1]['content']

        # 1. NEW: Analyze intent and get a better search query
        intent = rag_system.analyze_user_intent(history)
        response_type = intent.get('response_type', 'conversational')
        search_query = intent.get('search_query', latest_query)
        print(f"Intent Analysis - Type: {response_type}, Search Query: {search_query}")

        # 2. Search local and web docs with the improved query
        local_docs = rag_system.search_local_docs(query=search_query)
        local_context = "\n\n".join([doc['text'] for doc in local_docs])
        web_context = rag_system.search_web(query=search_query)
        
        # 3. Generate the appropriate response (structured or conversational)
        final_response = rag_system.generate_response(
            query=latest_query,
            local_context=local_context,
            web_context=web_context,
            response_type=response_type
        )
        
        return ChatResponse(response=final_response)
        
    except Exception as e:
        print(f"An error occurred in the main chat endpoint: {e}")
        raise HTTPException(status_code=500, detail="An internal error occurred.")
