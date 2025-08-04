# /backend/scripts/build_index.py

import os
import sys
import fitz  # PyMuPDF
import docx2txt
import numpy as np
import faiss
import json
from dotenv import load_dotenv
import google.generativeai as genai
import time

# --- Robust Path Configuration ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(SCRIPT_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)

# Define all paths relative to the project root
CORPUS_DIR = os.path.join(PROJECT_ROOT, "backend", "corpus")
VECTOR_STORE_DIR = os.path.join(PROJECT_ROOT, "backend", "vector_store")
FAISS_INDEX_PATH = os.path.join(VECTOR_STORE_DIR, "faiss_index.bin")
LEGAL_CHUNKS_PATH = os.path.join(VECTOR_STORE_DIR, "legal_chunks.json")
CHUNK_SIZE = 500
EMBEDDING_MODEL = "models/text-embedding-004"

# --- Setup Gemini Client ---
dotenv_path = os.path.join(PROJECT_ROOT, '.env')
load_dotenv(dotenv_path=dotenv_path)

gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY not found. Please create a .env file in the project root.")
genai.configure(api_key=gemini_api_key)

def get_text_from_files(directory):
    if not os.path.exists(directory):
        print(f"Error: The corpus directory was not found at '{directory}'")
        print("Please create it and add your documents.")
        sys.exit(1)

    all_texts = []
    print(f"Scanning files in '{directory}'...")
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        text = ""
        try:
            if filename.lower().endswith(".pdf"):
                with fitz.open(filepath) as doc:
                    text = "".join(page.get_text() for page in doc)
            elif filename.lower().endswith(".docx"):
                text = docx2txt.process(filepath)
            # --- THIS IS THE NEW PART ---
            elif filename.lower().endswith(".txt"):
                with open(filepath, 'r', encoding='utf-8') as f:
                    text = f.read()
            # --------------------------

            if text:
                all_texts.append({"source": filename, "content": text})
                print(f"  - Successfully parsed {filename}")
        except Exception as e:
            print(f"  - Failed to parse {filename}: {e}")
    return all_texts

def chunk_texts(texts):
    chunks = []
    for doc in texts:
        content = doc['content'].replace('\n', ' ').strip()
        for i in range(0, len(content), CHUNK_SIZE):
            chunk_text = content[i:i + CHUNK_SIZE]
            chunks.append({"source": doc['source'], "text": chunk_text})
    print(f"\nSplit {len(texts)} documents into {len(chunks)} chunks.")
    return chunks

def generate_embeddings(chunks):
    print(f"Generating embeddings with Gemini ({EMBEDDING_MODEL})... (This may take a moment)")
    texts_to_embed = [chunk['text'] for chunk in chunks]
    
    try:
        result = genai.embed_content(model=EMBEDDING_MODEL, content=texts_to_embed)
        embeddings = np.array(result['embedding'])
        print("Embeddings generated. Shape:", embeddings.shape)
        return embeddings
    except Exception as e:
        print(f"An error occurred during embedding generation: {e}")
        return None

def build_and_save_index(embeddings, chunks):
    if not os.path.exists(VECTOR_STORE_DIR):
        os.makedirs(VECTOR_STORE_DIR)

    d = embeddings.shape[1]
    index = faiss.IndexFlatL2(d)
    index.add(embeddings.astype('float32'))

    print(f"\nBuilding FAISS index with {index.ntotal} vectors.")
    faiss.write_index(index, FAISS_INDEX_PATH)
    print(f"FAISS index saved to: {FAISS_INDEX_PATH}")

    with open(LEGAL_CHUNKS_PATH, 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=4, ensure_ascii=False)
    print(f"Legal text chunks saved to: {LEGAL_CHUNKS_PATH}")

def main():
    print("Starting the index building process...")
    raw_documents = get_text_from_files(CORPUS_DIR)
    if not raw_documents:
        print("No documents found in corpus. Exiting.")
        return

    text_chunks = chunk_texts(raw_documents)
    embeddings = generate_embeddings(text_chunks)
    
    if embeddings is not None:
        build_and_save_index(embeddings, text_chunks)
        print("\n--- Indexing complete! ---")
    else:
        print("\n--- Indexing failed due to embedding error. ---")

if __name__ == "__main__":
    main()
