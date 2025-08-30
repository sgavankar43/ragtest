#!/usr/bin/env python3
# /rag_backup/build_index.py

import os
import json
import faiss
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
dotenv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".env")
load_dotenv(dotenv_path=dotenv_path)

def load_documents():
    """Load documents from the corpus directory."""
    corpus_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "corpus")
    documents = []
    
    for file_path in Path(corpus_dir).glob("*.txt"):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            documents.append({
                'source': file_path.name,
                'text': content,
                'chunks': []
            })
    
    return documents

def chunk_text(text, chunk_size=1000, overlap=200):
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk.strip())
        start = end - overlap
        
        if start >= len(text):
            break
    
    return chunks

def create_embeddings(texts, model_name="models/text-embedding-004"):
    """Create embeddings for the given texts."""
    gemini_api_key = os.getenv("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")
    
    genai.configure(api_key=gemini_api_key)
    
    embeddings = []
    for text in texts:
        try:
            result = genai.embed_content(model=model_name, content=text)
            embeddings.append(result['embedding'])
        except Exception as e:
            print(f"Error creating embedding: {e}")
            # Use zero vector as fallback
            embeddings.append([0.0] * 768)  # Default embedding dimension
    
    return np.array(embeddings).astype('float32')

def build_index():
    """Build the FAISS index and save chunks."""
    print("Loading documents...")
    documents = load_documents()
    
    if not documents:
        print("No documents found in corpus directory!")
        return
    
    print(f"Found {len(documents)} documents")
    
    # Create chunks
    all_chunks = []
    for doc in documents:
        chunks = chunk_text(doc['text'])
        for i, chunk in enumerate(chunks):
            all_chunks.append({
                'source': doc['source'],
                'text': chunk,
                'chunk_id': i
            })
    
    print(f"Created {len(all_chunks)} chunks")
    
    # Create embeddings
    print("Creating embeddings...")
    texts = [chunk['text'] for chunk in all_chunks]
    embeddings = create_embeddings(texts)
    
    # Build FAISS index
    print("Building FAISS index...")
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    
    # Save index and chunks
    vector_store_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vector_store")
    os.makedirs(vector_store_dir, exist_ok=True)
    
    index_path = os.path.join(vector_store_dir, "faiss_index.bin")
    chunks_path = os.path.join(vector_store_dir, "legal_chunks.json")
    
    faiss.write_index(index, index_path)
    
    with open(chunks_path, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, ensure_ascii=False, indent=2)
    
    print(f"Index saved to: {index_path}")
    print(f"Chunks saved to: {chunks_path}")
    print("Vector store build completed successfully!")

if __name__ == "__main__":
    try:
        build_index()
    except Exception as e:
        print(f"Error building index: {e}")
        import traceback
        traceback.print_exc()
