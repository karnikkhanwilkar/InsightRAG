# Backend Deployment on Render

## Prerequisites
- GitHub account
- Render account (sign up at https://render.com)
- Your backend code pushed to a GitHub repository

## Deployment Steps

### 1. Prepare Your Repository

Make sure your backend code is in a GitHub repository with the following structure:
```
backend/
├── main.py
├── config.py
├── chunker.py
├── embedder.py
├── database.py
├── reranker.py
├── llm.py
├── file_processor.py
├── requirements.txt
├── render.yaml
└── .env.example
```

### 2. Create a New Web Service on Render

1. Log in to your Render dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `rag-backend` (or your preferred name)
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend` (if backend is in a subfolder)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or your preferred plan)

### 3. Set Environment Variables

In the Render dashboard, add these environment variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `GOOGLE_API_KEY`: Your Google AI API key
- `COHERE_API_KEY`: Your Cohere API key
- `PYTHON_VERSION`: `3.11.0`

### 4. Deploy

1. Click **Create Web Service**
2. Render will automatically deploy your application
3. Wait for the deployment to complete (5-10 minutes)
4. Your backend will be available at: `https://rag-backend-xxxx.onrender.com`

### 5. Verify Deployment

Test your API:
```bash
curl https://your-render-url.onrender.com/
```

You should see:
```json
{
  "message": "RAG Application API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

## Using render.yaml (Alternative)

If you have `render.yaml` in your repository root:

1. Go to Render Dashboard
2. Click **New +** → **Blueprint**
3. Connect your repository
4. Render will automatically detect `render.yaml` and configure everything
5. You'll still need to add environment variables manually

## Troubleshooting

### Build fails
- Check that `requirements.txt` is present
- Verify Python version compatibility
- Check Render build logs for specific errors

### API not responding
- Ensure start command uses `--host 0.0.0.0`
- Check that `$PORT` is used (Render assigns this automatically)
- Review application logs in Render dashboard

### Environment variables not working
- Verify all required env vars are set
- Restart the service after adding env vars
- Check for typos in variable names

## Notes

- Free tier on Render may spin down after inactivity (cold starts)
- Consider upgrading to a paid plan for production use
- Set up automatic deploys from your main branch
- Monitor your application logs regularly
