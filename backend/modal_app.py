import modal
import os
from pathlib import Path

# Create Modal app
app = modal.App("pdf-extraction")

# Define container image with all dependencies
image = (
    modal.Image.debian_slim(python_version="3.11")
    .pip_install([
        "fastapi==0.104.1",
        "uvicorn==0.24.0", 
        "python-multipart==0.0.6",
        "pydantic==2.5.0",
        "pillow==10.1.0",
        "pymupdf==1.23.5",
        "python-docx==1.0.1",
        "pandas==2.1.3",
        "numpy==1.25.2",
        "opencv-python==4.8.1.78",
        "requests==2.31.0",
        "aiofiles==23.2.1",
        # Docling dependencies
        "docling",
        "docling-core",
        "docling-ibm-models",
        # Surya dependencies
        "surya-ocr",
        "torch",
        "torchvision",
        "transformers",
        # MinerU dependencies
        "magic-pdf[full]",
        # Additional dependencies
        "scipy",
        "scikit-image",
        "easyocr",
    ])
    .apt_install([
        "tesseract-ocr", 
        "poppler-utils", 
        "libgl1-mesa-glx",
        "tesseract-ocr-ara",
        "tesseract-ocr-chi-sim",
        "tesseract-ocr-chi-tra", 
        "tesseract-ocr-fra",
        "tesseract-ocr-deu",
        "tesseract-ocr-spa",
        "tesseract-ocr-rus",
        "tesseract-ocr-jpn",
        "tesseract-ocr-kor",
        "tesseract-ocr-hin",
        "libglib2.0-0",
        "libsm6",
        "libxext6",
        "libxrender-dev",
        "libgomp1",
        "curl",
        "wget"
    ])
)

# Create persistent volume for temporary file storage
volume = modal.Volume.from_name("pdf-extraction-storage", create_if_missing=True)

@app.function(
    image=image,
    volumes={"/tmp/storage": volume},
    timeout=300,
    memory=4096,
    allow_concurrent_inputs=10,
)
@modal.web_endpoint(method="POST", label="upload-pdf")
async def upload_pdf(request):
    """Upload PDF file endpoint"""
    from fastapi import FastAPI, UploadFile, File, HTTPException
    from fastapi.responses import JSONResponse
    import uuid
    import json
    
    # Initialize FastAPI app
    web_app = FastAPI()
    
    @web_app.post("/upload")
    async def upload_file(file: UploadFile = File(...)):
        try:
            # Validate file type
            if not file.filename.endswith('.pdf'):
                raise HTTPException(status_code=400, detail="Only PDF files are allowed")
            
            # Generate unique ID for upload
            upload_id = str(uuid.uuid4())
            
            # Save file to volume
            file_path = f"/tmp/storage/{upload_id}.pdf"
            content = await file.read()
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            # Get basic file info using PyMuPDF
            import fitz
            with fitz.open(file_path) as pdf_doc:
                page_count = len(pdf_doc)
            
            return JSONResponse({
                "upload_id": upload_id,
                "filename": file.filename,
                "size": len(content),
                "pages": page_count,
                "status": "uploaded"
            })
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # Process the request
    return await web_app(request.scope, request.receive, request.send)

