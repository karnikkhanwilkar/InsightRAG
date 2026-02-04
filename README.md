# RAG Application - Complete Documentation

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Google AI](https://img.shields.io/badge/Google_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![Cohere](https://img.shields.io/badge/Cohere-39594D?style=for-the-badge&logo=cohere&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## Overview

A production-ready Retrieval-Augmented Generation (RAG) application that enables document ingestion, vector-based semantic search, and AI-powered question answering with inline citations and source transparency.

## Architecture

### System Design

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│   Frontend  │─────▶│   Backend   │─────▶│   Supabase   │
│   (React)   │      │  (FastAPI)  │      │  (pgvector)  │
└─────────────┘      └─────────────┘      └──────────────┘
                            │
                            ├────▶ Google AI (Embeddings)
                            ├────▶ Cohere (Reranking)
                            └────▶ Gemini (LLM Generation)
```

### Technology Stack

**Backend:**
- Python 3.11+
- FastAPI web framework
- Supabase (PostgreSQL + pgvector)
- Google AI text-embedding-004 (768 dimensions)
- Cohere rerank-english-v3.0
- Gemini 1.5 Flash for answer generation

**Frontend:**
- React 18
- Vite build tool
- Tailwind CSS 3
- Framer Motion for animations
- Lucide React icons

**Deployment:**
- Backend: Render
- Frontend: Vercel
- Database: Supabase Cloud

## Project Structure

```
Track_B_RAG/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── config.py               # Configuration management
│   ├── chunker.py              # Text chunking logic
│   ├── embedder.py             # Google embedding integration
│   ├── database.py             # Supabase vector store operations
│   ├── reranker.py             # Cohere reranking integration
│   ├── llm.py                  # Gemini LLM generation
│   ├── file_processor.py       # PDF/TXT file processing
│   ├── requirements.txt        # Python dependencies
│   ├── render.yaml             # Render deployment configuration
│   ├── .env.example            # Environment variables template
│   └── venv/                   # Python virtual environment
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # Application header
│   │   │   ├── IngestCard.jsx          # Document ingestion UI
│   │   │   ├── QueryBox.jsx            # Question input interface
│   │   │   ├── AnswerPanel.jsx         # AI answer display
│   │   │   ├── SourcesPanel.jsx        # Citation sources display
│   │   │   └── MetricsBar.jsx          # Performance metrics
│   │   ├── api/
│   │   │   └── api.js                  # Backend API client
│   │   ├── App.jsx                     # Main application component
│   │   ├── main.jsx                    # React entry point
│   │   └── index.css                   # Global styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json                     # Vercel deployment config
│   └── .env.example                    # Environment variables template
│
├── database/
│   ├── schema.sql                      # PostgreSQL schema with pgvector
│   ├── fix_search_function.sql         # Vector similarity search function
│   └── diagnostics.sql                 # Database health check queries
│
└── README.md                           # This file
```

## Installation Guide

### Prerequisites

**Required Accounts:**
- Supabase account (https://supabase.com)
- Google AI Studio API key (https://makersuite.google.com/app/apikey)
- Cohere API key (https://dashboard.cohere.com/api-keys)

**Required Software:**
- Node.js 18.0.0 or higher
- Python 3.11.0 or higher
- Git

### Database Setup

**1. Create Supabase Project**

1. Sign in to Supabase Dashboard
2. Create new project
3. Note your project URL and service role key

**2. Enable pgvector Extension**

```sql
-- In Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;
```

**3. Execute Database Schema**

Run the contents of `database/schema.sql` in Supabase SQL Editor:

```sql
-- Creates documents table with vector column
-- Creates ivfflat index for similarity search
-- Creates match_documents function for vector queries
```

**4. Verify Setup**

```sql
-- Check if extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if table exists
SELECT COUNT(*) FROM documents;

-- Check if function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'match_documents';
```

### Backend Setup

**1. Navigate to Backend Directory**

```bash
cd backend
```

**2. Create Virtual Environment**

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

**3. Install Dependencies**

```bash
pip install -r requirements.txt
```

**4. Configure Environment Variables**

Create `.env` file in backend directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
GOOGLE_API_KEY=your_google_ai_api_key
COHERE_API_KEY=your_cohere_api_key
PORT=8000
```

**5. Start Backend Server**

```bash
python main.py
```

Server will start at `http://localhost:8000`

**6. Verify Backend**

```bash
curl http://localhost:8000/
```

Expected response:
```json
{
  "message": "RAG API is running",
  "version": "1.0.0"
}
```

### Frontend Setup

**1. Navigate to Frontend Directory**

```bash
cd frontend
```

**2. Install Dependencies**

```bash
npm install
```

**3. Configure Environment Variables**

Create `.env` file in frontend directory:

```env
VITE_BACKEND_URL=http://localhost:8000
```

**4. Start Development Server**

```bash
npm run dev
```

Application will be available at `http://localhost:3000`

## Configuration

### Backend Configuration

Edit `backend/config.py` to adjust:

```python
class Settings(BaseSettings):
    # Database
    supabase_url: str
    supabase_service_key: str
    
    # API Keys
    google_api_key: str
    cohere_api_key: str
    
    # Embedding Configuration
    embedding_model: str = "gemini-embedding-001"
    embedding_dimension: int = 768
    
    # Chunking Strategy
    chunk_size: int = 1000          # tokens per chunk
    chunk_overlap: int = 150        # token overlap between chunks
    
    # Retrieval Configuration
    top_k_retrieval: int = 8        # initial retrieval count
    top_k_rerank: int = 4           # final reranked count
    
    # LLM Configuration
    llm_model: str = "gemini-1.5-flash"
    llm_temperature: float = 0.3
```

### Environment Variables

**Backend (.env):**

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (not anon key) | `eyJhbGc...` |
| `GOOGLE_API_KEY` | Google AI Studio API key | `AIzaSy...` |
| `COHERE_API_KEY` | Cohere API key | `xxx...` |
| `PORT` | Server port (optional) | `8000` |

**Frontend (.env):**

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:8000` |

## API Reference

### Document Ingestion

**Endpoint:** `POST /ingest`

**Description:** Ingest text or file content into the knowledge base.

**Request (Text Input):**

```bash
curl -X POST http://localhost:8000/ingest \
  -H "Content-Type: multipart/form-data" \
  -F "text=Your document text here"
```

**Request (File Upload):**

```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@document.pdf"
```

**Response:**

```json
{
  "message": "Successfully ingested content",
  "source": "document.pdf",
  "chunks_created": 15,
  "latency_ms": 2341,
  "metadata": {
    "title": "document.pdf",
    "total_length": 15000,
    "embedding_model": "text-embedding-004"
  }
}
```

**Supported File Types:**
- PDF (`.pdf`)
- Text (`.txt`)
- Direct text input

### Query Documents

**Endpoint:** `POST /query`

**Description:** Query the knowledge base and receive AI-generated answer with citations.

**Request:**

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is the main topic of the document?"
  }'
```

**Response:**

```json
{
  "answer": "The main topic is Retrieval-Augmented Generation [1]. RAG systems combine retrieval and generation techniques [2].",
  "citations": [
    {
      "number": 1,
      "source": "document.pdf",
      "content": "RAG systems are hybrid approaches that...",
      "relevance_score": 0.95
    },
    {
      "number": 2,
      "source": "document.pdf",
      "content": "These systems retrieve relevant documents...",
      "relevance_score": 0.92
    }
  ],
  "latency_ms": 1523,
  "chunks_retrieved": 4,
  "tokens_used": 1048,
  "reranker_used": true,
  "llm_model": "gemini-1.5-flash",
  "warning": null
}
```

**Response with Warning (No Relevant Documents):**

```json
{
  "answer": "Based on general knowledge: Quantum computing is...",
  "citations": [],
  "latency_ms": 892,
  "chunks_retrieved": 0,
  "tokens_used": 234,
  "reranker_used": false,
  "llm_model": "gemini-1.5-flash",
  "warning": "Your documents don't contain specific information about this query. This answer is generated from general AI knowledge. For more accurate answers, please upload relevant documentation."
}
```

### List Sources

**Endpoint:** `GET /sources`

**Description:** Retrieve all unique document sources in the database.

**Request:**

```bash
curl http://localhost:8000/sources
```

**Response:**

```json
{
  "sources": [
    {
      "source": "document.pdf",
      "chunk_count": 15,
      "created_at": "2026-02-04T10:30:00Z"
    },
    {
      "source": "notes.txt",
      "chunk_count": 8,
      "created_at": "2026-02-04T10:45:00Z"
    }
  ],
  "total_sources": 2,
  "total_chunks": 23
}
```

## System Architecture

### Ingestion Pipeline

**Step 1: Input Processing**
- Accept text input or file upload (PDF/TXT)
- Extract text from PDF using PyPDF2
- Decode text files with UTF-8 encoding

**Step 2: Text Chunking**
- Split text into semantic chunks
- Default: 1000 tokens per chunk
- 150 token overlap between chunks
- Preserve sentence boundaries when possible
- Maintain document structure metadata

**Step 3: Embedding Generation**
- Generate 768-dimensional vectors using Google text-embedding-004
- Batch processing for efficiency
- Error handling and retry logic

**Step 4: Storage**
- Store chunks in Supabase PostgreSQL
- Each chunk includes:
  - Content text
  - Embedding vector
  - Source metadata (filename, timestamp)
  - Chunk index for ordering

**Step 5: Indexing**
- Create ivfflat index on embedding column
- Optimize for cosine similarity search
- Balance between speed and accuracy

### Query Pipeline

**Step 1: Query Embedding**
- Convert user question to 768-dim vector
- Use same embedding model as ingestion

**Step 2: Vector Similarity Search**
- Perform cosine similarity search using pgvector
- Retrieve top-8 most similar chunks
- Execute via Supabase RPC call to `match_documents` function

**Step 3: Reranking**
- Pass 8 retrieved chunks to Cohere reranker
- Rerank based on semantic relevance to query
- Select top-4 most relevant chunks

**Step 4: Answer Generation**
- Construct prompt with:
  - System instructions
  - Retrieved context chunks
  - User question
  - Citation guidelines
- Call Gemini 1.5 Flash LLM
- Parse inline citations from response

**Step 5: Response Assembly**
- Format answer with citations
- Extract source snippets
- Calculate performance metrics
- Return structured response

### Fallback Mechanism

When no relevant documents are found:

1. Detect low relevance scores or empty results
2. Generate answer using LLM's general knowledge
3. Add clear warning message
4. Suggest uploading relevant documentation
5. Return response with warning flag

## LLM Prompt Engineering

### Primary Prompt (With Context)

```
You are a Retrieval-Augmented Generation (RAG) assistant. Answer the question using ONLY the provided context.

Context:
[1] Source: document.pdf
Content: First relevant chunk text...

[2] Source: notes.txt
Content: Second relevant chunk text...

Question: {user_question}

Instructions:
- Answer ONLY using information from the context above
- Cite sources using [1], [2], etc. inline in your answer
- If the context doesn't contain enough information, say: "I couldn't find relevant information in the provided documents."
- Do NOT use external knowledge
- Be concise and accurate
- Use multiple citations when information comes from multiple sources

Answer:
```

### Fallback Prompt (General Knowledge)

```
You are a helpful AI assistant. Answer the following question using your general knowledge.

Question: {user_question}

Instructions:
- Provide a clear, accurate answer based on your training
- Be concise but informative
- If you're uncertain, acknowledge it
- Do NOT make up information
- Start with: "Based on general knowledge: "

Answer:
```

## Testing

### Unit Testing

**Test Backend Health:**

```bash
curl http://localhost:8000/
```

Expected: Status 200 with JSON response

**Test Database Connection:**

```bash
curl http://localhost:8000/sources
```

Expected: List of ingested sources

### Integration Testing

**Test Document Ingestion:**

Create `test_document.txt`:
```
Machine learning is a subset of artificial intelligence that enables computers to learn from data without explicit programming. Deep learning uses neural networks with multiple layers to process complex patterns. Natural language processing applies ML techniques to understand and generate human language.
```

Ingest:
```bash
curl -X POST http://localhost:8000/ingest \
  -F "file=@test_document.txt"
```

**Test Query Flow:**

```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is machine learning?"}'
```

Expected: Answer with citations from test document

### End-to-End Testing

1. Open frontend at `http://localhost:3000`
2. Upload `test_document.txt` via UI
3. Wait for success message
4. Enter question: "What is deep learning?"
5. Click "Ask AI"
6. Verify:
   - Answer appears with inline citations
   - Source snippets shown below
   - Metrics displayed (latency, chunks, tokens)
   - Citations clickable and highlight sources

## Deployment

### Backend Deployment (Render)

**1. Prepare Repository**

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/rag-app.git
git push -u origin main
```

**2. Create Render Web Service**

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name:** `rag-backend`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free (or paid for production)

**3. Add Environment Variables**

In Render dashboard, Environment tab:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
GOOGLE_API_KEY=your_google_api_key
COHERE_API_KEY=your_cohere_api_key
```

**4. Deploy**

Click "Create Web Service" and wait 3-5 minutes for deployment.

Your backend will be available at: `https://rag-backend.onrender.com`

**5. Verify Deployment**

```bash
curl https://rag-backend.onrender.com/
```

### Frontend Deployment (Vercel)

**1. Update Environment Variable**

Edit `frontend/.env`:

```env
VITE_BACKEND_URL=https://rag-backend.onrender.com
```

**2. Deploy via Vercel CLI**

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

**3. Configure via Vercel Dashboard**

Alternative to CLI:

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

4. Add Environment Variable:
   ```
   VITE_BACKEND_URL=https://rag-backend.onrender.com
   ```

5. Click "Deploy"

Your frontend will be available at: `https://your-app.vercel.app`

**4. Update CORS**

Edit `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://your-app.vercel.app",  # Your actual Vercel URL
        "https://*.vercel.app"          # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push to trigger automatic redeployment.

## Performance Optimization

### Database Optimization

**Index Configuration:**

```sql
-- Adjust lists parameter based on dataset size
-- Formula: lists = rows / 1000 (minimum 10)
CREATE INDEX documents_embedding_idx ON documents 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);
```

**Query Optimization:**

- Use prepared statements for repeated queries
- Monitor query execution time
- Consider connection pooling for high traffic

### Chunking Strategy

**Adjust based on content type:**

| Content Type | Chunk Size | Overlap | Rationale |
|-------------|-----------|---------|-----------|
| Technical docs | 1000 | 150 | Preserve context |
| FAQs | 500 | 50 | Shorter Q&A pairs |
| Legal documents | 1500 | 200 | Complex sentences |
| Chat logs | 300 | 30 | Short messages |

### Retrieval Configuration

**Balance quality vs. speed:**

```python
# High quality (slower, more expensive)
top_k_retrieval = 12
top_k_rerank = 6

