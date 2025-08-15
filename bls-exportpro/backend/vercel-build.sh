#!/bin/bash

# Copy shared types into backend for deployment
echo "Copying shared types for deployment..."
cp -r ../shared ./src/

# Install dependencies
echo "Installing dependencies..."
npm ci

# Build the project
echo "Building backend..."
npm run build

echo "Build complete!"
