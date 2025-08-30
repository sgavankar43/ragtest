#!/bin/bash

# Start both services for the Legal RAG System

echo "Starting Legal RAG System Services..."

# Function to cleanup background processes on exit
cleanup() {
    echo "Shutting down services..."
    kill $PYTHON_PID $NODE_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start Python RAG Service
echo "Starting Python RAG Service on port 5001..."
cd backend
python3 rag_service.py &
PYTHON_PID=$!

# Wait a moment for Python service to start
sleep 3

# Start Node.js Backend
echo "Starting Node.js Backend on port 3001..."
npm install
npm run dev &
NODE_PID=$!

# Wait a moment for Node.js service to start
sleep 3

# Start Frontend
echo "Starting Frontend on port 5173..."
cd ../Frontend
npm install
npm run dev &
FRONTEND_PID=$!

echo ""
echo "All services are starting up..."
echo "Python RAG Service: http://localhost:5001"
echo "Node.js Backend: http://localhost:3001"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for all processes
wait
