# Legal RAG System with Modern UI

This project combines a Python-based RAG (Retrieval-Augmented Generation) system with a modern React frontend and Node.js backend, providing an intelligent legal assistant interface.

## Features

- **RAG System**: Powered by Google Gemini AI with FAISS vector search
- **Legal Knowledge Base**: Includes Indian Constitution, Consumer Protection Act, and landmark cases
- **Modern UI**: React-based chat interface with Tailwind CSS
- **Hybrid Architecture**: Python RAG service + Node.js API + React frontend
- **Real-time Chat**: Interactive legal consultation interface

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Node.js Backend│    │ Python RAG      │
│   (Port 5173)   │◄──►│  (Port 3001)    │◄──►│ Service         │
│                 │    │                 │    │ (Port 5001)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn
- Google Gemini API key
- Google Custom Search API key and CSE ID

## Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
GOOGLE_API_KEY="your_google_api_key_here"
CSE_ID="your_custom_search_engine_id_here"
```

## Quick Start

### Option 1: Use the startup script (Recommended)

```bash
# Make the script executable (first time only)
chmod +x start_services.sh

# Start all services
./start_services.sh
```

### Option 2: Manual startup

#### 1. Start Python RAG Service
```bash
cd backend
pip install -r requirements.txt
python3 rag_service.py
```

#### 2. Start Node.js Backend (in new terminal)
```bash
cd backend
npm install
npm run dev
```

#### 3. Start React Frontend (in new terminal)
```bash
cd Frontend
npm install
npm run dev
```

## Access Points

- **Frontend**: http://localhost:5173
- **Node.js Backend**: http://localhost:3001
- **Python RAG Service**: http://localhost:5001

## API Endpoints

### Chat Endpoint
- **POST** `/api/chat`
- **Body**: `{ "history": [{"role": "user", "content": "question"}] }`
- **Response**: Structured legal analysis or conversational response

### Health Checks
- **GET** `/health` - Node.js backend health
- **GET** `/api/rag-health` - RAG service health

## RAG System Features

### Intent Analysis
- Automatically determines if a question needs structured analysis or conversational response
- Optimizes search queries based on conversation context

### Knowledge Sources
- **Local Documents**: Constitution articles, Consumer Protection Act, landmark cases
- **Web Search**: Real-time legal information from Google Custom Search

### Response Types
1. **Structured Responses**: Detailed legal analysis with:
   - Summary of rights
   - Relevant acts and articles
   - Similar case law
   - Next steps

2. **Conversational Responses**: Natural follow-up answers

## File Structure

```
├── Frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main app component
│   └── package.json
├── backend/                 # Node.js backend
│   ├── src/
│   │   └── index.js        # Main server file
│   ├── rag_service.py      # Python RAG service
│   └── package.json
├── rag_backup/              # RAG system files
│   ├── corpus/             # Legal documents
│   ├── vector_store/       # FAISS index and chunks
│   ├── build_index.py      # Index building script
│   └── rag_handler.py      # RAG logic
├── start_services.sh        # Startup script
└── README.md               # This file
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3001, 5001, and 5173 are available
2. **API key errors**: Verify your `.env` file has correct API keys
3. **Vector store missing**: Run `python3 rag_backup/build_index.py` to rebuild

### Health Checks

```bash
# Check Node.js backend
curl http://localhost:3001/health

# Check RAG service
curl http://localhost:3001/api/rag-health

# Check Python RAG service directly
curl http://localhost:5001/health
```

### Rebuilding Vector Store

If you need to rebuild the legal knowledge base:

```bash
cd rag_backup
python3 build_index.py
```

## Development

### Adding New Legal Documents

1. Add `.txt` files to `rag_backup/corpus/`
2. Run `python3 rag_backup/build_index.py`
3. Restart the Python RAG service

### Modifying the UI

- Edit components in `Frontend/src/components/`
- Update pages in `Frontend/src/pages/`
- Modify styles in `Frontend/src/index.css`

### Extending the Backend

- Add new routes in `backend/src/index.js`
- Extend RAG functionality in `backend/rag_service.py`

## License

This project is for educational and research purposes.

## Support

For issues or questions, please check the troubleshooting section or create an issue in the repository.
