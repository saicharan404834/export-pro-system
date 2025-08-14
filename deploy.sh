#!/bin/bash

# BLS ExportPro Deployment Helper Script

echo "🚀 BLS ExportPro Deployment Helper"
echo "=================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a Git repository. Please run this from your project root."
    exit 1
fi

echo "📦 Preparing for deployment..."

# Add all changes
echo "📝 Adding changes to Git..."
git add .

# Prompt for commit message
read -p "Enter commit message (default: 'Deploy to Render'): " commit_message
commit_message=${commit_message:-"Deploy to Render"}

# Commit changes
echo "💾 Committing changes..."
git commit -m "$commit_message"

# Push to repository
echo "🚀 Pushing to repository..."
git push origin main

echo "✅ Code pushed to repository!"
echo ""
echo "🌐 Next Steps:"
echo "1. Go to https://render.com"
echo "2. Sign up/Login with your GitHub account"
echo "3. Click 'New' → 'Blueprint'"
echo "4. Select your repository"
echo "5. Render will detect the render.yaml file and deploy automatically"
echo ""
echo "🔗 Your services will be available at:"
echo "   Backend API: https://bls-exportpro-backend.onrender.com"
echo "   Frontend: https://bls-exportpro-frontend.onrender.com"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