# Balanced (recommended)
top_k_retrieval = 8
top_k_rerank = 4

# Fast (less comprehensive)
top_k_retrieval = 5
top_k_rerank = 3
```

### Caching Strategy

Implement caching for:
- Frequently asked questions
- Embedding generation for common queries
- Reranking results for similar queries

## Monitoring and Logging

### Backend Monitoring

**Render Dashboard:**
- Navigate to your service
- Click "Logs" tab
- Monitor:
  - Application startup
  - Request/response logs
  - Error traces
  - Performance metrics

**Key Metrics to Track:**
- Request latency (target: <2s)
- Error rate (target: <1%)
- Memory usage
- CPU usage

### Frontend Monitoring

**Vercel Analytics:**
- Deployment dashboard
- Real-time logs
- Performance metrics
- Core Web Vitals

**Browser Console:**
- Network requests
- API response times
- JavaScript errors
- Component render times

### Database Monitoring

**Supabase Dashboard:**
- Database → Usage
- Monitor:
  - Query performance
  - Storage usage
  - Connection count
  - Index efficiency

**Query Performance:**

```sql
-- Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan 
FROM pg_stat_user_indexes 
ORDER BY idx_scan;
```

## Security Best Practices

### API Key Management

- Never commit `.env` files to version control
- Use separate keys for development and production
- Rotate keys quarterly
- Limit key permissions to minimum required
- Use environment-specific keys

### Database Security

**Row Level Security (RLS):**

```sql
-- Enable RLS on documents table (production)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only
CREATE POLICY "Service role can access all documents"
ON documents
FOR ALL
TO service_role
USING (true);
```

**Connection Security:**
- Use service_role key (not anon key) for backend
- Enable SSL for database connections
- Restrict database access to backend IP only
- Use connection pooling with limits

### CORS Configuration

Production CORS should be strict:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-production-domain.com"  # Specific domain only
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Only required methods
    allow_headers=["Content-Type", "Authorization"],
)
```

