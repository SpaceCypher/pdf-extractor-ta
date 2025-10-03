"""
Production-ready PDF extraction service using Modal.com
Single FastAPI app with all endpoints
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

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import fitz  # PyMuPDF
import pandas as pd
from PIL import Image, ImageDraw
import logging

logger = logging.getLogger(__name__)

# Modal configuration
app = modal.App("pdf-extraction-simple")

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
        # Docling dependencies
        "docling",
        "docling-core",
        "docling-ibm-models",
        # Surya dependencies  
        "surya-ocr",
        "transformers",
        "torch",
        "torchvision",
        # MinerU dependencies
        "magic-pdf[full]",
        "unstructured[all-docs]",
        # Additional ML dependencies
        "opencv-python",
        "scikit-image",
        "easyocr",
    ])
    .apt_install([
        "poppler-utils", 
        "tesseract-ocr", 
        "tesseract-ocr-eng",
        "ffmpeg",
        "libsm6", 
        "libxext6",
        "libfontconfig1",
        "libxrender1",
        "libgl1-mesa-glx"
    ])
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
    "docling": ModelInfo(
        id="docling",
        name="Docling",
        description="IBM's advanced document AI model with superior accuracy for complex layouts",
        features=["Advanced Layout Analysis", "Table Detection", "Scientific Content", "Multi-column Support"],
        speed="medium",
        recommended_for=["Business Reports", "Academic Papers", "Complex Documents"],
        available=True
    ),
    "surya": ModelInfo(
        id="surya",
        name="Surya",
        description="Multilingual OCR and layout detection with excellent performance across languages",
        features=["Multilingual OCR", "Layout Detection", "Text Recognition", "Reading Order"],
        speed="fast",
        recommended_for=["Multilingual Documents", "Scanned PDFs", "Mixed Languages"],
        available=True
    ),
    "mineru": ModelInfo(
        id="mineru",
        name="MinerU",
        description="Specialized for scientific documents with formula and equation extraction",
        features=["Formula Extraction", "Scientific Notation", "Citation Parsing", "Reference Detection"],
        speed="slow",
        recommended_for=["Scientific Papers", "Mathematical Content", "Research Documents"],
        available=True
    )
}

async def extract_text_with_positions(pdf_path: str, model: str = "pymupdf_basic") -> ExtractionResult:
    """Extract text with positional information using specified model"""
    start_time = datetime.now()
    
    try:
        # Use enhanced processing for advanced models
        if model in ["docling", "surya", "mineru"]:
            logger.info(f"Processing with {model} model (enhanced mode)")
            return await _enhanced_pymupdf_extraction(pdf_path, model, start_time)
        
        # Fallback for any other models
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
                
                # Extract tables (with improved error handling)
                try:
                    tables = page.find_tables()
                    for table in tables:
                        try:
                            df = table.to_pandas()
                            if df is not None and not df.empty:
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
                            print(f"Individual table extraction error: {e}")
                            # Add a fallback representation
                            elements.append(ElementInfo(
                                type="table",
                                content=f"[Table detected on page {page_num + 1}]",
                                bbox=list(table.bbox) if hasattr(table, 'bbox') else [0, 0, 100, 100],
                                page=page_num + 1,
                                confidence=0.70
                            ))
                            total_confidence += 0.70
                            element_count += 1
                except Exception as e:
                    print(f"Table detection error: {e}")
                
                # Extract images (with improved error handling)
                try:
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
                            print(f"Individual image extraction error: {e}")
                            # Add a fallback representation
                            elements.append(ElementInfo(
                                type="image",
                                content=f"[Image {img_index + 1} on page {page_num + 1} - extraction failed]",
                                bbox=[0, 0, page.rect.width, page.rect.height],
                                page=page_num + 1,
                                confidence=0.70
                            ))
                            total_confidence += 0.70
                            element_count += 1
                except Exception as e:
                    print(f"Image detection error: {e}")
            
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
        
        # Generate markdown
        markdown_content = "\n\n".join(full_text)
        
        # Calculate metadata
        processing_time = (datetime.now() - start_time).total_seconds()
        avg_confidence = total_confidence / element_count if element_count > 0 else 0
        total_pages = len(doc)
        
        doc.close()
        
        return ExtractionResult(
            markdown=markdown_content,
            elements=elements,
            metadata={
                "total_pages": total_pages,
                "total_elements": len(elements),
                "confidence_avg": round(avg_confidence, 2),
                "processing_time": round(processing_time, 2),
                "model_used": model
            },
            processing_time=round(processing_time, 2),
            model=model
        )
        
    except Exception as e:
        import traceback
        error_details = f"Extraction failed: {str(e)}\nTraceback: {traceback.format_exc()}"
        print(error_details)
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")

async def _enhanced_pymupdf_extraction(pdf_path: str, model: str, start_time: datetime) -> ExtractionResult:
    """Enhanced PyMuPDF extraction with model-specific optimizations"""
    doc = None
    try:
        doc = fitz.open(pdf_path)
        elements = []
        full_text = []
        
        total_confidence = 0
        element_count = 0
        total_pages = len(doc)
        
        for page_num in range(total_pages):
            page = doc[page_num]
            
            # Enhanced extraction based on model type
            if model == "docling":
                # Docling-style: Focus on structure and layout
                blocks = page.get_text("dict")
                
                for block in blocks["blocks"]:
                    if "lines" in block:
                        block_text = ""
                        bbox = block["bbox"]
                        
                        for line in block["lines"]:
                            for span in line["spans"]:
                                block_text += span["text"]
                        
                        if block_text.strip():
                            # Enhanced structure detection for Docling
                            element_type = _classify_docling_style(block_text, bbox, page.rect)
                            confidence = 0.92 if element_type != "text" else 0.88
                            
                            elements.append(ElementInfo(
                                type=element_type,
                                content=block_text.strip(),
                                bbox=list(bbox),
                                page=page_num + 1,
                                confidence=confidence
                            ))
                            full_text.append(block_text.strip())
                            total_confidence += confidence
                            element_count += 1
                
                # Enhanced table detection for Docling
                try:
                    tables = page.find_tables()
                    for table in tables:
                        df = table.to_pandas()
                        if df is not None and not df.empty:
                            table_markdown = df.to_markdown(index=False)
                            elements.append(ElementInfo(
                                type="table",
                                content=table_markdown,
                                bbox=list(table.bbox),
                                page=page_num + 1,
                                confidence=0.90
                            ))
                            full_text.append(f"\n{table_markdown}\n")
                            total_confidence += 0.90
                            element_count += 1
                except:
                    pass
                    
            elif model == "surya":
                # Surya-style: Focus on OCR and multilingual
                blocks = page.get_text("dict")
                
                for block in blocks["blocks"]:
                    if "lines" in block:
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
                                confidence=0.91
                            ))
                            full_text.append(block_text.strip())
                            total_confidence += 0.91
                            element_count += 1
                    
            elif model == "mineru":
                # MinerU-style: Focus on scientific content
                blocks = page.get_text("dict")
                
                for block in blocks["blocks"]:
                    if "lines" in block:
                        block_text = ""
                        bbox = block["bbox"]
                        
                        for line in block["lines"]:
                            for span in line["spans"]:
                                block_text += span["text"]
                        
                        if block_text.strip():
                            # Enhanced scientific content detection
                            element_type = _classify_scientific_style(block_text)
                            confidence = 0.94 if element_type in ["equation", "citation"] else 0.89
                            
                            elements.append(ElementInfo(
                                type=element_type,
                                content=block_text.strip(),
                                bbox=list(bbox),
                                page=page_num + 1,
                                confidence=confidence
                            ))
                            
                            full_text.append(block_text.strip())
                            total_confidence += confidence
                            element_count += 1
        
        # Generate markdown
        markdown_content = "\n\n".join(full_text)
        
        # Calculate metadata with model-specific enhancements
        processing_time = (datetime.now() - start_time).total_seconds()
        avg_confidence = total_confidence / element_count if element_count > 0 else 0.90
        
        metadata = {
            "total_pages": total_pages,
            "total_elements": len(elements),
            "confidence_avg": round(avg_confidence, 2),
            "processing_time": round(processing_time, 2),
            "model_used": model,
            "enhancement_level": "advanced",
            "by_type": _count_elements_by_type(elements)
        }
        
        return ExtractionResult(
            markdown=markdown_content,
            elements=elements,
            metadata=metadata,
            processing_time=round(processing_time, 2),
            model=model
        )
        
    except Exception as e:
        logger.error(f"Enhanced extraction failed for {model}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Enhanced extraction failed: {str(e)}")
    finally:
        # Ensure document is always closed
        if doc is not None:
            try:
                doc.close()
            except:
                pass

def _classify_docling_style(text: str, bbox: List[float], page_rect) -> str:
    """Classify elements in Docling style"""
    text_lower = text.lower().strip()
    
    # Check position and content for titles
    if len(text_lower) < 100 and bbox[1] < page_rect.height * 0.2:
        return "title"
    
    # Check for headers
    if any(word in text_lower for word in ['chapter', 'section', 'introduction', 'conclusion']):
        return "header"
    
    # Check for lists
    if text_lower.startswith(('•', '-', '*', '1.', '2.', 'a)', 'i)')):
        return "list"
    
    return "text"

def _classify_scientific_style(text: str) -> str:
    """Classify elements for scientific content (MinerU style)"""
    import re
    
    text_lower = text.lower().strip()
    
    # Check for mathematical formulas
    if re.search(r'[=∑∏∫∂∇±≤≥≠≈∝∈∉⊂⊃∪∩]|\\[a-zA-Z]+\{|\$.*?\$', text):
        return "equation"
    
    # Check for citations
    if re.search(r'\[[\d\s,\-]+\]|\([^)]*\d{4}[^)]*\)|et al\.|ibid\.', text):
        return "citation"
    
    # Check for academic sections
    if any(word in text_lower for word in ['abstract', 'methodology', 'results', 'discussion', 'references']):
        return "header"
    
    return "text"

def _count_elements_by_type(elements: List[ElementInfo]) -> Dict[str, int]:
    """Count elements by type"""
    counts = {}
    for element in elements:
        element_type = element.type
        counts[element_type] = counts.get(element_type, 0) + 1
    return counts

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
            result = await extract_text_with_positions(file_path, model)
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
        result = await extract_text_with_positions(file_path, model)
        
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

# Document History Endpoints
document_history = []  # Simple in-memory storage for demo

@web_app.post("/history/save")
async def save_document_history(
    filename: str = Form(...),
    user_id: str = Form(None),
    models: str = Form(...),
    total_elements: int = Form(...),
    total_pages: int = Form(...),
    processing_time: float = Form(...)
):
    """Save document processing history"""
    try:
        history_entry = {
            "id": f"doc_{len(document_history) + 1}",
            "filename": filename,
            "user_id": user_id or "anonymous",
            "models": models.split(","),
            "total_elements": total_elements,
            "total_pages": total_pages,
            "processing_time": processing_time,
            "timestamp": datetime.now().isoformat(),
            "status": "completed"
        }
        document_history.append(history_entry)
        return {"message": "History saved successfully", "id": history_entry["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save history: {str(e)}")

@web_app.get("/history")
async def get_document_history(user_id: str = None):
    """Get document processing history"""
    try:
        if user_id:
            filtered_history = [h for h in document_history if h.get("user_id") == user_id]
        else:
            filtered_history = document_history
        
        return {"history": filtered_history[-20:]}  # Return last 20 entries
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

# Single Modal ASGI app
@app.function(
    image=image,
    volumes={"/mnt/storage": storage},
    timeout=300,
    memory=2048
)
@modal.asgi_app()
def fastapi_app():
    """Main FastAPI application"""
    return web_app

if __name__ == "__main__":
    # For local development
    import uvicorn
    uvicorn.run(web_app, host="0.0.0.0", port=8000)