# Complete Setup Guide - Step by Step

This guide walks you through setting up the RAG application from scratch.

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] Computer with Windows, Mac, or Linux
- [ ] Internet connection
- [ ] Text editor or IDE (VS Code recommended)
- [ ] Git installed
- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] npm (comes with Node.js)

## Part 1: Get API Keys (15 minutes)

### 1.1 Google AI API Key

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key (starts with `AIzaSy...`)
5. Save it somewhere safe

### 1.2 Cohere API Key

1. Go to https://dashboard.cohere.com/
2. Sign up or sign in
3. Navigate to API Keys section
4. Click "Create Trial Key" or use existing key
5. Copy the key
6. Save it somewhere safe

### 1.3 Supabase Setup

1. Go to https://supabase.com
2. Sign up or sign in
3. Click "New Project"
4. Fill in:
   - Project name: `rag-app` (or your choice)
   - Database password: Generate a strong password
   - Region: Choose closest to you
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize
7. Go to Settings → API
8. Copy:
   - Project URL (this is your `SUPABASE_URL`)
   - Service role key (this is your `SUPABASE_SERVICE_KEY`)

## Part 2: Database Setup (10 minutes)

### 2.1 Enable pgvector Extension

1. In your Supabase dashboard
2. Go to **Database** → **Extensions**
3. Search for "vector"
4. Click the toggle to enable "vector"
5. Wait for confirmation

### 2.2 Run Schema SQL

1. Go to **SQL Editor** in Supabase dashboard
2. Click "New Query"
3. Copy ALL content from `database/schema.sql` in this project
4. Paste into the SQL editor
5. Click "Run" or press Ctrl+Enter
6. You should see "Success. No rows returned"

### 2.3 Verify Setup

Run this query in SQL Editor:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

You should see `documents` in the results.

## Part 3: Backend Setup (15 minutes)

### 3.1 Prepare Backend Files

```powershell
# Open PowerShell/Terminal
# Navigate to your project
cd C:\Users\Asus\Desktop\Track_B_RAG\backend

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\activate  # Windows PowerShell
# source venv/bin/activate  # Mac/Linux

# Verify activation (you should see (venv) in prompt)
```

### 3.2 Install Dependencies

```powershell
# Install all required packages
pip install -r requirements.txt

# This will take 2-3 minutes
# You should see "Successfully installed..." messages
```

### 3.3 Configure Environment

```powershell
# Create .env file
# On Windows:
copy .env.example .env

# On Mac/Linux:
# cp .env.example .env

# Now edit .env file with your actual values
notepad .env  # Windows
# nano .env   # Mac/Linux
```

Your `.env` should look like:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
GOOGLE_API_KEY=AIzaSy...
COHERE_API_KEY=xxx...
```

### 3.4 Test Backend

```powershell
# Run the backend
python main.py

# You should see:
# INFO:     Started server process
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

Open browser and go to: http://localhost:8000

You should see:
```json
{
  "message": "RAG Application API",
  "version": "1.0.0",
  ...
}
```

✅ If you see this, backend is working!

Keep the backend running in this terminal.

## Part 4: Frontend Setup (10 minutes)

### 4.1 Open New Terminal

```powershell
# Open a NEW PowerShell/Terminal window
# Don't close the backend terminal

# Navigate to frontend
cd C:\Users\Asus\Desktop\Track_B_RAG\frontend
```

### 4.2 Install Dependencies

```powershell
# Install npm packages
npm install

# This will take 1-2 minutes
# You should see a progress bar
```

### 4.3 Configure Environment

```powershell
# Create .env file
# Windows:
copy .env.example .env

# Mac/Linux:
# cp .env.example .env

# Edit .env
notepad .env  # Windows
# nano .env   # Mac/Linux
```

Your `.env` should contain:
```
VITE_BACKEND_URL=http://localhost:8000
```

### 4.4 Run Frontend

```powershell
# Start development server
npm run dev

# You should see:
# VITE v5.0.11  ready in XXX ms
# ➜  Local:   http://localhost:3000/
```

Open browser and go to: http://localhost:3000

You should see the RAG Application interface!

