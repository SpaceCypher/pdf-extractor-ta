# 🏗️ Technical Architecture Documentation

## System Overview

The PDF Extraction Playground is a modern, full-stack application built with a microservices architecture, featuring a React-based frontend and a serverless Python backend. The system is designed for scalability, performance, and ease of maintenance.

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                          │
│                     (Vercel Deployment)                        │
├─────────────────────────────────────────────────────────────────┤
│  Next.js 14 + TypeScript + Tailwind CSS + Shadcn/UI           │
│  • PDF Viewer (React-PDF)                                      │
│  • State Management (Zustand)                                  │
│  • API Client (React Query)                                    │
│  • Authentication (NextAuth.js)                                │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS/REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                              │
│                   (Modal.com Serverless)                       │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI + Pydantic + OpenAPI                                  │
│  • Request Validation                                          │
│  • Response Serialization                                      │
│  • Error Handling                                              │
│  • Rate Limiting                                               │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PROCESSING ENGINE                            │
│                   (Modal Functions)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Docling   │  │    Surya    │  │   MinerU    │            │
│  │     AI      │  │   OCR AI    │  │  Sci AI     │            │
│  │   Model     │  │   Model     │  │   Model     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA STORAGE                                │
├─────────────────────────────────────────────────────────────────┤
│  • Modal Volumes (Temporary Files)                             │
│  • PostgreSQL (User Data - Optional)                           │
│  • File Cleanup (24h TTL)                                      │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Frontend Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 14 (App Router) | React framework with server-side rendering |
| **Language** | TypeScript 5.0+ | Type safety and developer experience |
| **Styling** | Tailwind CSS + Shadcn/UI | Utility-first CSS with component library |
| **State Management** | Zustand | Lightweight state management |
| **API Layer** | React Query (TanStack Query) | Server state management and caching |
| **PDF Handling** | React-PDF + PDF.js | PDF rendering and interaction |
| **Authentication** | NextAuth.js | Authentication and session management |
| **Icons** | Lucide React | Consistent iconography |
| **Animations** | Framer Motion | Smooth transitions and animations |

### Backend Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | FastAPI | High-performance Python API framework |
| **Language** | Python 3.11+ | Backend logic and AI model integration |
| **Deployment** | Modal.com | Serverless container platform |
| **Validation** | Pydantic | Data validation and serialization |
| **PDF Processing** | PyMuPDF (fitz) | PDF parsing and manipulation |
| **Image Processing** | Pillow (PIL) | Image generation and annotation |
| **Documentation** | OpenAPI/Swagger | Auto-generated API documentation |

### AI Models

| Model | Technology | Use Case |
|-------|------------|----------|
| **Docling** | IBM Document AI | General document processing, layout analysis |
| **Surya** | OCR + Layout Analysis | Multilingual documents, scanned PDFs |
| **MinerU** | Scientific Document AI | Academic papers, formulas, citations |

## 🔄 Data Flow Architecture

### 1. Document Upload Flow

```
User Upload → Frontend Validation → Backend Upload API → 
Modal Volume Storage → PDF Metadata Extraction → 
Response to Frontend
```

**Components Involved:**
- `FileUpload.tsx` - Drag/drop interface
- `upload` API endpoint - File handling
- Modal Volume - Temporary storage
- PyMuPDF - PDF analysis

### 2. Content Extraction Flow

```
Model Selection → Extraction Request → Modal Function Execution → 
AI Model Processing → Content + Annotations → 
Frontend Display
```

**Components Involved:**
- `ModelSelector.tsx` - UI for model choice
- `extract` API endpoint - Processing coordination
- Individual AI models - Content extraction
- `PDFViewer.tsx` + `MarkdownDisplay.tsx` - Results display

### 3. Annotation Generation Flow

```
Extracted Elements → Bounding Box Calculation → 
PDF Page Rendering → Annotation Overlay → 
Annotated Image Response
```

**Components Involved:**
- Element detection algorithms
- PIL image processing
- PDF coordinate mapping
- `AnnotatedViewer.tsx` - Display component

