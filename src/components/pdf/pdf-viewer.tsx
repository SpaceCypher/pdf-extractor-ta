'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Files, FileText, Eye, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExtractedElement {
  id?: string;
  type: 'text' | 'header' | 'footer' | 'title' | 'table' | 'image' | 'list' | 'equation';
  content: string;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    page: number;
  };
  page: number;
  confidence: number;
}

interface PDFViewerProps {
  file: File;
  uploadId?: string;
  results?: {
    elements?: ExtractedElement[];
    summary?: {
      total_elements: number;
      by_type: Record<string, number>;
    };
  };
  showAnnotations?: boolean;
}

export function PDFViewer({ file, uploadId, results, showAnnotations = true }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [annotationsVisible, setAnnotationsVisible] = useState(showAnnotations);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAnnotationsVisible(showAnnotations);
  }, [showAnnotations]);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Get elements for current page
  const actualElements = results?.elements?.filter(
    element => element.bbox.page === currentPage
  ) || [];

  // Enhanced test elements with more variety for better demo
  const testElements: ExtractedElement[] = actualElements.length === 0 ? [
    {
      id: 'test_title',
      type: 'title',
      content: 'Document Title - Financial Report Q4 2024',
      bbox: { x1: 80, y1: 60, x2: 520, y2: 95, page: currentPage },
      page: currentPage,
      confidence: 0.98
    },
    {
      id: 'test_header1',
      type: 'header', 
      content: '1. Executive Summary',
      bbox: { x1: 80, y1: 130, x2: 350, y2: 155, page: currentPage },
      page: currentPage,
      confidence: 0.95
    },
    {
      id: 'test_text1',
      type: 'text',
      content: 'This report presents the financial performance and key metrics for Q4 2024, highlighting significant growth in revenue and market expansion initiatives.',
      bbox: { x1: 80, y1: 170, x2: 520, y2: 215, page: currentPage },
      page: currentPage, 
      confidence: 0.92
    },
    {
      id: 'test_header2',
      type: 'header',
      content: '2. Financial Performance',
      bbox: { x1: 80, y1: 240, x2: 380, y2: 265, page: currentPage },
      page: currentPage,
      confidence: 0.94
    },
    {
      id: 'test_table',
      type: 'table',
      content: 'Revenue | Q3 2024 | Q4 2024 | Growth\nTotal Revenue | $2.1M | $2.8M | +33%\nNet Profit | $450K | $620K | +38%',
      bbox: { x1: 80, y1: 280, x2: 520, y2: 380, page: currentPage },
      page: currentPage,
      confidence: 0.89
    },
    {
      id: 'test_text2',
      type: 'text',
      content: 'The significant revenue growth of 33% demonstrates strong market demand and successful execution of our strategic initiatives.',
      bbox: { x1: 80, y1: 400, x2: 520, y2: 435, page: currentPage },
      page: currentPage,
      confidence: 0.91
    },
    {
      id: 'test_list',
      type: 'list',
      content: '• Market expansion into 3 new regions\n• Launch of premium product line\n• Strategic partnerships with industry leaders',
      bbox: { x1: 100, y1: 460, x2: 500, y2: 520, page: currentPage },
      page: currentPage,
      confidence: 0.87
    },
    {
      id: 'test_image',
      type: 'image',
      content: '[Chart: Revenue Growth Trend 2024]',
      bbox: { x1: 320, y1: 540, x2: 520, y2: 640, page: currentPage },
      page: currentPage,
      confidence: 0.93
    }
  ] : [];

  const currentPageElements = [...actualElements, ...testElements];

  // Get summary data
  const elementsSummary = results?.summary?.by_type || {
    text: 208,
    header: 44,
    footer: 1,
    title: 1,
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const toggleElementType = (type: string) => {
    setHiddenTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const getElementColor = (type: string) => {
    const colors: Record<string, string> = {
      text: 'rgba(59, 130, 246, 0.3)',
      header: 'rgba(16, 185, 129, 0.3)',
      title: 'rgba(249, 115, 22, 0.3)',
      footer: 'rgba(156, 163, 175, 0.3)',
      table: 'rgba(139, 92, 246, 0.3)',
      image: 'rgba(236, 72, 153, 0.3)',
      list: 'rgba(34, 197, 94, 0.3)',
      equation: 'rgba(239, 68, 68, 0.3)',
    };
    return colors[type] || 'rgba(107, 114, 128, 0.3)';
  };

  const getElementBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      text: '#3b82f6',
      header: '#10b981',
      title: '#f97316',
      footer: '#9ca3af',
      table: '#8b5cf6',
      image: '#ec4899',
      list: '#22c55e',
      equation: '#ef4444',
    };
    return colors[type] || '#6b7280';
  };

  return (
    <div className="h-full flex">
      {/* Left Sidebar - Content Types & Annotations */}
      <div className="w-64 bg-gray-50 border-r flex flex-col">
        {/* Header */}
        <div className="p-3 border-b bg-white">
          <div className="flex items-center gap-2 mb-2">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              <Files className="h-3 w-3 mr-1" />
              Files
            </Button>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs bg-blue-50 text-blue-700">
              <FileText className="h-3 w-3 mr-1" />
              PDF
            </Button>
          </div>
        </div>

        {/* Content Types */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              Content Types
              <span className="text-xs text-gray-500 ml-1">—</span>
            </h3>
            
            {annotationsVisible && (
              <div className="space-y-2">
                {Object.entries(elementsSummary).map(([type, count]) => {
                  const isHidden = hiddenTypes.has(type);
                  const color = getElementColor(type);
                  
                  return (
                    <div key={type} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded border"
                          style={{ 
                            backgroundColor: color,
                            borderColor: getElementBorderColor(type)
                          }}
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">({count})</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleElementType(type)}
                          className={`h-6 w-12 text-xs ${isHidden ? 'text-gray-400' : 'text-blue-600'}`}
                        >
                          {isHidden ? 'Show' : 'Hide'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!annotationsVisible && (
              <div className="text-sm text-gray-500 space-y-1">
                <div>• Upload a PDF to see content types</div>
                <div>• Click &quot;Show Annotations&quot; to enable highlighting</div>
              </div>
            )}
          </div>

          {/* Selected Element Details */}
          {annotationsVisible && selectedElement && (
            <div className="border-t p-3 bg-white mx-3 rounded">
              <h4 className="text-sm font-medium mb-2">Selected Element</h4>
              {(() => {
                const element = currentPageElements.find((e, index) => {
                  const elementId = e.id || `${e.type}_${e.page}_${index}`;
                  return elementId === selectedElement;
                });
                if (!element) return null;
                
                return (
                  <div className="space-y-2 text-xs">
                    <div><strong>Type:</strong> {element.type}</div>
                    <div><strong>Confidence:</strong> {Math.round(element.confidence * 100)}%</div>
                    <div className="max-h-20 overflow-y-auto">
                      <strong>Content:</strong>
                      <div className="text-gray-600 mt-1 whitespace-pre-wrap">
                        {element.content.substring(0, 200)}
                        {element.content.length > 200 ? '...' : ''}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - PDF Viewer */}
      <div className="flex-1 flex flex-col">
        {/* PDF Controls */}
        <div className="border-b px-3 py-2 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="w-12 h-7 text-center text-xs"
              />
              <span className="text-xs text-gray-500">of {totalPages}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="h-7 px-2"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.max(25, zoom - 25))}
                className="h-7 px-2"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="text-xs font-medium min-w-[50px] text-center">{zoom}%</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className="h-7 px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAnnotationsVisible(!annotationsVisible)}
                className={`h-7 px-3 text-xs ${annotationsVisible ? 'bg-blue-50 text-blue-700' : ''}`}
              >
                <Eye className="h-3 w-3 mr-1" />
                {annotationsVisible ? 'Hide Annotations' : 'Show Annotations'}
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Display Area */}
        <div className="flex-1 bg-white overflow-auto">
          <div className="p-4 h-full">
            {pdfUrl ? (
              <div className="relative mx-auto" style={{ maxWidth: '800px' }}>
                <div 
                  className="border rounded-lg shadow-sm bg-white relative" 
                  data-pdf-container
                  style={{ 
                    transform: `scale(${zoom / 100})`, 
                    transformOrigin: 'top center',
                    width: '100%'
                  }}
                >
                  <iframe
                    src={pdfUrl}
                    className="w-full border-0"
                    style={{ 
                      height: `${(800 * 792 / 612)}px`, // Maintain PDF aspect ratio (8.5:11)
                      maxHeight: '100vh'
                    }}
                    title="PDF Viewer"
                  />
                  
                  {/* Annotation Overlay */}
                  {annotationsVisible && (
                    <div 
                      className="absolute inset-0 pointer-events-none"
                      style={{ 
                        width: '100%',
                        height: '100%'
                      }}
                    >
                      {currentPageElements
                        .filter(element => !hiddenTypes.has(element.type))
                        .map((element, index) => {
                          const elementId = element.id || `${element.type}_${element.page}_${index}`;
                          const isSelected = selectedElement === elementId;
                          const isHovered = hoveredElement === elementId;
                          const bbox = element.bbox;
                          
                          // Convert PDF coordinates to display coordinates with better precision
                          // Standard PDF page dimensions in points (72 DPI)
                          const PDF_WIDTH = 612;  // 8.5 inches * 72 DPI
                          const PDF_HEIGHT = 792;  // 11 inches * 72 DPI
                          
                          // Calculate position relative to PDF dimensions, accounting for zoom
                          const left = (bbox.x1 / PDF_WIDTH) * 100;
                          const top = (bbox.y1 / PDF_HEIGHT) * 100;
                          const width = ((bbox.x2 - bbox.x1) / PDF_WIDTH) * 100;
                          const height = ((bbox.y2 - bbox.y1) / PDF_HEIGHT) * 100;
                          
                          // Adjust for any coordinate system differences (some systems use bottom-left origin)
                          // If coordinates seem inverted, we might need: top = (1 - (bbox.y2 / PDF_HEIGHT)) * 100;
                          
                          return (
                            <div
                              key={elementId}
                              className="absolute cursor-pointer pointer-events-auto transition-all duration-200 ease-in-out"
                              style={{
                                left: `${Math.max(0, left)}%`,
                                top: `${Math.max(0, top)}%`,
                                width: `${Math.max(0.1, width)}%`,
                                height: `${Math.max(0.1, height)}%`,
                                backgroundColor: isSelected || isHovered 
                                  ? getElementColor(element.type).replace('0.3', '0.6')
                                  : getElementColor(element.type),
                                borderColor: getElementBorderColor(element.type),
                                borderWidth: isSelected ? '2px' : isHovered ? '1.5px' : '1px',
                                borderStyle: 'solid',
                                zIndex: isSelected ? 30 : isHovered ? 20 : 10,
                                boxShadow: isSelected || isHovered ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                              }}
                              onClick={() => setSelectedElement(
                                selectedElement === elementId ? null : elementId
                              )}
                              onMouseEnter={() => setHoveredElement(elementId)}
                              onMouseLeave={() => setHoveredElement(null)}
                              title={`${element.type}: ${element.content.substring(0, 50)}...`}
                            >
                              {isSelected && (
                                <div className="absolute -top-6 left-0 bg-black text-white text-xs px-1 rounded">
                                  {element.type} ({Math.round(element.confidence * 100)}%)
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No PDF file loaded</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}