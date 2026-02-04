# RAG Application - Complete Documentation

## 🎯 Overview

This is a production-ready Retrieval-Augmented Generation (RAG) application that allows users to ingest documents, store them in a vector database, and query them with AI-powered answers including inline citations.

## 🏗️ Architecture

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│   Supabase   │
│   (React)   │      │  (FastAPI)  │      │  (pgvector)  │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ├────▶ Google AI (Embeddings)
                            ├────▶ Cohere (Reranking)
                            └────▶ Gemini (LLM Answer)
```

## 📂 Project Structure

```
Track_B_RAG/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration and settings
│   ├── chunker.py              # Text chunking logic
│   ├── embedder.py             # Google embedding integration
│   ├── database.py             # Supabase/pgvector integration
│   ├── reranker.py             # Cohere reranking
│   ├── llm.py                  # Gemini LLM answering
│   ├── file_processor.py       # PDF/TXT file processing
│   ├── requirements.txt        # Python dependencies
│   ├── render.yaml             # Render deployment config
│   ├── .env.example            # Environment variables template
│   └── DEPLOYMENT.md           # Backend deployment guide
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── IngestPanel.jsx       # Document ingestion UI
│   │   │   ├── IngestPanel.css
│   │   │   ├── QueryPanel.jsx        # Query interface
│   │   │   └── QueryPanel.css
│   │   ├── App.jsx             # Main application component
│   │   ├── App.css
│   │   ├── main.jsx            # React entry point
│   │   ├── index.css
│   │   └── api.js              # API client
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json             # Vercel deployment config
│   ├── .env.example            # Environment variables template
│   └── DEPLOYMENT.md           # Frontend deployment guide
│
├── database/
│   ├── schema.sql              # Supabase database schema
│   └── README.md               # Database setup instructions
│
└── README.md                   # This file
```

## 🚀 Quick Start Guide

### Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Google AI API Key**: Get from https://makersuite.google.com/app/apikey
3. **Cohere API Key**: Get from https://dashboard.cohere.com/api-keys
4. **Node.js**: Version 18+ for frontend
5. **Python**: Version 3.11+ for backend

### Step 1: Database Setup

1. Create a new Supabase project
2. Enable pgvector extension (Database → Extensions)
3. Run the SQL schema from `database/schema.sql` in SQL Editor
4. Note your `SUPABASE_URL` and `SUPABASE_SERVICE_KEY`

See [database/README.md](database/README.md) for detailed instructions.

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env with your credentials:
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_service_key
# GOOGLE_API_KEY=your_google_api_key
# COHERE_API_KEY=your_cohere_api_key

# Run the backend
python main.py
```

Backend will be available at http://localhost:8000

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with backend URL:
# VITE_BACKEND_URL=http://localhost:8000

# Run the frontend
npm run dev
```

Frontend will be available at http://localhost:3000

## 🔧 Configuration

### Backend Configuration (config.py)

Key parameters you can adjust:

- `embedding_model`: Google embedding model (default: text-embedding-004)
- `embedding_dimension`: Vector dimension (default: 768)
- `chunk_size`: Tokens per chunk (default: 1000)
- `chunk_overlap`: Token overlap between chunks (default: 150)
- `top_k_retrieval`: Initial retrieval count (default: 8)
- `top_k_rerank`: Final reranked documents (default: 4)

### Environment Variables

**Backend (.env):**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
GOOGLE_API_KEY=AIzaSy...
COHERE_API_KEY=xxx...
```

**Frontend (.env):**
```
VITE_BACKEND_URL=http://localhost:8000
```

## 📚 API Documentation

### POST /ingest

Ingest text or file into the knowledge base.

**Request (Text):**
```bash
curl -X POST http://localhost:8000/ingest \
  -F "text=Your document text here" \
  -F "source_name=my_document"
```

**Request (File):**
```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@document.pdf"
```

**Response:**
```json
{
  "message": "Content ingested successfully",
  "source": "document.pdf",
  "chunks_created": 15,
  "latency_ms": 2341
}
```

### POST /query

Query the knowledge base.

**Request:**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main topic?"}'
```

**Response:**
```json
{
  "answer": "The main topic is RAG systems [1]. They combine retrieval and generation [2].",
  "citations": [
    {
      "number": 1,
      "source": "document.pdf",
      "section": "Introduction",
      "content": "RAG systems are hybrid approaches..."
    },
    {
      "number": 2,
      "source": "document.pdf",
      "section": "Architecture",
      "content": "These systems retrieve relevant documents..."
    }
  ],
  "latency_ms": 1523,
  "input_tokens": 892,
  "output_tokens": 156
}
```

### GET /sources

Get all unique sources in the database.

**Response:**
```json
{
  "sources": ["document.pdf", "notes.txt", "pasted_text"],
  "count": 3
}
```

## 🧪 Testing the Application

### 1. Test Backend Health

```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "message": "RAG Application API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### 2. Test Ingestion