## 📊 Component Architecture

### Frontend Component Hierarchy

```
App Layout (layout.tsx)
├── Header (Header.tsx)
├── Sidebar (AppSidebar.tsx)
└── Main Content
    ├── Extraction Interface (ExtractionInterface.tsx)
    │   ├── File Upload (FileUpload.tsx)
    │   ├── Model Selector (ModelSelector.tsx)
    │   ├── Processing Settings (ProcessingSettings.tsx)
    │   ├── PDF Viewer (PDFViewer.tsx)
    │   ├── Markdown Display (MarkdownDisplay.tsx)
    │   └── Live Progress (LiveProgress.tsx)
    ├── Examples Page (ExamplesPage.tsx)
    ├── Settings Page (SettingsPage.tsx)
    ├── Documentation (DocsPage.tsx)
    └── Support (SupportPage.tsx)
```

### Backend API Structure

```
FastAPI Application
├── /upload - File upload handling
├── /extract - Content extraction
├── /annotated-image/{id}/{model}/{page} - Annotated images
├── /models - Available models list
├── /health - Health check
├── /compare - Model comparison
└── /download/{format} - Export functionality
```

## 🗄️ Data Models

### Frontend TypeScript Interfaces

```typescript
// Core data structures
interface UploadedFile {
  file: File
  filename: string
  uploadId: string
  size: number
  pages: number
}

interface ExtractionResult {
  model: string
  markdown: string
  elements: ElementInfo[]
  metadata: ExtractionMetadata
  processingTime: number
}

interface ElementInfo {
  type: 'title' | 'header' | 'text' | 'table' | 'image' | 'list'
  content: string
  bbox: [number, number, number, number]
  page: number
  confidence: number
}

interface ProcessingStatus {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  currentStep: string
  estimatedTime?: number
}
```

### Backend Pydantic Models

```python
# API request/response models
class UploadResponse(BaseModel):
    upload_id: str
    filename: str
    size: int
    pages: int
    status: str

class ExtractionRequest(BaseModel):
    upload_id: str
    models: List[str]
    options: Dict[str, Any] = {}

class ExtractionResult(BaseModel):
    markdown: str
    elements: List[ElementInfo]
    metadata: Dict[str, Any]
    processing_time: float
    model: str
```

## 🔐 Security Architecture

### Frontend Security
- **CSP Headers**: Content Security Policy for XSS prevention
- **Input Validation**: Client-side validation for file types and sizes
- **Authentication**: NextAuth.js with JWT tokens
- **HTTPS Only**: All communication encrypted
- **Environment Variables**: Sensitive data not exposed to client

### Backend Security
- **Request Validation**: Pydantic models validate all inputs
- **File Type Checking**: Magic byte validation for uploaded files
- **Rate Limiting**: Built-in via Modal.com platform
- **Temporary Storage**: Files auto-deleted after 24 hours
- **Error Handling**: No sensitive information in error responses

### Infrastructure Security
- **Modal.com Security**: Container isolation, encrypted communication
- **Vercel Security**: Edge network, DDoS protection
- **Database Security**: Connection encryption, parameterized queries

## ⚡ Performance Architecture

### Frontend Optimizations
- **Code Splitting**: Route-based and component-based lazy loading
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Analysis**: Webpack bundle analyzer for size optimization
- **Caching Strategy**: React Query for API response caching
- **Virtual Scrolling**: For large document page lists

### Backend Optimizations
- **Serverless Functions**: Auto-scaling based on demand
- **Async Processing**: Non-blocking I/O for concurrent requests
- **Memory Management**: Optimized container sizes per model
- **Cold Start Optimization**: Pre-warmed containers for popular models

### Infrastructure Optimizations
- **CDN**: Vercel Edge Network for global distribution
- **Compression**: Gzip and Brotli compression enabled
- **HTTP/2**: Modern protocol support
- **Cache Headers**: Appropriate caching for static assets

## 🔄 State Management Architecture

