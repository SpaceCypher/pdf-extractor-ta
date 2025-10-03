# 🔌 API Documentation

## Overview

The PDF Extraction API provides programmatic access to our advanced PDF processing capabilities. Built with FastAPI, it offers automatic validation, comprehensive error handling, and interactive documentation.

## 🌐 Base URLs

| Environment | URL | Status |
|-------------|-----|--------|
| **Production** | `https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run` | ✅ Live |
| **Interactive Docs** | `https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run/docs` | ✅ Available |
| **OpenAPI Schema** | `https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run/openapi.json` | ✅ Available |

## 🔑 Authentication

Currently, the API is publicly accessible without authentication. For production deployments, consider implementing:

- API key authentication
- Rate limiting per user
- JWT token validation
- OAuth 2.0 integration

## 📊 Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/upload` | 10 requests | per minute |
| `/extract` | 5 requests | per minute |
| `/annotated-image` | 20 requests | per minute |
| Other endpoints | 60 requests | per minute |

## 🔗 Endpoints Reference

### 1. Health Check

Check API status and available models.

```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-03T10:30:00Z",
  "version": "1.0.0",
  "available_models": 3
}
```

**Response Codes:**
- `200`: API is healthy
- `503`: Service unavailable

---

### 2. Get Available Models

List all extraction models with their capabilities.

```http
GET /models
```

**Response:**
```json
{
  "models": [
    {
      "id": "docling",
      "name": "Docling AI",
      "description": "IBM's advanced document understanding model",
      "features": ["ai_analysis", "semantic_structure", "layout_detection"],
      "speed": "medium",
      "recommended_for": ["business_documents", "complex_layouts"],
      "available": true
    },
    {
      "id": "surya",
      "name": "Surya OCR",
      "description": "Advanced OCR with layout analysis",
      "features": ["ocr", "layout_analysis", "multilingual"],
      "speed": "fast",
      "recommended_for": ["scanned_documents", "multilingual"],
      "available": true
    },
    {
      "id": "mineru",
      "name": "MinerU",
      "description": "Scientific document extraction",
      "features": ["formula_extraction", "citation_parsing", "scientific_structure"],
      "speed": "slow",
      "recommended_for": ["research_papers", "academic_content"],
      "available": true
    }
  ]
}
```

**Response Codes:**
- `200`: Success
- `500`: Internal server error

---

### 3. Upload PDF File

Upload a PDF document for processing.

```http
POST /upload
Content-Type: multipart/form-data
```

**Parameters:**
- `file` (required): PDF file to upload
  - Max size: 50MB
  - Supported formats: `.pdf`
  - Must not be password-protected

**Response:**
```json
{
  "upload_id": "upload_20251003_143022_1234",
  "filename": "document.pdf",
  "size": 2048576,
  "pages": 15,
  "status": "uploaded"
}
```

**Response Codes:**
- `200`: Upload successful
- `400`: Invalid file format or size
- `413`: File too large
- `500`: Upload failed

**cURL Example:**
```bash
curl -X POST "https://api-url/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf"
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Upload ID:', result.upload_id);
```

**Python Example:**
```python
import requests

with open('document.pdf', 'rb') as f:
    files = {'file': f}
    response = requests.post(
        'https://api-url/upload',
        files=files
    )
    
result = response.json()
print(f"Upload ID: {result['upload_id']}")
```

---

### 4. Extract Content

Process uploaded PDF with selected AI models.

```http
POST /extract
Content-Type: application/json
```

**Request Body:**
```json
{
  "upload_id": "upload_20251003_143022_1234",
  "models": ["docling", "surya"],
  "options": {
    "extract_tables": true,
    "extract_images": true,
    "extract_formulas": false,
    "language_hint": "en",
    "quality": "balanced"
  }
}
```

**Parameters:**
- `upload_id` (required): ID from upload response
- `models` (required): Array of model IDs to use
- `options` (optional): Processing configuration

**Available Options:**
- `extract_tables` (boolean): Extract table structures
- `extract_images` (boolean): Detect and extract images
- `extract_formulas` (boolean): Extract mathematical formulas
- `language_hint` (string): Expected language code
- `quality` ("fast"|"balanced"|"high"): Processing quality vs speed

**Response:**
```json
{
  "upload_id": "upload_20251003_143022_1234",
  "results": {
    "docling": {
      "markdown": "# Document Title\n\nThis is the extracted content...",
      "elements": [
        {
          "type": "title",
          "content": "Document Title",
          "bbox": [100, 200, 400, 250],
          "page": 1,
          "confidence": 0.95
        },
        {
          "type": "table",
          "content": "| Header 1 | Header 2 |\n|----------|----------|\n| Data 1   | Data 2   |",
          "bbox": [50, 300, 500, 450],
          "page": 1,
          "confidence": 0.88
        }
      ],
      "metadata": {
        "total_pages": 15,
        "total_elements": 47,
        "confidence_avg": 0.91,
        "processing_time": 23.5,
        "model_used": "docling"
      },
      "processing_time": 23.5,
      "model": "docling"
    },
    "surya": {
      "markdown": "# Document Title\n\nAlternative extraction...",
      "elements": [...],
      "metadata": {...},
      "processing_time": 18.2,
      "model": "surya"
    }
  },
  "status": "completed"
}
```

