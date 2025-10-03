#!/bin/bash

# Deploy Enhanced PDF Extraction Service with Docling, Surya, and MinerU

echo "🚀 Deploying Enhanced PDF Extraction Service..."

# Check if Modal is installed
if ! command -v modal &> /dev/null; then
    echo "❌ Modal CLI not found. Please install it first:"
    echo "pip install modal"
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📦 Deploying unified FastAPI app with all models..."

# Deploy the unified app
modal deploy modal_app_unified.py

echo "✅ Deployment complete!"
echo ""
echo "🔗 Your API endpoints:"
echo "   Main App: https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run"
echo "   Health Check: https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run/health"
echo "   Models: https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run/models"
echo ""
echo "📋 Available Models:"
echo "   • Docling - Advanced document AI for complex layouts"
echo "   • Surya - Multilingual OCR with 90+ language support"  
echo "   • MinerU - Scientific document processing with formula extraction"
echo "   • PyMuPDF Basic - Fast text extraction"
echo "   • PyMuPDF Advanced - Enhanced extraction with tables"
echo ""
echo "🎉 Ready to process PDFs with advanced AI models!"