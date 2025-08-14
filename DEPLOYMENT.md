# BLS ExportPro - Render Deployment Guide

This guide explains how to deploy the BLS ExportPro application to Render.

## Prerequisites

1. A GitHub account with your code pushed to a repository
2. A Render account (free at render.com)
3. The code should be pushed to your GitHub repository

## Deployment Steps

### Method 1: Using render.yaml (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing your code
   - Render will automatically detect the `render.yaml` file

3. **Configure Environment Variables** (if needed):
   - Backend will automatically use production settings
   - Frontend will automatically connect to the deployed backend

4. **Deploy**:
   - Click "Apply" to start the deployment
   - Both frontend and backend will deploy automatically

### Method 2: Manual Deployment

#### Deploy Backend API

1. **Create New Web Service**:
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Set Root Directory: `bls-exportpro/backend`

2. **Configure Build & Start**:
   - Build Command: `chmod +x build.sh && ./build.sh`
   - Start Command: `npm start`
   - Environment: `Node`

3. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5001
   API_PREFIX=/api
   ```

#### Deploy Frontend

1. **Create New Static Site**:
   - Click "New" → "Static Site"
   - Connect your GitHub repository
   - Set Root Directory: `bls-exportpro/frontend`

2. **Configure Build**:
   - Build Command: `chmod +x build.sh && ./build.sh`
   - Publish Directory: `dist`

3. **Environment Variables**:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```

## Post-Deployment Configuration

### Update Frontend API URL

After backend is deployed, update the frontend's API configuration:

1. Get your backend URL from Render dashboard
2. Update `bls-exportpro/frontend/src/services/api.ts`:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api';
   ```

### Database Initialization

The SQLite database will be automatically initialized on first deployment with sample data.

## Monitoring

- **Backend Health Check**: `https://your-backend-url.onrender.com/health`
- **Frontend**: `https://your-frontend-url.onrender.com`

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Render dashboard
   - Ensure all dependencies are in package.json
   - Verify build scripts have correct permissions

2. **API Connection Issues**:
   - Verify CORS settings in backend
   - Check frontend API URL configuration
   - Ensure backend is deployed and running

3. **Database Issues**:
   - Check if SQLite file is being created
   - Verify data seeding scripts are running

### Logs

- View logs in Render dashboard under "Logs" tab
- Backend logs show API requests and database operations
- Frontend logs show build process and any runtime errors

## Environment Variables Reference

### Backend
- `NODE_ENV`: production
- `PORT`: 5001 (Render will override this)
- `API_PREFIX`: /api
- `CORS_ORIGIN`: Frontend URL (auto-configured)

### Frontend
- `VITE_API_URL`: Backend URL (auto-configured)

## Free Tier Limitations

Render's free tier includes:
- 750 hours/month of usage
- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30+ seconds

For production use, consider upgrading to a paid plan.

## Support

If you encounter issues:
1. Check Render documentation: https://render.com/docs
2. Review application logs in Render dashboard
3. Verify all configuration files are correct
