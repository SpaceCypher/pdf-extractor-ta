"""
Docling PDF extraction pipeline
IBM's advanced document understanding model for PDF processing
"""

import asyncio
import fitz  # PyMuPDF for fallback
from typing import Dict, List, Any, Optional
import logging

logger = logging.getLogger(__name__)

class DoclingPipeline:
    def __init__(self):
        self.model_name = "docling"
        self.initialized = False
        
    async def initialize(self):
        """Initialize Docling model"""
        try:
            # Try to import and initialize Docling
            from docling.document_converter import DocumentConverter
            from docling.datamodel.base_models import InputFormat
            from docling.datamodel.pipeline_options import PdfPipelineOptions
            from docling.backend.pypdfium2_backend import PyPdfiumDocumentBackend
            
            # Configure pipeline for optimal PDF processing
            pipeline_options = PdfPipelineOptions()
            pipeline_options.do_ocr = True
            pipeline_options.do_table_structure = True
            pipeline_options.table_structure_options.do_cell_matching = True
            
            self.converter = DocumentConverter(
                format_options={
                    InputFormat.PDF: pipeline_options,
                },
                pdf_backend=PyPdfiumDocumentBackend,
            )
            
            self.initialized = True
            logger.info("Docling model initialized successfully")
            
        except ImportError as e:
            logger.warning(f"Docling not available, using fallback PyMuPDF: {e}")
            self.initialized = False
        except Exception as e:
            logger.error(f"Failed to initialize Docling: {e}")
            self.initialized = False
    
    async def extract(self, file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Extract content from PDF using Docling"""
        if not self.initialized:
            await self.initialize()
        
        if not self.initialized:
            # Fallback to PyMuPDF with enhanced processing
            return await self._fallback_extraction(file_path, options)
        
        try:
            # Process with Docling
            result = self.converter.convert(file_path)
            
            # Extract structured content
            markdown_content = result.document.export_to_markdown()
            
            # Extract elements with bounding boxes
            elements = []
            for item in result.document.body:
                if hasattr(item, 'bbox') and item.bbox:
                    elements.append({
                        "id": f"element_{len(elements)}",
                        "type": self._get_element_type(item),
                        "content": str(item.text) if hasattr(item, 'text') else str(item),
                        "bbox": {
                            "x1": item.bbox.l,
                            "y1": item.bbox.t,
                            "x2": item.bbox.r,
                            "y2": item.bbox.b,
                            "page": getattr(item, 'page', 0)
                        },
                        "confidence": getattr(item, 'confidence', 0.95)
                    })
            
            # Extract metadata
            metadata = {
                "total_pages": len(result.document.pages) if hasattr(result.document, 'pages') else 1,
                "total_elements": len(elements),
                "by_type": self._count_by_type(elements),
                "confidence_avg": sum(e["confidence"] for e in elements) / len(elements) if elements else 0.95,
                "features_detected": ["text", "tables", "structure", "layout"],
                "model_version": "docling_v1.0"
            }
            
            return {
                "markdown": markdown_content,
                "elements": elements,
                "metadata": metadata,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Docling extraction failed: {e}")
            # Fallback to PyMuPDF
            return await self._fallback_extraction(file_path, options)
    
    def _get_element_type(self, item) -> str:
        """Determine element type from Docling item"""
        item_type = type(item).__name__.lower()
        
        if 'title' in item_type or 'heading' in item_type:
            return 'title'
        elif 'header' in item_type:
            return 'header'
        elif 'table' in item_type:
            return 'table'
        elif 'list' in item_type:
            return 'list'
        elif 'figure' in item_type or 'image' in item_type:
            return 'image'
        else:
            return 'text'
    
    def _count_by_type(self, elements: List[Dict]) -> Dict[str, int]:
        """Count elements by type"""
        counts = {}
        for element in elements:
            element_type = element["type"]
            counts[element_type] = counts.get(element_type, 0) + 1
        return counts
    
    async def _fallback_extraction(self, file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Fallback extraction using PyMuPDF with enhanced processing"""
        try:
            doc = fitz.open(file_path)
            
            markdown_content = ""
            elements = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Extract text blocks with enhanced structure detection
                blocks = page.get_text("dict")
                page_content = f"\n\n## Page {page_num + 1}\n\n"
                
                # Process blocks to identify structure
                for block_idx, block in enumerate(blocks["blocks"]):
                    if "lines" not in block:
                        continue
                    
                    block_text = ""
                    block_bbox = block["bbox"]
                    
                    for line in block["lines"]:
                        line_text = ""
                        for span in line["spans"]:
                            line_text += span["text"]
                        
                        if line_text.strip():
                            block_text += line_text + "\n"
                    
                    if block_text.strip():
                        # Determine element type based on formatting and position
                        element_type = self._classify_block(block_text, block_bbox, blocks["blocks"])
                        
                        elements.append({
                            "id": f"page_{page_num}_block_{block_idx}",
                            "type": element_type,
                            "content": block_text.strip(),
                            "bbox": {
                                "x1": block_bbox[0],
                                "y1": block_bbox[1],
                                "x2": block_bbox[2],
                                "y2": block_bbox[3],
                                "page": page_num
                            },
                            "confidence": 0.85  # Lower confidence for fallback
                        })
                        
                        # Add to markdown with appropriate formatting
                        if element_type == "title":
                            page_content += f"# {block_text.strip()}\n\n"
                        elif element_type == "header":
                            page_content += f"## {block_text.strip()}\n\n"
                        else:
                            page_content += f"{block_text.strip()}\n\n"
                
                markdown_content += page_content
                
                # Extract tables using PyMuPDF's table detection
                try:
                    tables = page.find_tables()
                    for table_idx, table in enumerate(tables):
                        table_data = table.extract()
                        if table_data:
                            # Add table to elements
                            table_bbox = table.bbox
                            elements.append({
                                "id": f"page_{page_num}_table_{table_idx}",
                                "type": "table",
                                "content": self._format_table_markdown(table_data),
                                "bbox": {
                                    "x1": table_bbox[0],
                                    "y1": table_bbox[1],
                                    "x2": table_bbox[2],
                                    "y2": table_bbox[3],
                                    "page": page_num
                                },
                                "confidence": 0.80
                            })
                            
                            # Add table to markdown
                            markdown_content += f"\n{self._format_table_markdown(table_data)}\n\n"
                except:
                    pass  # Table extraction is optional
            
            doc.close()
            
            metadata = {
                "total_pages": len(doc),
                "total_elements": len(elements),
                "by_type": self._count_by_type(elements),
                "confidence_avg": sum(e["confidence"] for e in elements) / len(elements) if elements else 0.85,
                "features_detected": ["text", "structure", "tables"],
                "model_version": "pymupdf_fallback_v1.0"
            }
            
            return {
                "markdown": markdown_content,
                "elements": elements,
                "metadata": metadata,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Fallback extraction failed: {e}")
            return {
                "markdown": "",
                "elements": [],
                "metadata": {"total_pages": 0, "total_elements": 0, "by_type": {}, "confidence_avg": 0},
                "success": False,
                "error": str(e)
            }
    
    def _classify_block(self, text: str, bbox: List[float], all_blocks: List[Dict]) -> str:
        """Classify text block based on content and formatting"""
        text_lower = text.lower().strip()
        
        # Check if it's likely a title (short, at top, larger than average)
        if len(text_lower) < 100 and bbox[1] < 200:  # Near top of page
            return "title"
        
        # Check for common header patterns
        if (text_lower.startswith(('chapter', 'section', 'introduction', 'conclusion', 'abstract', 'summary')) or
            len(text_lower) < 50):
            return "header"
        
        # Default to text
        return "text"
    
    def _format_table_markdown(self, table_data: List[List[str]]) -> str:
        """Format table data as markdown"""
        if not table_data or not table_data[0]:
            return ""
        
        markdown = ""
        
        # Header row
        headers = table_data[0]
        markdown += "| " + " | ".join(headers) + " |\n"
        markdown += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        
        # Data rows
        for row in table_data[1:]:
            if len(row) == len(headers):
                markdown += "| " + " | ".join(row) + " |\n"
        
        return markdown


# Global instance
docling_pipeline = DoclingPipeline()


async def process_with_docling(file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """Process PDF with Docling pipeline"""
    return await docling_pipeline.extract(file_path, options)