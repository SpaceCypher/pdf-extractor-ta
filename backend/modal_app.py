"""
Production-ready PDF extraction service using Modal.com
Provides advanced PDF processing with multiple AI models
"""
import modal
import io
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Optional, Any
import tempfile
import os
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
import pandas as pd
from PIL import Image, ImageDraw

# Modal configuration
app = modal.App("pdf-extraction-prod")

# Define image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        "fastapi",
        "uvicorn",
        "python-multipart",
        "PyMuPDF",
        "Pillow",
        "pandas",
        "pydantic",
        "numpy",
        "requests",
        "aiofiles",
    ])
    .apt_install(["poppler-utils", "tesseract-ocr", "tesseract-ocr-eng"])
)

# Persistent storage for uploaded files
storage = modal.Volume.from_name("pdf-storage", create_if_missing=True)

# Pydantic models
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

class ElementInfo(BaseModel):
    type: str
    content: str
    bbox: List[float]
    page: int
    confidence: float

class ExtractionResult(BaseModel):
    markdown: str
    elements: List[ElementInfo]
    metadata: Dict[str, Any]
    processing_time: float
    model: str

class ExtractResponse(BaseModel):
    upload_id: str
    results: Dict[str, ExtractionResult]
    status: str

class ModelInfo(BaseModel):
    id: str
    name: str
    description: str
    features: List[str]
    speed: str
    recommended_for: List[str]
    available: bool

# FastAPI app
web_app = FastAPI(title="PDF Extraction API", version="1.0.0")

# CORS middleware
web_app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Available models configuration
AVAILABLE_MODELS = {
    "pymupdf_basic": ModelInfo(
        id="pymupdf_basic",
        name="PyMuPDF Basic",
        description="Fast text extraction with basic structure detection",
        features=["text_extraction", "basic_structure"],
        speed="very_fast",
        recommended_for=["simple_documents", "text_heavy"],
        available=True
    ),
    "pymupdf_advanced": ModelInfo(
        id="pymupdf_advanced",
        name="PyMuPDF Advanced",
        description="Advanced extraction with table and image detection",
        features=["text_extraction", "table_detection", "image_extraction", "structure_analysis"],
        speed="fast",
        recommended_for=["complex_documents", "tables", "mixed_content"],
        available=True
    ),
    "docling": ModelInfo(
        id="docling",
        name="Docling AI",
        description="IBM's advanced document understanding model",
        features=["ai_analysis", "semantic_structure", "layout_detection"],
        speed="medium",
        recommended_for=["research_papers", "complex_layouts"],
        available=False  # Would require additional setup
    ),
    "surya": ModelInfo(
        id="surya",
        name="Surya OCR",
        description="Advanced OCR with layout analysis",
        features=["ocr", "layout_analysis", "multilingual"],
        speed="medium",
        recommended_for=["scanned_documents", "handwritten_text"],
        available=False  # Would require additional setup
    )
}

