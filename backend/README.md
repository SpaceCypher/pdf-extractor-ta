# PDF Extraction Backend

FastAPI backend for PDF extraction using multiple AI models.

## Models Supported
- Docling: General document processing
- Surya: Multilingual OCR and layout analysis
- MinerU: Scientific document extraction
- Omnidocs: Comprehensive document processing

## API Endpoints
- POST /api/upload - Upload PDF files
- POST /api/extract - Extract content using selected models  
- GET /api/annotated-image/{page} - Get annotated PDF images
- POST /api/compare - Compare multiple model outputs
- GET /api/download/{format} - Download results in various formats
- GET /api/models - List available models

## Installation
```bash
pip install -r requirements.txt
```

## Deployment
Deploy on Modal.com for serverless scaling.