### Input Validation

All endpoints validate:
- File size limits (max 10MB)
- File type restrictions
- Text length limits
- Query parameter sanitization
- SQL injection prevention (via parameterized queries)

## Troubleshooting

### Common Backend Issues

**Issue: Import errors on startup**

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Reinstall dependencies
pip install -r requirements.txt
```

**Issue: Supabase connection fails**

```
Error: Could not connect to Supabase
```

**Solution:**
- Verify `SUPABASE_URL` format: `https://xxx.supabase.co`
- Verify `SUPABASE_SERVICE_KEY` is the service_role key, not anon key
- Check network connectivity
- Verify project is active in Supabase dashboard

**Issue: Embedding API errors**

```
Error: 401 Unauthorized - Google AI
```

**Solution:**
- Verify `GOOGLE_API_KEY` is valid
- Check API quota in Google AI Studio
- Ensure no trailing spaces in `.env` file
- Verify key has Gemini API enabled

### Common Frontend Issues

**Issue: API calls return CORS errors**

```
Access blocked by CORS policy
```

**Solution:**
- Add frontend URL to backend CORS `allow_origins`
- Restart backend after CORS changes
- Clear browser cache
- Verify `VITE_BACKEND_URL` is correct

**Issue: Build fails with Vite errors**

```
Error: Cannot find module
```

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite

