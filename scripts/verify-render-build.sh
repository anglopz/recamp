#!/bin/bash

# Render Build Verification Script
# This script verifies that the build succeeded and files are in the right place

echo "================================================"
echo "Render Build Verification"
echo "================================================"
echo ""

echo "📍 Current directory:"
pwd
echo ""

echo "📂 Project structure:"
ls -la
echo ""

echo "🔨 Running build..."
npm run build:backend
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "❌ Build failed!"
  exit 1
fi

echo ""
echo "✅ Build completed"
echo ""

echo "📦 Checking for dist directory..."
if [ -d "dist" ]; then
  echo "✅ dist/ exists"
else
  echo "❌ dist/ NOT FOUND!"
  exit 1
fi

echo ""
echo "📦 Checking for dist/backend directory..."
if [ -d "dist/backend" ]; then
  echo "✅ dist/backend/ exists"
else
  echo "❌ dist/backend/ NOT FOUND!"
  exit 1
fi

echo ""
echo "📦 Checking for index.js..."
if [ -f "dist/backend/index.js" ]; then
  echo "✅ dist/backend/index.js exists"
  ls -lh dist/backend/index.js
else
  echo "❌ dist/backend/index.js NOT FOUND!"
  echo ""
  echo "Contents of dist/:"
  find dist -type f | head -20
  exit 1
fi

echo ""
echo "📊 Build artifact summary:"
echo "  Files created: $(find dist/backend -name '*.js' | wc -l) JavaScript files"
echo "  Total size: $(du -sh dist/backend | cut -f1)"
echo ""

echo "================================================"
echo "✅ Build verification PASSED"
echo "================================================"
