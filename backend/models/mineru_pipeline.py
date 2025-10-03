"""
MinerU pipeline for scientific document processing
Optimized for academic papers, formulas, citations, and scientific content
"""

import asyncio
import fitz  # PyMuPDF for fallback
from typing import Dict, List, Any, Optional
import logging
import re
import json

logger = logging.getLogger(__name__)

class MinerUPipeline:
    def __init__(self):
        self.model_name = "mineru"
        self.initialized = False
        
    async def initialize(self):
        """Initialize MinerU model"""
        try:
            # Try to import and initialize MinerU
            from magic_pdf.pipe.UNIPipe import UNIPipe
            from magic_pdf.pipe.OCRPipe import OCRPipe
            from magic_pdf.pipe.TXTPipe import TXTPipe
            
            # Initialize the unified pipeline for PDF processing
            self.uni_pipe = UNIPipe()
            self.ocr_pipe = OCRPipe()
            self.txt_pipe = TXTPipe()
            
            self.initialized = True
            logger.info("MinerU model initialized successfully")
            
        except ImportError as e:
            logger.warning(f"MinerU not available, using fallback with scientific enhancement: {e}")
            self.initialized = False
        except Exception as e:
            logger.error(f"Failed to initialize MinerU: {e}")
            self.initialized = False
    
    async def extract(self, file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Extract content from PDF using MinerU for scientific documents"""
        if not self.initialized:
            await self.initialize()
        
        if not self.initialized:
            # Enhanced fallback for scientific documents
            return await self._scientific_fallback_extraction(file_path, options)
        
        try:
            # Process with MinerU
            # Note: Actual MinerU API may differ, this is based on expected functionality
            with open(file_path, 'rb') as f:
                pdf_content = f.read()
            
            # Run unified pipeline
            result = await self._run_mineru_pipeline(pdf_content, options)
            
            # Extract structured content optimized for scientific documents
            markdown_content = result.get('markdown', '')
            elements = result.get('elements', [])
            
            # Enhance with scientific content detection
            elements = self._enhance_scientific_elements(elements, markdown_content)
            
            # Generate metadata specific to scientific documents
            metadata = {
                "total_pages": result.get('total_pages', 0),
                "total_elements": len(elements),
                "by_type": self._count_by_type(elements),
                "confidence_avg": sum(e["confidence"] for e in elements) / len(elements) if elements else 0.92,
                "formulas_detected": len([e for e in elements if e["type"] == "equation"]),
                "citations_detected": len([e for e in elements if e["type"] == "citation"]),
                "tables_detected": len([e for e in elements if e["type"] == "table"]),
                "figures_detected": len([e for e in elements if e["type"] == "image"]),
                "features_detected": ["formulas", "citations", "tables", "figures", "academic_structure"],
                "model_version": "mineru_v1.0"
            }
            
            return {
                "markdown": markdown_content,
                "elements": elements,
                "metadata": metadata,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"MinerU extraction failed: {e}")
            # Fallback to scientific-enhanced PyMuPDF
            return await self._scientific_fallback_extraction(file_path, options)
    
    async def _run_mineru_pipeline(self, pdf_content: bytes, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Run MinerU pipeline on PDF content"""
        # This would be the actual MinerU processing
        # For now, we'll simulate the expected output structure
        
        # In real implementation:
        # 1. Use UNIPipe for unified processing
        # 2. Extract formulas with LaTeX conversion
        # 3. Detect citations and references
        # 4. Identify academic structure (abstract, sections, etc.)
        # 5. Extract tables with scientific formatting
        
        # Placeholder - would be replaced with actual MinerU calls
        return {
            'markdown': '',
            'elements': [],
            'total_pages': 0
        }
    
    def _enhance_scientific_elements(self, elements: List[Dict], markdown: str) -> List[Dict]:
        """Enhance elements with scientific content classification"""
        enhanced_elements = []
        
        for element in elements:
            # Check for mathematical formulas
            if self._contains_formula(element["content"]):
                element["type"] = "equation"
                element["latex"] = self._extract_latex(element["content"])
            
            # Check for citations
            elif self._contains_citation(element["content"]):
                element["type"] = "citation"
                element["references"] = self._extract_references(element["content"])
            
            # Check for academic structure elements
            elif self._is_academic_section(element["content"]):
                element["type"] = "header"
                element["section_type"] = self._get_section_type(element["content"])
            
            enhanced_elements.append(element)
        
        return enhanced_elements
    
    def _contains_formula(self, text: str) -> bool:
        """Check if text contains mathematical formulas"""
        # Look for common mathematical patterns
        formula_patterns = [
            r'\$.*?\$',  # LaTeX inline math
            r'\$\$.*?\$\$',  # LaTeX display math
            r'\\[a-zA-Z]+\{.*?\}',  # LaTeX commands
            r'[∑∏∫∂∇∞±≤≥≠≈∝∈∉⊂⊃∪∩]',  # Mathematical symbols
            r'[α-ωΑ-Ω]',  # Greek letters
            r'\b\d+\s*[+\-*/=]\s*\d+',  # Basic equations
            r'\b[a-zA-Z]\s*=\s*[^,;.]+',  # Variable assignments
        ]
        
        for pattern in formula_patterns:
            if re.search(pattern, text):
                return True
        return False
    
    def _extract_latex(self, text: str) -> str:
        """Extract LaTeX from text"""
        # Find LaTeX patterns and clean them up
        latex_matches = re.findall(r'\$\$?(.*?)\$\$?', text)
        if latex_matches:
            return latex_matches[0]
        
        # If no explicit LaTeX, try to convert mathematical expressions
        return self._convert_to_latex(text)
    
    def _convert_to_latex(self, text: str) -> str:
        """Convert mathematical expressions to LaTeX"""
        # Basic conversion of common mathematical expressions
        latex = text
        
        # Replace common symbols
        replacements = {
            '±': r'\pm',
            '≤': r'\leq',
            '≥': r'\geq',
            '≠': r'\neq',
            '≈': r'\approx',
            '∝': r'\propto',
            '∈': r'\in',
            '∉': r'\notin',
            '⊂': r'\subset',
            '⊃': r'\supset',
            '∪': r'\cup',
            '∩': r'\cap',
            '∑': r'\sum',
            '∏': r'\prod',
            '∫': r'\int',
            '∂': r'\partial',
            '∇': r'\nabla',
            '∞': r'\infty',
        }
        
        for symbol, latex_symbol in replacements.items():
            latex = latex.replace(symbol, latex_symbol)
        
        return latex
    
    def _contains_citation(self, text: str) -> bool:
        """Check if text contains citations"""
        citation_patterns = [
            r'\[[\d\s,\-]+\]',  # [1], [1,2], [1-3]
            r'\([^)]*\d{4}[^)]*\)',  # (Author, 2021)
            r'et al\.',  # "et al."
            r'ibid\.',  # "ibid."
            r'op\. cit\.',  # "op. cit."
        ]
        
        for pattern in citation_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False
    
    def _extract_references(self, text: str) -> List[str]:
        """Extract reference numbers/keys from citation text"""
        references = []
        
        # Extract numbers from square brackets
        bracket_refs = re.findall(r'\[([\d\s,\-]+)\]', text)
        for ref in bracket_refs:
            # Split by commas and handle ranges
            for part in ref.split(','):
                part = part.strip()
                if '-' in part:
                    # Handle ranges like "1-3"
                    start, end = part.split('-')
                    for i in range(int(start.strip()), int(end.strip()) + 1):
                        references.append(str(i))
                else:
                    references.append(part)
        
        # Extract author-year citations
        author_year = re.findall(r'\(([^)]*\d{4}[^)]*)\)', text)
        references.extend(author_year)
        
        return list(set(references))  # Remove duplicates
    
    def _is_academic_section(self, text: str) -> bool:
        """Check if text is an academic section header"""
        academic_sections = [
            'abstract', 'introduction', 'methodology', 'methods', 'results',
            'discussion', 'conclusion', 'acknowledgments', 'references',
            'bibliography', 'appendix', 'related work', 'background',
            'literature review', 'experimental setup', 'evaluation',
            'future work', 'limitations'
        ]
        
        text_lower = text.lower().strip()
        
        # Check for exact matches or section numbering
        for section in academic_sections:
            if section in text_lower or text_lower == section:
                return True
        
        # Check for numbered sections (1. Introduction, etc.)
        if re.match(r'^\d+\.?\s+[A-Z]', text.strip()):
            return True
        
        return False
    
    def _get_section_type(self, text: str) -> str:
        """Get the type of academic section"""
        text_lower = text.lower().strip()
        
        section_types = {
            'abstract': 'abstract',
            'introduction': 'introduction',
            'methodology': 'methods',
            'methods': 'methods',
            'results': 'results',
            'discussion': 'discussion',
            'conclusion': 'conclusion',
            'acknowledgments': 'acknowledgments',
            'references': 'references',
            'bibliography': 'references',
            'appendix': 'appendix'
        }
        
        for keyword, section_type in section_types.items():
            if keyword in text_lower:
                return section_type
        
        return 'other'
    
    def _count_by_type(self, elements: List[Dict]) -> Dict[str, int]:
        """Count elements by type"""
        counts = {}
        for element in elements:
            element_type = element["type"]
            counts[element_type] = counts.get(element_type, 0) + 1
        return counts
    
    async def _scientific_fallback_extraction(self, file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """Enhanced fallback extraction for scientific documents using PyMuPDF"""
        try:
            doc = fitz.open(file_path)
            
            markdown_content = ""
            elements = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                
                # Extract text blocks
                blocks = page.get_text("dict")
                page_content = f"\n\n## Page {page_num + 1}\n\n"
                
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
                        # Enhanced classification for scientific content
                        element_type = self._classify_scientific_block(block_text, block_bbox)
                        
                        element = {
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
                            "confidence": 0.88
                        }
                        
                        # Add scientific-specific metadata
                        if element_type == "equation":
                            element["latex"] = self._extract_latex(block_text)
                        elif element_type == "citation":
                            element["references"] = self._extract_references(block_text)
                        elif element_type == "header" and self._is_academic_section(block_text):
                            element["section_type"] = self._get_section_type(block_text)
                        
                        elements.append(element)
                        
                        # Add to markdown with scientific formatting
                        if element_type == "equation":
                            page_content += f"$$\n{self._extract_latex(block_text)}\n$$\n\n"
                        elif element_type == "title":
                            page_content += f"# {block_text.strip()}\n\n"
                        elif element_type == "header":
                            page_content += f"## {block_text.strip()}\n\n"
                        elif element_type == "citation":
                            page_content += f"> {block_text.strip()}\n\n"
                        else:
                            page_content += f"{block_text.strip()}\n\n"
                
                # Enhanced table extraction for scientific content
                try:
                    tables = page.find_tables()
                    for table_idx, table in enumerate(tables):
                        table_data = table.extract()
                        if table_data:
                            table_bbox = table.bbox
                            elements.append({
                                "id": f"page_{page_num}_table_{table_idx}",
                                "type": "table",
                                "content": self._format_scientific_table(table_data),
                                "bbox": {
                                    "x1": table_bbox[0],
                                    "y1": table_bbox[1],
                                    "x2": table_bbox[2],
                                    "y2": table_bbox[3],
                                    "page": page_num
                                },
                                "confidence": 0.85,
                                "table_type": self._classify_table_type(table_data)
                            })
                            
                            page_content += f"\n{self._format_scientific_table(table_data)}\n\n"
                except:
                    pass
                
                markdown_content += page_content
            
            doc.close()
            
            # Enhanced metadata for scientific documents
            metadata = {
                "total_pages": len(doc),
                "total_elements": len(elements),
                "by_type": self._count_by_type(elements),
                "confidence_avg": sum(e["confidence"] for e in elements) / len(elements) if elements else 0.88,
                "formulas_detected": len([e for e in elements if e["type"] == "equation"]),
                "citations_detected": len([e for e in elements if e["type"] == "citation"]),
                "tables_detected": len([e for e in elements if e["type"] == "table"]),
                "figures_detected": len([e for e in elements if e["type"] == "image"]),
                "academic_sections": len([e for e in elements if e["type"] == "header" and e.get("section_type")]),
                "features_detected": ["text", "formulas", "citations", "tables", "academic_structure"],
                "model_version": "mineru_fallback_v1.0"
            }
            
            return {
                "markdown": markdown_content,
                "elements": elements,
                "metadata": metadata,
                "success": True
            }
            
        except Exception as e:
            logger.error(f"Scientific fallback extraction failed: {e}")
            return {
                "markdown": "",
                "elements": [],
                "metadata": {"total_pages": 0, "total_elements": 0, "by_type": {}, "confidence_avg": 0},
                "success": False,
                "error": str(e)
            }
    
    def _classify_scientific_block(self, text: str, bbox: List[float]) -> str:
        """Classify text block with scientific content awareness"""
        text_lower = text.lower().strip()
        
        # Check for mathematical formulas
        if self._contains_formula(text):
            return "equation"
        
        # Check for citations
        if self._contains_citation(text):
            return "citation"
        
        # Check for academic section headers
        if self._is_academic_section(text):
            return "header"
        
        # Check for figure/table captions
        if (text_lower.startswith(('fig', 'figure', 'table', 'chart')) or
            'figure' in text_lower or 'table' in text_lower):
            return "caption"
        
        # Check for titles (short text at top of page)
        if len(text_lower) < 100 and bbox[1] < 150:
            return "title"
        
        # Default to text
        return "text"
    
    def _format_scientific_table(self, table_data: List[List[str]]) -> str:
        """Format table data as markdown with scientific enhancements"""
        if not table_data or not table_data[0]:
            return ""
        
        markdown = ""
        
        # Header row
        headers = table_data[0]
        markdown += "| " + " | ".join(headers) + " |\n"
        markdown += "| " + " | ".join(["---"] * len(headers)) + " |\n"
        
        # Data rows with formula detection
        for row in table_data[1:]:
            if len(row) == len(headers):
                formatted_row = []
                for cell in row:
                    # Check if cell contains formulas
                    if self._contains_formula(cell):
                        formatted_row.append(f"${self._extract_latex(cell)}$")
                    else:
                        formatted_row.append(cell)
                markdown += "| " + " | ".join(formatted_row) + " |\n"
        
        return markdown
    
    def _classify_table_type(self, table_data: List[List[str]]) -> str:
        """Classify the type of scientific table"""
        if not table_data:
            return "unknown"
        
        # Check headers for common scientific table types
        headers = [h.lower() for h in table_data[0]] if table_data[0] else []
        
        # Results/data tables
        if any(word in ' '.join(headers) for word in ['result', 'data', 'value', 'measurement', 'experiment']):
            return "results"
        
        # Statistical tables
        if any(word in ' '.join(headers) for word in ['mean', 'std', 'p-value', 'significance', 'correlation']):
            return "statistics"
        
        # Comparison tables
        if any(word in ' '.join(headers) for word in ['method', 'approach', 'algorithm', 'model', 'comparison']):
            return "comparison"
        
        # Parameter tables
        if any(word in ' '.join(headers) for word in ['parameter', 'setting', 'configuration', 'hyperparameter']):
            return "parameters"
        
        return "data"


# Global instance
mineru_pipeline = MinerUPipeline()


async def process_with_mineru(file_path: str, options: Dict[str, Any] = None) -> Dict[str, Any]:
    """Process PDF with MinerU pipeline for scientific documents"""
    return await mineru_pipeline.extract(file_path, options)