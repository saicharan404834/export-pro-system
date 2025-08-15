#!/bin/bash

echo "🚀 ONE-CLICK VERCEL DEPLOY"
echo "=========================="

# Make sure we're in the project root
cd /c/Z_Work/Git/export-pro-system

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found!"
    exit 1
fi

echo "✅ Found vercel.json"
echo "📁 Deploying from: $(pwd)"

# Deploy to Vercel with correct project name
echo "🚀 Deploying to Vercel..."
vercel --prod --name "bls-exportpro" --yes

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "✅ Your full-stack app is now live!"