def extract_text_with_positions(pdf_path: str, model: str = "pymupdf_basic") -> ExtractionResult:
    """Extract text with positional information using PyMuPDF"""
    start_time = datetime.now()
    
    try:
        doc = fitz.open(pdf_path)
        elements = []
        full_text = []
        
        total_confidence = 0
        element_count = 0
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            if model == "pymupdf_advanced":
                # Advanced extraction with tables and images
                blocks = page.get_text("dict")
                
                # Extract text blocks
                for block in blocks["blocks"]:
                    if "lines" in block:  # Text block
                        block_text = ""
                        bbox = block["bbox"]
                        
                        for line in block["lines"]:
                            for span in line["spans"]:
                                block_text += span["text"]
                        
                        if block_text.strip():
                            elements.append(ElementInfo(
                                type="text",
                                content=block_text.strip(),
                                bbox=list(bbox),
                                page=page_num + 1,
                                confidence=0.95
                            ))
                            full_text.append(block_text.strip())
                            total_confidence += 0.95
                            element_count += 1
                
                # Extract tables
                tables = page.find_tables()
                for table in tables:
                    try:
                        df = table.to_pandas()
                        table_markdown = df.to_markdown(index=False)
                        elements.append(ElementInfo(
                            type="table",
                            content=table_markdown,
                            bbox=list(table.bbox),
                            page=page_num + 1,
                            confidence=0.85
                        ))
                        full_text.append(f"\n{table_markdown}\n")
                        total_confidence += 0.85
                        element_count += 1
                    except Exception as e:
                        print(f"Table extraction error: {e}")
                
                # Extract images
                image_list = page.get_images()
                for img_index, img in enumerate(image_list):
                    try:
                        xref = img[0]
                        base_image = doc.extract_image(xref)
                        elements.append(ElementInfo(
                            type="image",
                            content=f"[Image {img_index + 1} on page {page_num + 1}]",
                            bbox=[0, 0, page.rect.width, page.rect.height],
                            page=page_num + 1,
                            confidence=0.90
                        ))
                        total_confidence += 0.90
                        element_count += 1
                    except Exception as e:
                        print(f"Image extraction error: {e}")
            
            else:  # Basic extraction
                text = page.get_text()
                if text.strip():
                    elements.append(ElementInfo(
                        type="text",
                        content=text.strip(),
                        bbox=[0, 0, page.rect.width, page.rect.height],
                        page=page_num + 1,
                        confidence=0.90
                    ))
                    full_text.append(text.strip())
                    total_confidence += 0.90
                    element_count += 1
        
        doc.close()
        
        # Generate markdown
        markdown_content = "\n\n".join(full_text)
        
        # Calculate metadata
        processing_time = (datetime.now() - start_time).total_seconds()
        avg_confidence = total_confidence / element_count if element_count > 0 else 0
        
        return ExtractionResult(
            markdown=markdown_content,
            elements=elements,
            metadata={
                "total_pages": len(doc),
                "total_elements": len(elements),
                "confidence_avg": round(avg_confidence, 2),
                "processing_time": round(processing_time, 2),
                "model_used": model
            },
            processing_time=round(processing_time, 2),
            model=model
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

def generate_annotated_image(pdf_path: str, page_num: int, elements: List[ElementInfo]) -> bytes:
    """Generate annotated image showing detected elements"""
    try:
        doc = fitz.open(pdf_path)
        page = doc[page_num - 1]  # Convert to 0-based indexing
        
        # Render page as image
        mat = fitz.Matrix(2, 2)  # 2x zoom for better quality
        pix = page.get_pixmap(matrix=mat)
        img_data = pix.tobytes("png")
        
        # Open with PIL
        img = Image.open(io.BytesIO(img_data))
        draw = ImageDraw.Draw(img)
        
        # Draw bounding boxes for elements on this page
        page_elements = [e for e in elements if e.page == page_num]
        
        colors = {
            "text": "blue",
            "table": "green", 
            "image": "red",
            "heading": "purple"
        }
        
        for element in page_elements:
            bbox = element.bbox
            # Scale bbox coordinates by zoom factor
            scaled_bbox = [coord * 2 for coord in bbox]
            color = colors.get(element.type, "orange")
            
            # Draw rectangle
            draw.rectangle(scaled_bbox, outline=color, width=3)
            
            # Add label
            draw.text((scaled_bbox[0], scaled_bbox[1] - 20), 
                     f"{element.type} ({element.confidence:.2f})", 
                     fill=color)
        
        doc.close()
        
        # Convert back to bytes
        output = io.BytesIO()
        img.save(output, format="PNG")
        return output.getvalue()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

# API Routes
@web_app.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload PDF file for processing"""
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Generate unique upload ID
    upload_id = f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(file.filename) % 10000}"
    
    try:
        # Save file to volume
        file_path = f"/mnt/storage/{upload_id}.pdf"
        content = await file.read()
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Get basic info
        doc = fitz.open(file_path)
        page_count = len(doc)
        doc.close()
        
        return UploadResponse(
            upload_id=upload_id,
            filename=file.filename,
            size=len(content),
            pages=page_count,
            status="uploaded"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@web_app.post("/extract", response_model=ExtractResponse)
async def extract_content(request: ExtractionRequest):
    """Extract content using specified models"""
    file_path = f"/mnt/storage/{request.upload_id}.pdf"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    results = {}
    
    try:
        for model in request.models:
            if model not in AVAILABLE_MODELS:
                raise HTTPException(status_code=400, detail=f"Model {model} not available")
            
            if not AVAILABLE_MODELS[model].available:
                raise HTTPException(status_code=400, detail=f"Model {model} not currently available")
            
            # Extract using the specified model
            result = extract_text_with_positions(file_path, model)
            results[model] = result
        
        return ExtractResponse(
            upload_id=request.upload_id,
            results=results,
            status="completed"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

@web_app.get("/annotated-image/{upload_id}/{model}/{page}")
async def get_annotated_image(upload_id: str, model: str, page: int):
    """Get annotated image showing detected elements"""
    file_path = f"/mnt/storage/{upload_id}.pdf"
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        # Get extraction results first
        result = extract_text_with_positions(file_path, model)
        
        # Generate annotated image
        img_bytes = generate_annotated_image(file_path, page, result.elements)
        
        return Response(
            content=img_bytes,
            media_type="image/png",
            headers={"Cache-Control": "max-age=3600"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image generation failed: {str(e)}")

@web_app.get("/models")
async def get_models():
    """Get available extraction models"""
    return {"models": list(AVAILABLE_MODELS.values())}

@web_app.get("/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "available_models": len([m for m in AVAILABLE_MODELS.values() if m.available])
    })

# Modal web endpoints with proper FastAPI integration
@app.function(
    image=image,
    volumes={"/mnt/storage": storage},
    timeout=300,
    memory=1024
)
@modal.asgi_app()
def upload_endpoint():
    """Handle file uploads"""
    from fastapi import FastAPI, File, UploadFile
    app = FastAPI()
    
    @app.post("/")
    async def upload_file_endpoint(file: UploadFile = File(...)):
        return await upload_file(file)
    
    return app

@app.function(
    image=image, 
    volumes={"/mnt/storage": storage},
    timeout=300,
    memory=2048
)
@modal.asgi_app()
def extract_endpoint():
    """Handle content extraction"""
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.post("/")
    async def extract_content_endpoint(request: ExtractionRequest):
        return await extract_content(request)
    
    return app

@app.function(
    image=image,
    volumes={"/mnt/storage": storage}, 
    timeout=120,
    memory=1024
)
@modal.asgi_app()
def annotated_image_endpoint():
    """Handle annotated image requests"""
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/{upload_id}/{model}/{page}")
    async def get_annotated_image_endpoint(upload_id: str, model: str, page: int):
        return await get_annotated_image(upload_id, model, page)
    
    return app

@app.function(image=image, timeout=30)
@modal.asgi_app()
def models_endpoint():
    """Handle model list requests"""
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def get_models_endpoint():
        return await get_models()
    
    return app

@app.function(image=image, timeout=30)
@modal.asgi_app()
def health_endpoint():
    """Handle health check requests"""
    from fastapi import FastAPI
    app = FastAPI()
    
    @app.get("/")
    async def health_check_endpoint():
        return await health_check()
    
    return app

if __name__ == "__main__":
    # For local development
    import uvicorn
    uvicorn.run(web_app, host="0.0.0.0", port=8000)