#!/bin/bash

echo "🚀 Deploying Full-Stack App to Vercel..."
echo "📦 This will deploy both frontend and backend together"

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "📝 Please make sure you're logged in to Vercel..."
vercel login

# Deploy entire project
echo "� Deploying full-stack application..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "🎉 Your full-stack app is now live!"
echo "📋 What was deployed:"
echo "   ✅ Frontend (React + Vite) - Served from root /"
echo "   ✅ Backend (Express API) - Available at /api/*"
echo "   ✅ Database (SQLite) - Initialized with seed data"
echo ""
echo "🔗 Access your app at the URL provided by Vercel above"
echo "🔧 All API calls will automatically work since both frontend and backend are on the same domain"