Create a test file `test.txt`:
```
Artificial Intelligence (AI) is transforming industries worldwide. 
Machine learning algorithms can process vast amounts of data to identify patterns.
Deep learning uses neural networks with multiple layers to achieve remarkable results.
```

Ingest it:
```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@test.txt"
```

### 3. Test Query

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is AI?"}'
```

## 🌐 Deployment

### Deploy Backend to Render

See [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)

Quick steps:
1. Push code to GitHub
2. Create new Web Service on Render
3. Connect repository
4. Add environment variables
5. Deploy

### Deploy Frontend to Vercel

See [frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md)

Quick steps:
1. Push code to GitHub
2. Import project on Vercel
3. Add VITE_BACKEND_URL environment variable
4. Deploy

## 🔍 How It Works

### Ingestion Pipeline

1. **Input**: User provides text or uploads PDF/TXT file
2. **Extraction**: Text is extracted from files
3. **Chunking**: Content is split into ~1000 token chunks with 150 token overlap
4. **Embedding**: Each chunk is converted to 768-dim vector using Google's text-embedding-004
5. **Storage**: Chunks and embeddings are stored in Supabase with pgvector

### Query Pipeline

1. **Query Embedding**: User question is embedded using same model
2. **Retrieval**: Top-8 most similar chunks retrieved via cosine similarity
3. **Reranking**: Cohere reranks to top-4 most relevant chunks
4. **Generation**: Gemini generates answer with inline citations [1], [2]
5. **Response**: Answer + cited source snippets returned to user

### LLM Prompt Template

The system uses this prompt structure (see `llm.py`):

```
You are a helpful AI assistant that answers questions based ONLY on the provided context.

INSTRUCTIONS:
1. Answer the question using ONLY the information from the context below
2. Cite sources inline using [1], [2], [3], etc.
3. If context doesn't contain relevant information, respond with: "I couldn't find relevant information..."
4. Do NOT make up information
5. Be concise and direct
6. Use multiple citations when needed

CONTEXT:
[1] Source: document.pdf | Section: Introduction
Content of first chunk...

[2] Source: document.pdf | Section: Methods
Content of second chunk...

QUESTION: {user_question}

ANSWER:
```

## 🛠️ Troubleshooting

### Backend Issues

**Import errors:**
```bash
# Ensure virtual environment is activated
# Reinstall dependencies
pip install -r requirements.txt
```

**Supabase connection fails:**
- Verify SUPABASE_URL and SUPABASE_SERVICE_KEY
- Check that pgvector extension is enabled
- Ensure schema.sql has been executed

**API key errors:**
- Verify all API keys are valid
- Check for trailing spaces in .env file
- Ensure keys have proper permissions

### Frontend Issues

**API calls failing:**
- Check VITE_BACKEND_URL is correct
- Ensure backend is running
- Check CORS settings in backend

**Build fails:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 Performance Optimization

### Database
- Index created on embedding column (ivfflat)
- Adjust `lists` parameter based on dataset size
- Consider partitioning for very large datasets

### Chunking
- Default 1000 tokens works for most documents
- Increase for dense technical content
- Decrease for FAQ-style content

### Retrieval
- top_k_retrieval=8 and top_k_rerank=4 balances quality/cost
- Increase for complex queries
- Decrease for faster responses

## 🔐 Security Best Practices

1. **Never commit .env files** - Use .env.example as template
2. **Use service_role key** for backend (not anon key)
3. **Enable CORS** only for your frontend domain in production
4. **Rotate API keys** regularly
5. **Enable Row Level Security** on Supabase tables in production
6. **Use HTTPS** for all deployed services

## 📈 Monitoring & Logging

### Backend Logs
- Check Render dashboard for application logs
- Monitor error rates and response times

### Frontend
- Use Vercel Analytics for performance metrics
- Monitor browser console for client errors

### Database
- Supabase Dashboard → Database → Usage
- Monitor query performance
- Check storage limits

## 🤝 Contributing

To extend this application:

1. **Add new document types**: Extend `file_processor.py`
2. **Change embedding model**: Update `config.py` and adjust dimension
3. **Modify chunking strategy**: Edit `chunker.py`
4. **Add authentication**: Implement JWT in FastAPI
5. **Add document management**: Create CRUD endpoints

## 📝 License

This project is provided as-is for educational and commercial use.

## 🙋 Support

For issues:
1. Check this documentation
2. Review deployment guides
3. Check API documentation
4. Review troubleshooting section

## 🎉 Success Checklist

- [ ] Supabase project created and configured
- [ ] pgvector extension enabled
- [ ] Database schema executed successfully
- [ ] All API keys obtained and configured
- [ ] Backend running locally
- [ ] Frontend running locally
- [ ] Successfully ingested test document
- [ ] Successfully queried and got answer with citations
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Production environment variables configured
- [ ] End-to-end test in production successful

Congratulations! Your RAG application is ready! 🚀
