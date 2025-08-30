#!/usr/bin/env python3
# test_rag.py

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check if required environment variables are set
required_vars = ['GEMINI_API_KEY', 'GOOGLE_API_KEY', 'CSE_ID']
missing_vars = []

for var in required_vars:
    if not os.getenv(var):
        missing_vars.append(var)

if missing_vars:
    print(f"Missing environment variables: {missing_vars}")
    print("Please check your .env file")
    sys.exit(1)

print("Environment variables check passed!")
print(f"GEMINI_API_KEY: {'✓' if os.getenv('GEMINI_API_KEY') else '✗'}")
print(f"GOOGLE_API_KEY: {'✓' if os.getenv('GOOGLE_API_KEY') else '✗'}")
print(f"CSE_ID: {'✓' if os.getenv('CSE_ID') else '✗'}")

# Check if vector store exists
vector_store_dir = "rag_backup/vector_store"
index_path = os.path.join(vector_store_dir, "faiss_index.bin")
chunks_path = os.path.join(vector_store_dir, "legal_chunks.json")

print(f"\nVector store check:")
print(f"FAISS index: {'✓' if os.path.exists(index_path) else '✗'}")
print(f"Legal chunks: {'✓' if os.path.exists(chunks_path) else '✗'}")

if os.path.exists(index_path) and os.path.exists(chunks_path):
    print("\nAll checks passed! The RAG system should work.")
else:
    print("\nVector store files missing. Please rebuild the index.")