**Element Types:**
- `title`: Main document titles
- `header`: Section headers and subheadings
- `text`: Regular paragraphs and text blocks
- `table`: Tabular data
- `image`: Images and figures
- `list`: Bulleted and numbered lists
- `formula`: Mathematical equations (MinerU only)

**Response Codes:**
- `200`: Extraction successful
- `400`: Invalid request or model not available
- `404`: Upload ID not found
- `408`: Processing timeout
- `500`: Extraction failed

**cURL Example:**
```bash
curl -X POST "https://api-url/extract" \
  -H "Content-Type: application/json" \
  -d '{
    "upload_id": "upload_20251003_143022_1234",
    "models": ["docling"],
    "options": {
      "extract_tables": true,
      "quality": "high"
    }
  }'
```

**JavaScript Example:**
```javascript
const extractionRequest = {
  upload_id: 'upload_20251003_143022_1234',
  models: ['docling', 'surya'],
  options: {
    extract_tables: true,
    extract_images: true,
    quality: 'balanced'
  }
};

const response = await fetch('/extract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(extractionRequest)
});

const results = await response.json();
console.log('Extraction completed:', results.status);
```

---

### 5. Get Annotated Image

Retrieve PDF page with visual annotations showing detected elements.

```http
GET /annotated-image/{upload_id}/{model}/{page}
```

**Parameters:**
- `upload_id` (required): Upload identifier
- `model` (required): Model used for extraction
- `page` (required): Page number (1-based)

**Response:**
- Content-Type: `image/png`
- Binary PNG image data
- Cache-Control: `max-age=3600`

**Query Parameters (optional):**
- `zoom` (float): Zoom level (0.5-3.0, default: 1.0)
- `show_confidence` (boolean): Show confidence scores
- `highlight_type` (string): Highlight specific element type

**Response Codes:**
- `200`: Image generated successfully
- `404`: Upload ID or page not found
- `400`: Invalid parameters
- `500`: Image generation failed

**cURL Example:**
```bash
curl "https://api-url/annotated-image/upload_123/docling/1" \
  -o "annotated_page_1.png"
```

**JavaScript Example:**
```javascript
const imageUrl = `/annotated-image/${uploadId}/${model}/${pageNum}`;
const img = document.createElement('img');
img.src = imageUrl;
document.body.appendChild(img);
```

**HTML Example:**
```html
<img src="/annotated-image/upload_123/docling/1?zoom=1.5&show_confidence=true" 
     alt="Annotated PDF page" />
```

---

### 6. Compare Models

Compare extraction results from multiple models.

```http
POST /compare
Content-Type: application/json
```

**Request Body:**
```json
{
  "upload_id": "upload_20251003_143022_1234",
  "models": ["docling", "surya", "mineru"],
  "comparison_type": "detailed"
}
```

**Response:**
```json
{
  "upload_id": "upload_20251003_143022_1234",
  "comparison": {
    "summary": {
      "fastest_model": "surya",
      "most_accurate": "docling",
      "most_elements": "mineru"
    },
    "metrics": {
      "docling": {
        "processing_time": 23.5,
        "elements_detected": 47,
        "confidence_avg": 0.91,
        "accuracy_score": 0.94
      },
      "surya": {
        "processing_time": 18.2,
        "elements_detected": 42,
        "confidence_avg": 0.89,
        "accuracy_score": 0.91
      },
      "mineru": {
        "processing_time": 45.7,
        "elements_detected": 52,
        "confidence_avg": 0.93,
        "accuracy_score": 0.96
      }
    },
    "differences": {
      "unique_to_docling": 3,
      "unique_to_surya": 2,
      "unique_to_mineru": 8,
      "common_elements": 39
    }
  },
  "status": "completed"
}
```

---

### 7. Download Results

Export extraction results in various formats.

```http
GET /download/{upload_id}/{model}/{format}
```

**Parameters:**
- `upload_id` (required): Upload identifier
- `model` (required): Model used for extraction
- `format` (required): Export format (`md`, `html`, `docx`, `json`)

**Response:**
- Content-Type: Varies by format
- Content-Disposition: `attachment; filename="document.{format}"`

**Supported Formats:**
- `md`: Markdown format
- `html`: HTML with styling
- `docx`: Microsoft Word document
- `json`: Raw JSON data

**Response Codes:**
- `200`: Download ready
- `404`: Upload ID or model not found
- `400`: Unsupported format
- `500`: Export generation failed

**cURL Examples:**
```bash
# Download as Markdown
curl "https://api-url/download/upload_123/docling/md" \
  -o "document.md"

# Download as HTML
curl "https://api-url/download/upload_123/docling/html" \
  -o "document.html"

# Download as DOCX
curl "https://api-url/download/upload_123/docling/docx" \
  -o "document.docx"
```