### Frontend State Flow

```
User Action → Component State → Zustand Store → 
API Call (React Query) → Backend → Response → 
Store Update → UI Re-render
```

**State Stores:**
- **Upload Store**: File upload state and progress
- **Extraction Store**: Processing status and results
- **Settings Store**: User preferences and configurations
- **UI Store**: Theme, sidebar state, modals

### Backend State Management
- **Stateless Design**: No persistent state in API functions
- **Session Storage**: Temporary file storage in Modal volumes
- **Database**: Optional PostgreSQL for user data
- **Cache**: In-memory caching for frequently accessed data

## 🛠️ Development Architecture

### Project Structure
```
pdf-extraction-playground/
├── src/                          # Frontend source
│   ├── app/                      # Next.js App Router pages
│   ├── components/               # React components
│   ├── lib/                      # Utilities and configuration
│   └── styles/                   # Global styles
├── backend/                      # Backend source
│   ├── modal_app.py             # Main Modal application
│   ├── models/                   # AI model integrations
│   └── requirements.txt          # Python dependencies
├── docs/                         # Documentation
├── public/                       # Static assets
└── tests/                        # Test suites
```

### Development Workflow
1. **Local Development**: Next.js dev server + Modal dev environment
2. **Code Quality**: ESLint, Prettier, TypeScript strict mode
3. **Testing Strategy**: Unit tests (Jest), integration tests (Playwright)
4. **Version Control**: Git with conventional commits
5. **CI/CD**: GitHub Actions for automated testing and deployment

## 🚀 Deployment Architecture

### Production Environment

```
GitHub Repository → Vercel (Frontend) + Modal (Backend) → 
Production URLs
```

**Frontend Deployment (Vercel):**
- **Build Process**: Next.js production build
- **Environment**: Serverless functions for API routes
- **CDN**: Global edge distribution
- **Domain**: Custom domain with SSL

**Backend Deployment (Modal):**
- **Container Deployment**: Docker-based serverless functions
- **Auto-scaling**: Demand-based container scaling
- **Resource Allocation**: CPU/Memory per function type
- **Monitoring**: Built-in logging and metrics

### Environment Configuration

**Development:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key
```

**Production:**
```bash
NEXT_PUBLIC_API_URL=https://your-modal-app.modal.run
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=production-secret-key
DATABASE_URL=postgresql://...
```

## 📈 Monitoring and Observability

### Frontend Monitoring
- **Vercel Analytics**: Performance metrics, Web Vitals
- **Error Tracking**: Browser console errors, React error boundaries
- **User Analytics**: Page views, user interactions
- **Performance**: Lighthouse scores, bundle size tracking

### Backend Monitoring
- **Modal Logs**: Function execution logs and errors
- **Performance Metrics**: Execution time, memory usage
- **Error Tracking**: Exception monitoring and alerting
- **Resource Usage**: Container scaling patterns

### Health Checks
- **Frontend**: Build status, deployment success
- **Backend**: `/health` endpoint for service availability
- **Dependencies**: External service connectivity
- **Data Integrity**: File processing success rates

## 🔮 Scalability Considerations

### Horizontal Scaling
- **Frontend**: CDN distribution, edge caching
- **Backend**: Auto-scaling serverless functions
- **Database**: Connection pooling, read replicas
- **Storage**: Distributed file storage

### Performance Bottlenecks
- **File Upload Size**: 50MB limit with chunked uploads
- **Processing Time**: Async processing with progress updates
- **Concurrent Users**: Modal auto-scaling handles load
- **Memory Usage**: Optimized container sizes per model

### Future Enhancements
- **WebSocket Support**: Real-time progress updates
- **Caching Layer**: Redis for frequently accessed results
- **Batch Processing**: Queue-based processing for multiple files
- **Model Optimization**: GPU acceleration for heavy models

---

This technical architecture provides a solid foundation for a scalable, maintainable, and high-performance PDF extraction platform. The modular design allows for easy extension and integration of new AI models and features.