# Rebuild
npm run build
```

**Issue: Environment variables not working**

```
VITE_BACKEND_URL is undefined
```

**Solution:**
- Ensure `.env` file exists in `frontend/` directory
- Variable must start with `VITE_`
- Restart dev server after `.env` changes
- Check for typos in variable name

### Database Issues

**Issue: pgvector extension not found**

```
ERROR: type "vector" does not exist
```

**Solution:**
```sql
-- Enable extension in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Issue: match_documents function doesn't exist**

```
ERROR: function match_documents does not exist
```

**Solution:**
- Run `database/fix_search_function.sql` in Supabase SQL Editor
- Verify function exists:
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name = 'match_documents';
```

**Issue: Slow similarity search**

**Solution:**
- Rebuild ivfflat index with appropriate lists parameter
- Analyze query execution plan
- Consider increasing `probes` parameter
- Monitor database CPU/memory usage

## Scaling Considerations

### Horizontal Scaling

**Backend:**
- Render supports auto-scaling on paid plans
- Use load balancer for multiple instances
- Implement stateless design (no session storage)
- Use connection pooling to database

**Frontend:**
- Vercel handles automatic scaling
- CDN distribution included
- Edge functions for API routes

### Vertical Scaling

**Database:**
- Upgrade Supabase plan for more resources
- Increase connection pool size
- Optimize queries and indexes
- Consider read replicas for heavy read workloads

**Backend:**
- Upgrade Render instance type
- Increase worker processes
- Optimize memory usage
- Implement caching layer (Redis)

### Cost Optimization

**API Costs (Monthly estimates):**
- Google AI Embeddings: $0.00001 per 1K tokens
- Cohere Reranking: $0.002 per request
- Gemini LLM: $0.0001 per 1K input tokens, $0.0004 per 1K output

**Example calculation:**
- 1000 documents ingested (avg 500 tokens each): $0.005
- 10,000 queries per month (avg 200 tokens each): $20-30
- Total estimated: $30-50/month for moderate usage

**Free Tier Limits:**
- Render: 750 hours/month (sufficient for one instance)
- Vercel: 100GB bandwidth/month
- Supabase: 500MB database, 2GB bandwidth

## Extending the Application

### Adding New Document Types

Edit `backend/file_processor.py`:

```python
def process_file(file_content: bytes, filename: str) -> str:
    """Process various file types"""
    
    if filename.endswith('.pdf'):
        return extract_text_from_pdf(file_content)
    
    elif filename.endswith(('.txt', '.md')):
        return file_content.decode('utf-8')
    
    elif filename.endswith('.docx'):
        # Add docx support
        import docx
        doc = docx.Document(io.BytesIO(file_content))
        return '\n'.join([paragraph.text for paragraph in doc.paragraphs])
    
    elif filename.endswith('.csv'):
        # Add CSV support
        import csv
        # Implementation here
    
    else:
        raise ValueError(f"Unsupported file type: {filename}")