@app.function(
    image=image,
    volumes={"/tmp/storage": volume},
    timeout=600,
    memory=8192,
    gpu="T4",  # Use GPU for model inference
)
@modal.web_endpoint(method="POST", label="extract-content")
async def extract_content(request):
    """Extract content from PDF using selected models"""
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import JSONResponse
    import json
    import fitz  # PyMuPDF
    from datetime import datetime
    
    web_app = FastAPI()
    
    @web_app.post("/extract")
    async def process_extraction(data: dict):
        try:
            upload_id = data.get("upload_id")
            models = data.get("models", ["docling"])
            options = data.get("options", {})
            
            if not upload_id:
                raise HTTPException(status_code=400, detail="Upload ID required")
            
            file_path = f"/tmp/storage/{upload_id}.pdf"
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")
            
            results = {}
            
            # Process with each selected model
            for model_name in models:
                start_time = datetime.now()
                
                try:
                    if model_name == "docling":
                        # Import and use Docling pipeline
                        from models.docling_pipeline import process_with_docling
                        result = await process_with_docling(file_path, options)
                    elif model_name == "surya":
                        # Import and use Surya pipeline
                        from models.surya_pipeline import process_with_surya
                        result = await process_with_surya(file_path, options)
                    elif model_name == "mineru":
                        # Import and use MinerU pipeline
                        from models.mineru_pipeline import process_with_mineru
                        result = await process_with_mineru(file_path, options)
                    elif model_name == "pymupdf_basic":
                        result = await process_with_pymupdf_basic(file_path, options)
                    elif model_name == "pymupdf_advanced":
                        result = await process_with_pymupdf_advanced(file_path, options)
                    else:
                        continue
                    
                    processing_time = (datetime.now() - start_time).total_seconds()
                    
                    results[model_name] = {
                        **result,
                        "processing_time": processing_time,
                        "model": model_name
                    }
                
                except Exception as e:
                    import logging
                    logger = logging.getLogger(__name__)
                    logger.error(f"Error processing with {model_name}: {e}")
                    results[model_name] = {
                        "markdown": "",
                        "elements": [],
                        "metadata": {"total_pages": 0, "total_elements": 0, "confidence_avg": 0},
                        "success": False,
                        "error": str(e),
                        "processing_time": (datetime.now() - start_time).total_seconds(),
                        "model": model_name
                    }
            
            return JSONResponse({
                "upload_id": upload_id,
                "results": results,
                "status": "completed"
            })
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    async def process_with_pymupdf_basic(file_path: str, options: dict):
        """Process PDF with basic PyMuPDF extraction"""
        doc = fitz.open(file_path)
        
        content = ""
        elements = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            page_text = page.get_text()
            content += f"\n\n## Page {page_num + 1}\n\n{page_text}"
            
            # Extract text blocks with basic positioning
            blocks = page.get_text("dict")
            for block_idx, block in enumerate(blocks["blocks"]):
                if "lines" in block:
                    block_text = ""
                    for line in block["lines"]:
                        for span in line["spans"]:
                            block_text += span["text"]
                    
                    if block_text.strip():
                        elements.append({
                            "id": f"page_{page_num}_block_{block_idx}",
                            "type": "text",
                            "content": block_text.strip(),
                            "bbox": {
                                "x1": block["bbox"][0],
                                "y1": block["bbox"][1], 
                                "x2": block["bbox"][2],
                                "y2": block["bbox"][3],
                                "page": page_num
                            },
                            "confidence": 0.85
                        })
        
        doc.close()
        
        return {
            "markdown": content,
            "elements": elements,
            "metadata": {
                "total_pages": len(doc),
                "total_elements": len(elements),
                "confidence_avg": 0.85,
                "by_type": {"text": len(elements)},
                "features_detected": ["text"],
                "model_version": "pymupdf_basic_v1.0"
            },
            "success": True
        }
    
    async def process_with_pymupdf_advanced(file_path: str, options: dict):
        """Process PDF with advanced PyMuPDF extraction including tables"""
        doc = fitz.open(file_path)
        
        content = ""
        elements = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            
            # Extract text blocks
            blocks = page.get_text("dict")
            page_content = f"\n\n## Page {page_num + 1}\n\n"
            
            for block_idx, block in enumerate(blocks["blocks"]):
                if "lines" in block:
                    block_text = ""
                    for line in block["lines"]:
                        for span in line["spans"]:
                            block_text += span["text"]
                    
                    if block_text.strip():
                        elements.append({
                            "id": f"page_{page_num}_block_{block_idx}",
                            "type": "text",
                            "content": block_text.strip(),
                            "bbox": {
                                "x1": block["bbox"][0],
                                "y1": block["bbox"][1],
                                "x2": block["bbox"][2], 
                                "y2": block["bbox"][3],
                                "page": page_num
                            },
                            "confidence": 0.90
                        })
                        page_content += f"{block_text.strip()}\n\n"
            
            # Extract tables
            try:
                tables = page.find_tables()
                for table_idx, table in enumerate(tables):
                    table_data = table.extract()
                    if table_data:
                        elements.append({
                            "id": f"page_{page_num}_table_{table_idx}",
                            "type": "table",
                            "content": str(table_data),
                            "bbox": {
                                "x1": table.bbox[0],
                                "y1": table.bbox[1],
                                "x2": table.bbox[2],
                                "y2": table.bbox[3], 
                                "page": page_num
                            },
                            "confidence": 0.85
                        })
                        
                        # Format as markdown table
                        if len(table_data) > 0:
                            headers = table_data[0]
                            page_content += "\n| " + " | ".join(headers) + " |\n"
                            page_content += "| " + " | ".join(["---"] * len(headers)) + " |\n"
                            for row in table_data[1:]:
                                if len(row) == len(headers):
                                    page_content += "| " + " | ".join(row) + " |\n"
                            page_content += "\n"
            except:
                pass
            
            content += page_content
        
        doc.close()
        
        element_types = {}
        for element in elements:
            element_type = element["type"]
            element_types[element_type] = element_types.get(element_type, 0) + 1
        
        return {
            "markdown": content,
            "elements": elements,
            "metadata": {
                "total_pages": len(doc),
                "total_elements": len(elements),
                "confidence_avg": sum(e["confidence"] for e in elements) / len(elements) if elements else 0.87,
                "by_type": element_types,
                "features_detected": ["text", "tables"],
                "model_version": "pymupdf_advanced_v1.0"
            },
            "success": True
        }
    
    return await web_app(request.scope, request.receive, request.send)