**JavaScript Example:**
```javascript
// Create download link
function downloadResult(uploadId, model, format) {
  const url = `/download/${uploadId}/${model}/${format}`;
  const link = document.createElement('a');
  link.href = url;
  link.download = `document.${format}`;
  link.click();
}

// Usage
downloadResult('upload_123', 'docling', 'md');
```

## 🔧 SDKs and Client Libraries

### JavaScript/TypeScript SDK

```typescript
class PDFExtractionClient {
  constructor(private baseUrl: string) {}

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData
    });
    
    return response.json();
  }

  async extractContent(
    uploadId: string, 
    models: string[], 
    options?: ExtractionOptions
  ): Promise<ExtractionResponse> {
    const response = await fetch(`${this.baseUrl}/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ upload_id: uploadId, models, options })
    });
    
    return response.json();
  }

  async getAnnotatedImage(
    uploadId: string, 
    model: string, 
    page: number
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/annotated-image/${uploadId}/${model}/${page}`
    );
    
    return response.blob();
  }
}

// Usage
const client = new PDFExtractionClient('https://api-url');
const upload = await client.uploadFile(pdfFile);
const results = await client.extractContent(upload.upload_id, ['docling']);
```

### Python SDK

```python
import requests
from typing import List, Dict, Any, Optional

class PDFExtractionClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
    
    def upload_file(self, file_path: str) -> Dict[str, Any]:
        """Upload a PDF file for processing."""
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f'{self.base_url}/upload', files=files)
            response.raise_for_status()
            return response.json()
    
    def extract_content(
        self, 
        upload_id: str, 
        models: List[str], 
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Extract content using specified models."""
        payload = {
            'upload_id': upload_id,
            'models': models,
            'options': options or {}
        }
        
        response = requests.post(
            f'{self.base_url}/extract',
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_annotated_image(
        self, 
        upload_id: str, 
        model: str, 
        page: int
    ) -> bytes:
        """Get annotated image for a specific page."""
        url = f'{self.base_url}/annotated-image/{upload_id}/{model}/{page}'
        response = requests.get(url)
        response.raise_for_status()
        return response.content

# Usage
client = PDFExtractionClient('https://api-url')
upload = client.upload_file('document.pdf')
results = client.extract_content(upload['upload_id'], ['docling', 'surya'])
```

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "error": {
    "code": "INVALID_FILE_FORMAT",
    "message": "Only PDF files are supported",
    "details": {
      "received_format": "image/jpeg",
      "supported_formats": ["application/pdf"]
    },
    "timestamp": "2025-10-03T10:30:00Z",
    "request_id": "req_12345"
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_FILE_FORMAT` | Unsupported file type | 400 |
| `FILE_TOO_LARGE` | File exceeds size limit | 413 |
| `UPLOAD_NOT_FOUND` | Upload ID doesn't exist | 404 |
| `MODEL_NOT_AVAILABLE` | Requested model unavailable | 400 |
| `PROCESSING_TIMEOUT` | Extraction took too long | 408 |
| `PROCESSING_FAILED` | Extraction error | 500 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Error Handling Best Practices

```javascript
async function handleApiCall() {
  try {
    const response = await fetch('/api/extract', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (error.code) {
        case 'RATE_LIMIT_EXCEEDED':
          // Wait and retry
          await new Promise(resolve => setTimeout(resolve, 60000));
          return handleApiCall();
          
        case 'FILE_TOO_LARGE':
          // Suggest file compression
          throw new Error('Please compress your PDF or split into smaller files');
          
        case 'PROCESSING_TIMEOUT':
          // Suggest different model
          throw new Error('Document too complex. Try using Surya model for faster processing');
          
        default:
          throw new Error(error.message || 'Unknown error occurred');
      }
    }
    
    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}
```

## 📊 Monitoring and Analytics

### Request Tracking

Each API request includes tracking headers:
- `X-Request-ID`: Unique request identifier
- `X-Processing-Time`: Server processing time in milliseconds
- `X-Model-Used`: AI model(s) used for processing

### Usage Analytics

Monitor your API usage:
- Request count per endpoint
- Processing time distributions
- Error rates by endpoint
- Model popularity metrics

## 🚀 Best Practices

### Performance Optimization

1. **File Preparation**: Optimize PDFs before upload
2. **Model Selection**: Choose appropriate model for document type
3. **Batch Processing**: Process multiple pages efficiently
4. **Caching**: Cache results for frequently accessed documents
5. **Compression**: Use compressed file formats when possible

### Integration Patterns

1. **Async Processing**: Use webhooks for long-running extractions
2. **Progressive Loading**: Display results as they become available
3. **Error Recovery**: Implement retry logic with exponential backoff
4. **Resource Management**: Monitor API usage and costs

### Security Considerations

1. **Input Validation**: Validate all file uploads
2. **Rate Limiting**: Implement client-side rate limiting
3. **Data Privacy**: Don't log sensitive document content
4. **HTTPS Only**: Always use encrypted connections
5. **Token Management**: Secure API keys and tokens

---

For interactive testing and more examples, visit our [API Documentation](https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run/docs).