```

### Implementing Authentication

Add JWT authentication to FastAPI:

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=["HS256"]
        )
        return payload
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token"
        )

@app.post("/query")
async def query_documents(
    request: QueryRequest,
    user=Depends(verify_token)  # Protected endpoint
):
    # Implementation
```

### Adding Document Management

Create CRUD endpoints:

```python
@app.get("/documents")
async def list_documents():
    """List all documents"""
    documents = vector_store.list_all_documents()
    return {"documents": documents}

@app.delete("/documents/{source}")
async def delete_document(source: str):
    """Delete a document and all its chunks"""
    vector_store.delete_by_source(source)
    return {"message": f"Deleted document: {source}"}

@app.get("/documents/{source}")
async def get_document(source: str):
    """Get document details"""
    chunks = vector_store.get_chunks_by_source(source)
    return {
        "source": source,
        "chunk_count": len(chunks),
        "chunks": chunks
    }
```

### Implementing Query History

Add database table for query logs:

```sql
CREATE TABLE query_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT,
    latency_ms INTEGER,
    chunks_retrieved INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_query_history_created ON query_history(created_at DESC);
```

Track queries in backend:

```python
@app.post("/query")
async def query_documents(request: QueryRequest):
    # Generate answer
    result = generate_answer(...)
    
    # Log query
    vector_store.log_query(
        question=request.question,
        answer=result["answer"],
        latency_ms=latency,
        chunks_retrieved=len(chunks)
    )
    
    return result
```

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured correctly
- [ ] Database schema executed successfully
- [ ] pgvector extension enabled
- [ ] Indexes created on embedding column
- [ ] Backend tested locally end-to-end
- [ ] Frontend tested locally end-to-end
- [ ] All API endpoints validated
- [ ] Error handling implemented
- [ ] Input validation on all endpoints
- [ ] Logging configured properly

