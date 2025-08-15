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

# Deploy to Vercel (project name will be auto-detected from repo)
echo "🚀 Deploying to Vercel..."
vercel --prod --yes

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "✅ Your full-stack app is now live!"