✅ If you see the UI, frontend is working!

## Part 5: Test the Application (10 minutes)

### 5.1 Test Text Ingestion

1. In the browser (http://localhost:3000)
2. Find the "Paste Text" section
3. Enter a source name: `test_doc`
4. Paste this text:
```
Artificial Intelligence is transforming technology. Machine learning algorithms can learn from data. Deep learning uses neural networks to process information.
```
5. Click "Ingest Text"
6. Wait for success message
7. You should see: "✓ Successfully ingested X chunks..."

### 5.2 Test Query

1. Scroll to "Ask a Question" section
2. Enter question: `What is AI?`
3. Click "Ask"
4. Wait for response (5-10 seconds)
5. You should see:
   - An answer with citations [1]
   - Sources section below
   - Latency and token counts

### 5.3 Test File Upload

1. Create a test file `test.txt`:
```
Python is a programming language.
It is used for web development and data science.
Python has a simple and readable syntax.
```

2. In the "Upload File" section
3. Click "Choose File"
4. Select `test.txt`
5. Click "Upload File"
6. Wait for success message

7. Now query: `What is Python?`
8. You should get an answer with citations!

## Part 6: Verify Everything Works

### 6.1 Backend Health Check

Open a new terminal:
```powershell
curl http://localhost:8000/
```

Should return JSON with API info.

### 6.2 Check Supabase Data

1. Go to Supabase dashboard
2. Go to Table Editor
3. Select `documents` table
4. You should see your ingested chunks

### 6.3 Test API Directly

```powershell
curl -X POST http://localhost:8000/query `
  -H "Content-Type: application/json" `
  -d '{"question": "What is AI?"}'
```

Should return an answer.

## Troubleshooting

### Backend won't start

**Error**: "No module named 'fastapi'"
```powershell
# Ensure venv is activated (you should see (venv) in prompt)
# Reinstall dependencies
pip install -r requirements.txt
```

**Error**: "Connection to Supabase failed"
- Check SUPABASE_URL is correct (no trailing slash)
- Check SUPABASE_SERVICE_KEY is the service_role key
- Verify project is not paused in Supabase dashboard

**Error**: "Invalid API key"
- Check GOOGLE_API_KEY and COHERE_API_KEY
- Ensure no extra spaces in .env file
- Try regenerating keys

### Frontend won't start

**Error**: "Cannot find module"
```powershell
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error**: "Port 3000 already in use"
```powershell
# Use different port
npm run dev -- --port 3001
```

### API calls fail from frontend

1. Check backend is running (http://localhost:8000)
2. Verify VITE_BACKEND_URL in frontend/.env
3. Check browser console for errors (F12)
4. Ensure no CORS errors (backend should allow all origins in dev)

### Database issues

**Error**: "relation 'documents' does not exist"
- Go to Supabase SQL Editor
- Re-run schema.sql
- Verify it completes without errors

**Error**: "extension 'vector' does not exist"
- Go to Database → Extensions
- Enable "vector" extension
- Wait 30 seconds and try again

### Still stuck?

1. Check all terminals are in correct directories
2. Verify all API keys are valid
3. Ensure Python version is 3.11+ (`python --version`)
4. Ensure Node version is 18+ (`node --version`)
5. Try restarting everything

## Next Steps

Now that everything works locally:

1. ✅ Read [README.md](README.md) for architecture details
2. ✅ Check [API_EXAMPLES.md](API_EXAMPLES.md) for more examples
3. ✅ Ready to deploy? See deployment guides:
   - [backend/DEPLOYMENT.md](backend/DEPLOYMENT.md)
   - [frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md)

## Success! 🎉

You now have a working RAG application with:
- ✅ Vector database (Supabase + pgvector)
- ✅ Backend API (FastAPI)
- ✅ Frontend UI (React)
- ✅ Embeddings (Google AI)
- ✅ Reranking (Cohere)
- ✅ LLM Answering (Gemini)

You can now:
- Ingest documents (text or PDF/TXT files)
- Query your knowledge base
- Get answers with inline citations
- See source snippets

Ready to deploy to production? Follow the deployment guides!
