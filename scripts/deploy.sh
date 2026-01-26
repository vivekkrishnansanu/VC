#!/bin/bash

# Production Deployment Script
# This script helps prepare and deploy the application to Vercel

set -e

echo "🚀 Starting production deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found. Please run this script from the project root."
  exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "❌ Error: Git repository not found. Please initialize git first."
  exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  Warning: You have uncommitted changes."
  read -p "Do you want to continue? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Clean build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Type check
echo "🔍 Running type check..."
npm run type-check

# Build
echo "🏗️  Building application..."
npm run build

echo "✅ Build successful!"

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
  echo ""
  echo "📤 Vercel CLI detected. You can deploy with:"
  echo "   vercel --prod"
  echo ""
  read -p "Deploy to Vercel now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
  fi
else
  echo ""
  echo "📤 To deploy via Vercel CLI:"
  echo "   1. Install: npm i -g vercel"
  echo "   2. Login: vercel login"
  echo "   3. Deploy: vercel --prod"
  echo ""
  echo "🌐 Or deploy via Vercel Dashboard:"
  echo "   1. Go to https://vercel.com"
  echo "   2. Import your GitHub repository"
  echo "   3. Click Deploy"
fi

echo ""
echo "✨ Deployment preparation complete!"
echo "📚 See DEPLOY_TO_PRODUCTION.md for detailed instructions."
