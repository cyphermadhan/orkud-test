# Deployment Guide for Orkud

This guide covers deploying the Orkud application to Cloudflare Pages (frontend) and a backend hosting service.

## Architecture

- **Frontend**: React app deployed to Cloudflare Pages
- **Backend**: Express.js API (needs separate hosting)

## Prerequisites

1. GitHub account with your code pushed
2. Cloudflare account (free tier works)
3. Backend hosting service account (Railway, Render, Fly.io, etc.)

---

## Part 1: Deploy Frontend to Cloudflare Pages

### Step 1: Prepare the Frontend

The frontend is already configured. Make sure you have:
- `client/public/_redirects` file (for SPA routing)
- Environment variables configured

### Step 2: Deploy via Cloudflare Dashboard

1. **Go to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com
   - Navigate to **Pages** → **Create a project**

2. **Connect to GitHub**
   - Click "Connect to Git"
   - Authorize Cloudflare to access your GitHub
   - Select the repository: `cyphermadhan/orkud-test`

3. **Configure Build Settings**
   - **Project name**: `orkud` (or your preferred name)
   - **Production branch**: `main`
   - **Build command**: `cd client && npm install && npm run build`
   - **Build output directory**: `client/dist`
   - **Root directory**: `/` (leave as root)
   - **⚠️ IMPORTANT: Deploy command** - Leave this field **COMPLETELY EMPTY** or delete any value. Cloudflare Pages automatically deploys the build output - you do NOT need a deploy command. If you see `npx wrangler deploy` or any deploy command, remove it!

4. **Environment Variables**
   Add these in the Environment Variables section:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
   Replace `https://your-backend-url.com` with your actual backend URL (from Part 2)

5. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will build and deploy your site
   - Your site will be available at `https://your-project.pages.dev`

### Step 3: Deploy via Wrangler CLI (Alternative)

If you prefer CLI:

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Navigate to client directory
cd client

# Build the project
npm install
npm run build

# Deploy to Pages (NOT Workers!)
wrangler pages deploy dist --project-name=orkud
```

**Note**: This uses `wrangler pages deploy` (for Pages), NOT `wrangler deploy` (for Workers). Make sure you're using the Pages command.

---

## Part 2: Deploy Backend

The backend needs to be deployed separately. Here are options:

### Option A: Railway (Recommended - Easy)

1. **Sign up**: Go to https://railway.app
2. **New Project**: Click "New Project" → "Deploy from GitHub repo"
3. **Select Repository**: Choose `cyphermadhan/orkud-test`
4. **Configure**:
   - **Root Directory**: `server`
   - **Start Command**: `node server.js`
   - **Port**: Railway will auto-detect (set `PORT` env var if needed)
5. **Environment Variables**: None needed for basic setup
6. **Deploy**: Railway will automatically deploy
7. **Get URL**: Copy the generated URL (e.g., `https://your-app.railway.app`)
8. **Update Frontend**: Add this URL to Cloudflare Pages env var `VITE_API_URL`

### Option B: Render

1. **Sign up**: Go to https://render.com
2. **New Web Service**: Click "New" → "Web Service"
3. **Connect GitHub**: Select your repository
4. **Configure**:
   - **Name**: `orkud-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free tier works
5. **Deploy**: Click "Create Web Service"
6. **Get URL**: Copy the URL (e.g., `https://orkud-backend.onrender.com`)
7. **Update Frontend**: Add this URL to Cloudflare Pages env var `VITE_API_URL`

### Option C: Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Login**: `fly auth login`
3. **Create App**: `fly launch` (in the `server` directory)
4. **Deploy**: `fly deploy`
5. **Get URL**: Your app will be at `https://your-app.fly.dev`

### Option D: Cloudflare Workers (Advanced)

For serverless deployment on Cloudflare:

1. Create a `wrangler.toml` in the server directory
2. Convert Express routes to Workers format
3. Deploy using `wrangler deploy`

---

## Part 3: Update API Calls

The frontend is already configured to use environment variables. After deploying:

1. **Get your backend URL** from the hosting service
2. **Update Cloudflare Pages environment variable**:
   - Go to your Cloudflare Pages project
   - Settings → Environment Variables
   - Add/Update: `VITE_API_URL` = `https://your-backend-url.com`
3. **Redeploy** the frontend (or it will auto-redeploy)

---

## Part 4: CORS Configuration

Make sure your backend allows requests from your Cloudflare Pages domain:

In `server/server.js`, the CORS is already configured with:
```javascript
app.use(cors());
```

This allows all origins. For production, you might want to restrict it:
```javascript
app.use(cors({
  origin: ['https://your-project.pages.dev', 'https://your-custom-domain.com']
}));
```

---

## Part 5: Custom Domain (Optional)

### For Cloudflare Pages:

1. Go to your Pages project → **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain
4. Follow DNS configuration instructions

### For Backend:

Configure your backend hosting service to use a custom domain (varies by provider).

---

## Troubleshooting

### Frontend Issues:

- **"Missing entry-point to Worker script" error**: 
  - **Problem**: You have a deploy command set in Cloudflare Pages settings
  - **Solution**: Go to your Cloudflare Pages project → Settings → Builds & deployments → Remove/clear the "Deploy command" field. Leave it empty!
  
- **404 on routes**: Make sure `_redirects` file exists in `client/public/`
- **API calls failing**: Check `VITE_API_URL` environment variable
- **Build fails**: Check build logs in Cloudflare dashboard

### Backend Issues:

- **CORS errors**: Update CORS configuration in `server/server.js`
- **Port issues**: Some services use `PORT` env var (Railway auto-detects)
- **Data persistence**: Backend uses `data.json` file - consider using a database for production

---

## Environment Variables Summary

### Frontend (Cloudflare Pages):
- `VITE_API_URL`: Your backend API URL

### Backend (Hosting Service):
- `PORT`: Port number (usually auto-set by hosting service)
- No other required variables for basic setup

---

## Next Steps

1. ✅ Deploy backend to Railway/Render/Fly.io
2. ✅ Deploy frontend to Cloudflare Pages
3. ✅ Set `VITE_API_URL` environment variable
4. ✅ Test the deployed application
5. ✅ (Optional) Set up custom domain
6. ✅ (Optional) Add database for production (replace JSON file storage)

---

## Production Considerations

1. **Database**: Replace JSON file storage with a real database (PostgreSQL, MongoDB)
2. **Authentication**: Implement proper user authentication
3. **Environment Variables**: Store sensitive data securely
4. **Monitoring**: Set up error tracking and monitoring
5. **Backup**: Regular backups of your data
6. **HTTPS**: Ensure all connections use HTTPS

---

## Support

If you encounter issues:
1. Check Cloudflare Pages build logs
2. Check backend hosting service logs
3. Verify environment variables are set correctly
4. Check browser console for errors
5. Verify CORS configuration
