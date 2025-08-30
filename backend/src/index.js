import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// RAG service configuration
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:5001';

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Node.js Backend' });
});

// Proxy chat requests to RAG service
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received chat request:', JSON.stringify(req.body, null, 2));
    
    if (!req.body || !req.body.history) {
      return res.status(400).json({ error: 'Request body must contain history array' });
    }
    
    const response = await axios.post(`${RAG_SERVICE_URL}/api/chat`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding request to RAG service:', error.message);
    res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
});

// Health check for RAG service
app.get('/api/rag-health', async (req, res) => {
  try {
    const response = await axios.get(`${RAG_SERVICE_URL}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ 
      status: 'unhealthy', 
      rag_service: 'unavailable',
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Node.js Backend running on port ${PORT}`);
  console.log(`RAG Service URL: ${RAG_SERVICE_URL}`);
});
