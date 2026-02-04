# Frontend Deployment on Vercel

## Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)
- Your frontend code pushed to a GitHub repository
- Backend deployed and URL available

## Deployment Steps

### 1. Prepare Your Repository

Make sure your frontend code is in a GitHub repository with:
```
frontend/
├── src/
│   ├── components/
│   ├── App.jsx
│   ├── main.jsx
│   └── api.js
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── .env.example
```

### 2. Deploy to Vercel

#### Option A: Using Vercel Dashboard

1. Log in to your Vercel dashboard
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` (if in a subfolder, otherwise leave as `./`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - Click **Environment Variables**
   - Add: `VITE_BACKEND_URL` = `https://your-render-backend-url.onrender.com`

6. Click **Deploy**

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to frontend directory
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy: Yes
# - Which scope: Your account
# - Link to existing project: No
# - Project name: rag-frontend (or your choice)
# - Directory: ./ (or adjust if needed)
# - Override settings: No

# Set environment variable
vercel env add VITE_BACKEND_URL production
# Enter your backend URL when prompted

# Deploy to production
vercel --prod
```

### 3. Configure Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Key**: `VITE_BACKEND_URL`
   - **Value**: `https://your-render-backend-url.onrender.com`
   - **Environment**: Production (and Preview if needed)
4. Click **Save**

### 4. Redeploy

After adding environment variables:
1. Go to **Deployments**
2. Click on the latest deployment
3. Click **⋯** (menu) → **Redeploy**

### 5. Verify Deployment

1. Visit your Vercel URL (e.g., `https://rag-frontend.vercel.app`)
2. Test the ingest functionality
3. Test the query functionality
4. Check browser console for any errors

## Custom Domain (Optional)

To add a custom domain:
1. Go to **Settings** → **Domains**
2. Click **Add**
3. Enter your domain name
4. Follow DNS configuration instructions

## Automatic Deployments

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pushes to other branches or pull requests

To disable automatic deployments:
1. Go to **Settings** → **Git**
2. Configure branch deployment settings

## Troubleshooting

### Environment variables not working
- Ensure variable names start with `VITE_`
- Redeploy after adding variables
- Check that you're using the correct environment (production/preview)

### API calls failing
- Verify `VITE_BACKEND_URL` is correct
- Check CORS settings on backend
- Verify backend is running and accessible

### Build fails
- Check build logs in Vercel dashboard
- Verify `package.json` scripts are correct
- Ensure all dependencies are listed

### Blank page after deployment
- Check browser console for errors
- Verify all files are committed to Git
- Check that build output directory is correct (`dist`)

## Notes

- Vercel provides automatic HTTPS
- Preview deployments for every branch/PR
- Analytics available on Pro plan
- Edge functions for advanced use cases
- Consider using Vercel's CDN for static assets