@app.function(
    image=image,
    volumes={"/tmp/storage": volume},
    timeout=300,
    memory=2048,
)
@modal.web_endpoint(method="GET", label="annotated-image")
async def get_annotated_image(request):
    """Generate annotated PDF image"""
    from fastapi import FastAPI, HTTPException
    from fastapi.responses import Response
    import fitz
    import io
    from PIL import Image, ImageDraw
    
    web_app = FastAPI()
    
    @web_app.get("/annotated-image/{upload_id}/{model_name}/{page_num}")
    async def generate_annotated_image(upload_id: str, model_name: str, page_num: int):
        try:
            file_path = f"/tmp/storage/{upload_id}.pdf"
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=404, detail="File not found")
            
            # Open PDF and get page
            doc = fitz.open(file_path)
            page = doc[page_num]
            
            # Render page as image
            mat = fitz.Matrix(2.0, 2.0)  # 2x zoom for better quality
            pix = page.get_pixmap(matrix=mat)
            img_data = pix.tobytes("png")
            
            # Load with PIL for annotation
            img = Image.open(io.BytesIO(img_data))
            draw = ImageDraw.Draw(img)
            
            # Add mock annotations (replace with real extraction results)
            # Title - Red
            draw.rectangle([100, 100, 500, 150], outline="red", width=3)
            # Header - Orange  
            draw.rectangle([100, 200, 400, 230], outline="orange", width=2)
            # Text blocks - Blue
            draw.rectangle([100, 250, 600, 400], outline="blue", width=2)
            # Table - Green
            draw.rectangle([100, 450, 600, 600], outline="green", width=3)
            
            doc.close()
            
            # Return image as PNG
            img_buffer = io.BytesIO()
            img.save(img_buffer, format="PNG")
            img_buffer.seek(0)
            
            return Response(
                content=img_buffer.getvalue(),
                media_type="image/png"
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    return await web_app(request.scope, request.receive, request.send)

@app.function(image=image)
@modal.web_endpoint(method="GET", label="models")
async def get_available_models():
    """Get list of available models"""
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    web_app = FastAPI()
    
    @web_app.get("/models")
    async def list_models():
        # Import logging
        import logging
        logger = logging.getLogger(__name__)
        
        models = [
            {
                "id": "docling",
                "name": "Docling",
                "description": "IBM's document understanding AI model",
                "features": ["Tables", "Hierarchical structure", "Element classification", "Metadata"],
                "speed": "Fast (5-10s per page)",
                "recommended_for": ["Business documents", "Reports", "Invoices", "Structured documents"],
                "available": True
            },
            {
                "id": "surya",
                "name": "Surya",
                "description": "Multilingual OCR and layout analysis",
                "features": ["90+ languages", "Layout detection", "Reading order", "Language detection"],
                "speed": "Medium (10-15s per page)",
                "recommended_for": ["Non-English documents", "Complex layouts", "Multilingual content"],
                "available": True
            },
            {
                "id": "mineru",
                "name": "MinerU",
                "description": "Scientific document processing with formula extraction",
                "features": ["LaTeX formulas", "Citations", "Academic structure", "Formula conversion"],
                "speed": "Medium (8-12s per page)",
                "recommended_for": ["Research papers", "Academic articles", "Scientific documents"],
                "available": True
            },
            {
                "id": "pymupdf_basic",
                "name": "PyMuPDF Basic",
                "description": "Fast and lightweight PDF text extraction",
                "features": ["Text extraction", "Basic positioning", "Fast processing"],
                "speed": "Very Fast (1-2s per page)",
                "recommended_for": ["Simple documents", "Quick extraction", "Text-only needs"],
                "available": True
            },
            {
                "id": "pymupdf_advanced",
                "name": "PyMuPDF Advanced",
                "description": "Enhanced PyMuPDF with table detection",
                "features": ["Text extraction", "Table detection", "Layout analysis", "Positioning"],
                "speed": "Fast (2-4s per page)",
                "recommended_for": ["Documents with tables", "Structured content", "Reliable extraction"],
                "available": True
            }
        ]
        
        return JSONResponse({"models": models})
    
    return await web_app(request.scope, request.receive, request.send)

if __name__ == "__main__":
    print("Deploy with: modal deploy modal_app.py")
    print("Available endpoints:")
    print("- POST /upload - Upload PDF files")
    print("- POST /extract - Extract content")
    print("- GET /annotated-image/{upload_id}/{model}/{page} - Get annotated images")
    print("- GET /models - List available models")