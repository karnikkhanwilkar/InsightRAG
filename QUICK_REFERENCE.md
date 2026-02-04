# Quick Reference Card

## 🚀 Essential Commands

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python main.py
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env: VITE_BACKEND_URL=http://localhost:8000
npm run dev
```

## 🔑 Required API Keys

| Service | URL | Purpose |
|---------|-----|---------|
| **Supabase** | https://supabase.com | Vector database |
| **Google AI** | https://makersuite.google.com/app/apikey | Embeddings & LLM |
| **Cohere** | https://dashboard.cohere.com/api-keys | Reranking |

## 📡 API Endpoints

```bash
# Health Check
GET http://localhost:8000/

# Ingest Text
POST http://localhost:8000/ingest
Body: form-data
  text: "Your content"
  source_name: "doc_name"

# Ingest File
POST http://localhost:8000/ingest
Body: form-data
  file: [PDF or TXT file]

# Query
POST http://localhost:8000/query
Body: JSON
  {"question": "Your question?"}

# List Sources
GET http://localhost:8000/sources
```

## 🗄️ Database Setup

```sql
-- In Supabase SQL Editor:

-- 1. Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Run full schema from database/schema.sql

-- 3. Verify
SELECT * FROM documents LIMIT 1;
```

## 🌐 Deployment

### Render (Backend)
1. Connect GitHub repo
2. Root: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, GOOGLE_API_KEY, COHERE_API_KEY

### Vercel (Frontend)
1. Import GitHub repo
2. Root: `frontend`
3. Framework: Vite
4. Build: `npm run build`
5. Add env var: VITE_BACKEND_URL=(your Render URL)

## 🧪 Test Commands

```bash
# Test backend health
curl http://localhost:8000/

# Test ingestion
curl -X POST http://localhost:8000/ingest \
  -F "text=Machine learning is AI" \
  -F "source_name=test"

# Test query
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is ML?"}'
```

## ⚙️ Configuration

### Backend (config.py)
```python
chunk_size = 1000           # Tokens per chunk
chunk_overlap = 150         # Token overlap
top_k_retrieval = 8         # Initial retrieval
top_k_rerank = 4           # After reranking
embedding_dimension = 768   # Vector size
```

### Environment Variables

**Backend .env:**
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
GOOGLE_API_KEY=AIzaSy...
COHERE_API_KEY=xxx...
```

**Frontend .env:**
```
VITE_BACKEND_URL=http://localhost:8000
```

## 📂 Key Files

| File | Purpose |
|------|---------|
| `backend/main.py` | FastAPI routes |
| `backend/llm.py` | Gemini answering |
| `backend/embedder.py` | Google embeddings |
| `backend/database.py` | Supabase integration |
| `frontend/src/App.jsx` | Main UI component |
| `database/schema.sql` | Database schema |

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check Python version (need 3.11+)
python --version

# Reinstall dependencies
pip install -r requirements.txt

# Check .env file exists and has valid keys
cat .env
```

### Frontend can't connect
```bash
# Check backend is running
curl http://localhost:8000/

# Check VITE_BACKEND_URL in frontend/.env
cat .env

# Restart frontend
npm run dev
```

### Database errors
```bash
# Verify pgvector is enabled in Supabase:
# Dashboard → Database → Extensions → vector (enabled)

# Re-run schema:
# Copy database/schema.sql to Supabase SQL Editor and run
```

## 📊 Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend** | React + Vite |
| **Backend** | Python + FastAPI |
| **Database** | Supabase (PostgreSQL + pgvector) |
| **Embeddings** | Google text-embedding-004 (768-dim) |
| **Reranking** | Cohere rerank-english-v3.0 |
| **LLM** | Gemini 1.5 Flash |
| **Backend Host** | Render |
| **Frontend Host** | Vercel |

## 📚 Documentation Files

- `README.md` - Complete documentation
- `SETUP_GUIDE.md` - Step-by-step setup
- `API_EXAMPLES.md` - API usage examples
- `PROMPT_TEMPLATE.md` - LLM prompt details
- `PROJECT_SUMMARY.md` - Build summary
- `backend/DEPLOYMENT.md` - Backend deployment
- `frontend/DEPLOYMENT.md` - Frontend deployment
- `database/README.md` - Database setup

## 🎯 Quick Test Flow

1. **Start backend**: `cd backend && python main.py`
2. **Start frontend**: `cd frontend && npm run dev`
3. **Open**: http://localhost:3000
4. **Ingest**: Paste text → Click "Ingest Text"
5. **Query**: Type question → Click "Ask"
6. **Verify**: Answer with citations [1], [2] + sources below

## 🔗 URLs

| Service | Local | Production |
|---------|-------|------------|
| Backend | http://localhost:8000 | https://your-app.onrender.com |
| Frontend | http://localhost:3000 | https://your-app.vercel.app |
| Supabase | - | https://app.supabase.com |

## 📈 Typical Performance

- **Ingestion**: 2-5 seconds (depends on doc size)
- **Query**: 1-3 seconds end-to-end
- **Embedding**: ~200ms
- **Retrieval**: ~100ms
- **Reranking**: ~300ms
- **LLM Generation**: ~1-2 seconds

## ⚠️ Important Notes

- Use **service_role** key (not anon) for Supabase backend
- **VITE_** prefix required for frontend env vars
- File types: PDF and TXT only
- Max chunk size: 1000 tokens (adjustable)
- Vector dimension: Must be 768 (match embedding model)

## ✅ Success Checklist

- [ ] All API keys obtained
- [ ] Supabase project created
- [ ] pgvector extension enabled
- [ ] Database schema executed
- [ ] Backend .env configured
- [ ] Backend running (port 8000)
- [ ] Frontend .env configured
- [ ] Frontend running (port 3000)
- [ ] Test ingestion successful
- [ ] Test query successful
- [ ] Citations displaying correctly

---

**Need help?** Check the detailed guides:
- Setup issues → `SETUP_GUIDE.md`
- API usage → `API_EXAMPLES.md`
- Deployment → `backend/DEPLOYMENT.md` + `frontend/DEPLOYMENT.md`
