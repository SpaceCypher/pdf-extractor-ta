"""
Surya OCR pipeline for multilingual document processing
Advanced OCR and layout analysis with support for 90+ languages
"""

import asyncio
import fitz  # PyMuPDF for fallback
from typing import Dict, List, Any, Optional
import logging
import numpy as np
from PIL import Image
import io

logger = logging.getLogger(__name__)

class SuryaPipeline:
    def __init__(self):
        self.model_name = "surya"
        self.initialized = False
        self.ocr_model = None
        self.layout_model = None
        
    async def initialize(self):
        """Initialize Surya models"""
        try:
            # Try to import and initialize Surya
            from surya.ocr import run_ocr
            from surya.model.detection.segformer import load_model as load_det_model, load_processor as load_det_processor
            from surya.model.recognition.model import load_model as load_rec_model
            from surya.model.recognition.processor import load_processor as load_rec_processor
            from surya.model.ordering.processor import load_processor as load_order_processor
            from surya.model.ordering.model import load_model as load_order_model
            from surya.layout import batch_layout_detection
            from surya.ordering import batch_ordering
            
            # Load models
            self.det_processor, self.det_model = load_det_processor(), load_det_model()
            self.rec_model, self.rec_processor = load_rec_model(), load_rec_processor()
            self.order_model, self.order_processor = load_order_model(), load_order_processor()
            
            # Store required functions
            self.run_ocr = run_ocr
            self.batch_layout_detection = batch_layout_detection
            self.batch_ordering = batch_ordering
            
            self.initialized = True
            logger.info("Surya OCR models initialized successfully")
            
        except ImportError as e:
            logger.warning(f"Surya not available, using fallback OCR: {e}")
            self.initialized = False
        except Exception as e:
            logger.error(f"Failed to initialize Surya: {e}")
            self.initialized = False
    
    async def extract(self, file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Extract content from PDF using Surya OCR"""
        if not self.initialized:
            await self.initialize()
        
        if not self.initialized:
            # Fallback to enhanced PyMuPDF processing
            return await self._fallback_extraction(file_path, options)
        
        try:
            # Convert PDF pages to images
            doc = fitz.open(file_path)
            images = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                # Render at higher DPI for better OCR
                mat = fitz.Matrix(2.0, 2.0)
                pix = page.get_pixmap(matrix=mat)
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                images.append(img)
            
            doc.close()
            
            # Language detection (default to multilingual)
            languages = options.get("languages", ["en", "es", "fr", "de", "zh", "ja", "ar"]) if options else ["en"]
            
            # Run layout detection
            layout_results = self.batch_layout_detection(images, self.det_model, self.det_processor)
            
            # Run OCR on detected regions
            ocr_results = self.run_ocr(images, [languages] * len(images), self.det_model, self.det_processor, self.rec_model, self.rec_processor)
            
            # Run reading order detection
            order_results = self.batch_ordering(images, layout_results, self.order_model, self.order_processor)
            
            # Process results
            markdown_content = ""
            elements = []
            
            for page_num, (ocr_result, layout_result, order_result) in enumerate(zip(ocr_results, layout_results, order_results)):
                page_content = f"\n\n## Page {page_num + 1}\n\n"
                
                # Sort text lines by reading order
                ordered_lines = []
                if order_result and hasattr(order_result, 'bboxes'):
                    for i, bbox in enumerate(order_result.bboxes):
                        # Find corresponding OCR text
                        for text_line in ocr_result.text_lines:
                            if self._bbox_overlap(bbox, text_line.bbox):
                                ordered_lines.append((i, text_line))
                                break
                else:
                    # Fallback: sort by y-position
                    ordered_lines = [(i, line) for i, line in enumerate(ocr_result.text_lines)]
                    ordered_lines.sort(key=lambda x: x[1].bbox[1])  # Sort by y-coordinate
                
                # Process ordered text lines
                for order_idx, text_line in ordered_lines:
                    if text_line.text.strip():
                        # Determine element type from layout detection
                        element_type = self._classify_from_layout(text_line.bbox, layout_result)
                        
                        elements.append({
                            "id": f"page_{page_num}_line_{order_idx}",
                            "type": element_type,
                            "content": text_line.text.strip(),
                            "bbox": {
                                "x1": text_line.bbox[0],
                                "y1": text_line.bbox[1],
                                "x2": text_line.bbox[2],
                                "y2": text_line.bbox[3],
                                "page": page_num
                            },
                            "confidence": getattr(text_line, 'confidence', 0.90),
                            "language": getattr(text_line, 'language', 'unknown')
                        })
                        
                        # Add to markdown with appropriate formatting
                        if element_type == "title":
                            page_content += f"# {text_line.text.strip()}\n\n"
                        elif element_type == "header":
                            page_content += f"## {text_line.text.strip()}\n\n"
                        elif element_type == "list":
                            page_content += f"- {text_line.text.strip()}\n"
                        else:
                            page_content += f"{text_line.text.strip()}\n\n"
                
                # Process layout elements (tables, figures, etc.)
                if layout_result and hasattr(layout_result, 'bboxes'):
                    for i, (bbox, label) in enumerate(zip(layout_result.bboxes, layout_result.labels)):
                        if label in ['Table', 'Figure', 'Chart']:
                            element_type = "table" if label == "Table" else "image"
                            elements.append({
                                "id": f"page_{page_num}_layout_{i}",
                                "type": element_type,
                                "content": f"[{label} detected at layout analysis]",
                                "bbox": {
                                    "x1": bbox[0],
                                    "y1": bbox[1],
                                    "x2": bbox[2],
                                    "y2": bbox[3],
                                    "page": page_num
                                },
                                "confidence": 0.85,
                                "language": "layout",
                                "layout_type": label
                            })
                
                markdown_content += page_content
            
            # Generate metadata
            metadata = {
                "total_pages": len(images),
                "total_elements": len(elements),
                "by_type": self._count_by_type(elements),
                "confidence_avg": sum(e["confidence"] for e in elements) / len(elements) if elements else 0.90,
                "languages_detected": list(set(e.get("language", "unknown") for e in elements)),
                "features_detected": ["ocr", "layout", "multilingual", "reading_order"],
                "model_version": "surya_v1.0"
            }
            
            return {
                "markdown": markdown_content,
                "elements": elements,
                "metadata": metadata,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Surya extraction failed: {e}")
            # Fallback to PyMuPDF
            return await self._fallback_extraction(file_path, options)
    
    def _bbox_overlap(self, bbox1, bbox2) -> bool:
        """Check if two bounding boxes overlap"""
        return not (bbox1[2] < bbox2[0] or bbox2[2] < bbox1[0] or bbox1[3] < bbox2[1] or bbox2[3] < bbox1[1])
    
    def _classify_from_layout(self, bbox, layout_result) -> str:
        """Classify element type based on layout detection"""
        if not layout_result or not hasattr(layout_result, 'bboxes'):
            return "text"
        
        # Find overlapping layout regions
        for layout_bbox, label in zip(layout_result.bboxes, layout_result.labels):
            if self._bbox_overlap(bbox, layout_bbox):
                label_lower = label.lower()
                if 'title' in label_lower or 'heading' in label_lower:
                    return 'title'
                elif 'header' in label_lower:
                    return 'header'
                elif 'table' in label_lower:
                    return 'table'
                elif 'list' in label_lower:
                    return 'list'
                elif 'figure' in label_lower or 'image' in label_lower:
                    return 'image'
        
        return "text"
    
    def _count_by_type(self, elements: List[Dict]) -> Dict[str, int]:
        """Count elements by type"""
        counts = {}
        for element in elements:
            element_type = element["type"]
            counts[element_type] = counts.get(element_type, 0) + 1
        return counts
    
    def _estimate_image_bbox(self, page, xref: int, pix) -> List[float]:
        """Estimate image bounding box on the page"""
        try:
            # Try to get the actual image rect from page
            page_rect = page.rect
            
            # If we can't find exact placement, estimate based on image size and page layout
            page_width = page_rect.width
            page_height = page_rect.height
            
            # Estimate position - center the image with reasonable margins
            img_width = min(pix.width, page_width * 0.8)  # Don't exceed 80% of page width
            img_height = min(pix.height, page_height * 0.6)  # Don't exceed 60% of page height
            
            # Center horizontally, place in middle/lower section vertically
            x1 = (page_width - img_width) / 2
            y1 = page_height * 0.3  # Start at 30% down the page
            x2 = x1 + img_width
            y2 = y1 + img_height
            
            return [x1, y1, x2, y2]
            
        except Exception as e:
            logger.warning(f"Could not estimate image bbox: {e}")
            # Fallback to default positioning
            return [100, 200, 400, 500]
    
    async def _fallback_extraction(self, file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fallback extraction using PyMuPDF with OCR-like processing"""
        try:
            doc = fitz.open(file_path)
            
            markdown_content = ""
            elements = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Try to extract text normally first
                page_text = page.get_text()
                
                if len(page_text.strip()) < 50:  # Likely scanned document
                    # Convert to image and do basic OCR simulation
                    mat = fitz.Matrix(2.0, 2.0)
                    pix = page.get_pixmap(matrix=mat)
                    
                    # Fallback: extract text blocks with position info
                    blocks = page.get_text("dict")
                    page_content = f"\n\n## Page {page_num + 1}\n\n"
                    
                    if blocks and blocks.get("blocks"):
                        for block_idx, block in enumerate(blocks["blocks"]):
                            if "lines" not in block:
                                continue
                            
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
                                    "confidence": 0.75,  # Lower confidence for fallback
                                    "language": "unknown"
                                })
                                
                                page_content += f"{block_text.strip()}\n\n"
                    
                    # Extract images from the page
                    try:
                        image_list = page.get_images(full=True)
                        for img_idx, img in enumerate(image_list):
                            # Get image info
                            xref = img[0]
                            pix_img = fitz.Pixmap(doc, xref)
                            
                            # Skip very small images (likely decorative)
                            if pix_img.width < 50 or pix_img.height < 50:
                                pix_img = None
                                continue
                            
                            # Get image bbox - estimate from page content if not available
                            img_bbox = self._estimate_image_bbox(page, xref, pix_img)
                            
                            # Create image element
                            image_element = {
                                "id": f"page_{page_num}_image_{img_idx}",
                                "type": "image",
                                "content": f"[Image: {pix_img.width}x{pix_img.height} pixels]",
                                "bbox": {
                                    "x1": img_bbox[0],
                                    "y1": img_bbox[1],
                                    "x2": img_bbox[2],
                                    "y2": img_bbox[3],
                                    "page": page_num
                                },
                                "confidence": 0.85,
                                "language": "image",
                                "image_info": {
                                    "width": pix_img.width,
                                    "height": pix_img.height,
                                    "colorspace": pix_img.colorspace.name if pix_img.colorspace else "Unknown",
                                    "xref": xref,
                                    "size_bytes": len(pix_img.tobytes())
                                }
                            }
                            
                            elements.append(image_element)
                            
                            # Add image to markdown
                            page_content += f"\n![Image {img_idx + 1}](image_{page_num}_{img_idx}.png)\n"
                            page_content += f"*Image: {pix_img.width}x{pix_img.height} pixels*\n\n"
                            
                            # Clean up pixmap
                            pix_img = None
                            
                    except Exception as e:
                        logger.warning(f"Image extraction failed for page {page_num}: {e}")
                        pass
                    
                    else:
                        # Very basic fallback
                        page_content += f"[Scanned page - OCR needed]\n\n"
                        elements.append({
                            "id": f"page_{page_num}_scanned",
                            "type": "text",
                            "content": "[Scanned content detected - OCR processing recommended]",
                            "bbox": {"x1": 0, "y1": 0, "x2": 612, "y2": 792, "page": page_num},
                            "confidence": 0.50,
                            "language": "unknown"
                        })
                else:
                    # Regular text extraction
                    blocks = page.get_text("dict")
                    page_content = f"\n\n## Page {page_num + 1}\n\n"
                    
                    for block_idx, block in enumerate(blocks["blocks"]):
                        if "lines" not in block:
                            continue
                        
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
                                "confidence": 0.80,
                                "language": "en"  # Default assumption
                            })
                            
                            page_content += f"{block_text.strip()}\n\n"
                    
                    # Extract images from the page (for regular text extraction)
                    try:
                        image_list = page.get_images(full=True)
                        for img_idx, img in enumerate(image_list):
                            # Get image info
                            xref = img[0]
                            pix_img = fitz.Pixmap(doc, xref)
                            
                            # Skip very small images (likely decorative)
                            if pix_img.width < 50 or pix_img.height < 50:
                                pix_img = None
                                continue
                            
                            # Get image bbox - estimate from page content if not available
                            img_bbox = self._estimate_image_bbox(page, xref, pix_img)
                            
                            # Create image element
                            image_element = {
                                "id": f"page_{page_num}_image_{img_idx}",
                                "type": "image",
                                "content": f"[Image: {pix_img.width}x{pix_img.height} pixels]",
                                "bbox": {
                                    "x1": img_bbox[0],
                                    "y1": img_bbox[1],
                                    "x2": img_bbox[2],
                                    "y2": img_bbox[3],
                                    "page": page_num
                                },
                                "confidence": 0.85,
                                "language": "image",
                                "image_info": {
                                    "width": pix_img.width,
                                    "height": pix_img.height,
                                    "colorspace": pix_img.colorspace.name if pix_img.colorspace else "Unknown",
                                    "xref": xref,
                                    "size_bytes": len(pix_img.tobytes())
                                }
                            }
                            
                            elements.append(image_element)
                            
                            # Add image to markdown
                            page_content += f"\n![Image {img_idx + 1}](image_{page_num}_{img_idx}.png)\n"
                            page_content += f"*Image: {pix_img.width}x{pix_img.height} pixels*\n\n"
                            
                            # Clean up pixmap
                            pix_img = None
                            
                    except Exception as e:
                        logger.warning(f"Image extraction failed for page {page_num}: {e}")
                        pass
                
                markdown_content += page_content
            
            doc.close()
            
            metadata = {
                "total_pages": len(doc),
                "total_elements": len(elements),
                "by_type": self._count_by_type(elements),
                "confidence_avg": sum(e["confidence"] for e in elements) / len(elements) if elements else 0.75,
                "languages_detected": ["en"],  # Default
                "features_detected": ["text", "basic_ocr"],
                "model_version": "pymupdf_ocr_fallback_v1.0"
            }
            
            return {
                "markdown": markdown_content,
                "elements": elements,
                "metadata": metadata,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Fallback OCR extraction failed: {e}")
            return {
                "markdown": "",
                "elements": [],
                "metadata": {"total_pages": 0, "total_elements": 0, "by_type": {}, "confidence_avg": 0},
                "success": False,
                "error": str(e)
            }


# Global instance
surya_pipeline = SuryaPipeline()


async def process_with_surya(file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """Process PDF with Surya OCR pipeline"""
    return await surya_pipeline.extract(file_path, options)