### Deployment

- [ ] Backend deployed to Render successfully
- [ ] Frontend deployed to Vercel successfully
- [ ] Production environment variables set
- [ ] CORS configured with production URLs
- [ ] Database connection verified from backend
- [ ] All API integrations working (Google AI, Cohere)
- [ ] End-to-end test in production environment
- [ ] Performance metrics within acceptable range

### Post-Deployment

- [ ] Monitoring dashboards configured
- [ ] Alerting set up for critical errors
- [ ] Backup strategy implemented
- [ ] Documentation updated with production URLs
- [ ] Team trained on system operations
- [ ] Incident response plan documented
- [ ] Cost monitoring enabled
- [ ] Security audit completed

### Ongoing Maintenance

- [ ] Monitor error rates weekly
- [ ] Review performance metrics monthly
- [ ] Rotate API keys quarterly
- [ ] Update dependencies monthly
- [ ] Review and optimize costs monthly
- [ ] Backup database weekly
- [ ] Review security logs weekly
- [ ] Test disaster recovery quarterly

## Support and Resources

### Official Documentation

- **FastAPI:** https://fastapi.tiangolo.com
- **Supabase:** https://supabase.com/docs
- **Google AI:** https://ai.google.dev/docs
- **Cohere:** https://docs.cohere.com
- **Render:** https://render.com/docs
- **Vercel:** https://vercel.com/docs

### Common Resources

- **pgvector GitHub:** https://github.com/pgvector/pgvector
- **React Documentation:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion

### Community Support

For issues and questions:
1. Review this documentation thoroughly
2. Check deployment guides
3. Review troubleshooting section
4. Consult official API documentation
5. Search GitHub issues for similar problems

## License

This project is provided as-is for educational and commercial use without restrictions.

## Version History

### Version 1.0.0 (Current)
- Initial release
- Document ingestion (text, PDF, TXT)
- Vector similarity search with pgvector
- Cohere reranking integration
- Gemini LLM answer generation
- Inline citation support
- Source transparency
- General knowledge fallback with warnings
- Production deployment configurations

---

**Built with:** Python, FastAPI, React, Supabase, Google AI, Cohere, Gemini

**Last Updated:** February 2026
