'use client';

import { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Code, 
  Globe, 
  Zap, 
  Settings,
  Download,
  Upload,
  Eye,
  BarChart3,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';

const quickStartSteps = [
  {
    step: 1,
    title: 'Upload Your PDF',
    description: 'Drag and drop or click to select a PDF file from your computer',
    icon: Upload,
    details: [
      'Supports PDF files up to 50MB',
      'Single or multi-page documents',
      'Various PDF formats supported'
    ]
  },
  {
    step: 2,
    title: 'Choose Model',
    description: 'Select the AI model that best fits your document type',
    icon: Settings,
    details: [
      'Docling: Best for business documents',
      'Surya: Excellent for multilingual content',
      'MinerU: Optimized for scientific papers'
    ]
  },
  {
    step: 3,
    title: 'Extract Content',
    description: 'Click Extract to process your document with AI',
    icon: Zap,
    details: [
      'Real-time progress tracking',
      'Visual annotations on PDF',
      'Structured markdown output'
    ]
  },
  {
    step: 4,
    title: 'Download Results',
    description: 'Export your extracted content in multiple formats',
    icon: Download,
    details: [
      'Markdown (.md)',
      'HTML (.html)', 
      'Word Document (.docx)',
      'PDF with annotations'
    ]
  }
];

const modelDetails = [
  {
    name: 'Docling',
    icon: FileText,
    description: 'IBM\'s advanced document AI model with superior accuracy for complex layouts',
    features: [
      'Advanced Layout Analysis',
      'Table Detection & Extraction',
      'Scientific Content Processing',
      'Multi-column Support',
      'Header & Footer Recognition'
    ],
    bestFor: [
      'Business Reports',
      'Financial Documents',
      'Legal Contracts',
      'Technical Manuals'
    ],
    speed: 'Medium (20-30s per page)',
    accuracy: '96-98%'
  },
  {
    name: 'Surya',
    icon: Globe,
    description: 'Multilingual OCR and layout detection with excellent performance across languages',
    features: [
      'Multilingual OCR (90+ languages)',
      'Layout Detection',
      'Text Recognition',
      'Reading Order Analysis',
      'RTL Text Support'
    ],
    bestFor: [
      'Multilingual Documents',
      'Scanned PDFs',
      'Mixed Language Content',
      'International Reports'
    ],
    speed: 'Fast (15-25s per page)',
    accuracy: '94-96%'
  },
  {
    name: 'MinerU',
    icon: Code,
    description: 'Specialized for scientific documents with formula and equation extraction',
    features: [
      'LaTeX Formula Extraction',
      'Scientific Notation',
      'Citation Parsing',
      'Reference Detection',
      'Mathematical Symbols'
    ],
    bestFor: [
      'Scientific Papers',
      'Research Documents',
      'Mathematical Content',
      'Academic Articles'
    ],
    speed: 'Slower (30-45s per page)',
    accuracy: '97-99% for scientific content'
  }
];

const apiEndpoints = [
  {
    method: 'POST',
    path: '/api/upload',
    description: 'Upload a PDF file for processing',
    params: ['file (multipart/form-data)'],
    response: 'upload_id, filename, size, pages'
  },
  {
    method: 'POST', 
    path: '/api/extract',
    description: 'Extract content using selected models',
    params: ['upload_id', 'models[]', 'options'],
    response: 'extraction results with markdown and metadata'
  },
  {
    method: 'GET',
    path: '/api/annotated-image/{upload_id}/{model}/{page}', 
    description: 'Get annotated PDF page image',
    params: ['upload_id', 'model', 'page_number'],
    response: 'base64 encoded image with bounding boxes'
  },
  {
    method: 'GET',
    path: '/api/download/{upload_id}/{model}/{format}',
    description: 'Download extracted content',
    params: ['upload_id', 'model', 'format (md|html|docx|pdf)'],
    response: 'downloadable file'
  }
];

export function DocsPage() {
  const [activeTab, setActiveTab] = useState('getting-started');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Documentation</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Complete guide to using the PDF Extraction Playground
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="api">API Reference</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Start Guide
                </CardTitle>
                <p className="text-muted-foreground">
                  Get started with PDF extraction in 4 simple steps
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  {quickStartSteps.map((step, index) => (
                    <div key={step.step} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <step.icon className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-muted-foreground mb-3">{step.description}</p>
                        <ul className="space-y-1">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                              <ChevronRight className="h-3 w-3" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Supported Formats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>PDF Files</span>
                    <Badge>✓ Supported</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Max File Size</span>
                    <Badge variant="outline">50MB</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Page Limit</span>
                    <Badge variant="outline">No limit</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Languages</span>
                    <Badge variant="outline">90+</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Formats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Markdown (.md)</span>
                    <Badge>✓ Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>HTML (.html)</span>
                    <Badge>✓ Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Word (.docx)</span>
                    <Badge>✓ Available</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>PDF (annotated)</span>
                    <Badge>✓ Available</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid gap-6">
              {modelDetails.map((model) => (
                <Card key={model.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <model.icon className="h-6 w-6 text-blue-600" />
                      {model.name}
                      <Badge variant="outline">{model.accuracy}</Badge>
                    </CardTitle>
                    <p className="text-muted-foreground">{model.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Key Features</h4>
                        <ul className="space-y-2">
                          {model.features.map((feature, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-blue-600" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Best For</h4>
                        <ul className="space-y-2">
                          {model.bestFor.map((use, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-green-600" />
                              {use}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Performance</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Speed:</span>
                            <span className="text-muted-foreground">{model.speed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Accuracy:</span>
                            <span className="text-muted-foreground">{model.accuracy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Reference
                </CardTitle>
                <p className="text-muted-foreground">
                  RESTful API for programmatic PDF extraction
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">
                      <strong>Base URL:</strong> https://your-modal-app.modal.run
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    {apiEndpoints.map((endpoint, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Parameters:</strong>
                            <ul className="mt-1 space-y-1">
                              {endpoint.params.map((param, pidx) => (
                                <li key={pidx} className="text-muted-foreground">• {param}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <strong>Response:</strong>
                            <p className="mt-1 text-muted-foreground">{endpoint.response}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Code Examples</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Upload PDF (JavaScript)</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`const formData = new FormData();
formData.append('file', pdfFile);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Upload ID:', result.upload_id);`}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Extract Content (JavaScript)</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`const response = await fetch('/api/extract', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    upload_id: 'your-upload-id',
    models: ['docling', 'surya'],
    options: {
      extract_tables: true,
      extract_images: true
    }
  })
});

const result = await response.json();`}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Business Report
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Financial quarterly report with tables and charts
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Recommended Model:</span>
                      <Badge>Docling</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Time:</span>
                      <span className="text-muted-foreground">~25s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Elements Detected:</span>
                      <span className="text-muted-foreground">Tables, Charts, Headers</span>
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      <Eye className="h-4 w-4 mr-2" />
                      View Example
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Research Paper
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Scientific paper with formulas and citations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Recommended Model:</span>
                      <Badge>MinerU</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Processing Time:</span>
                      <span className="text-muted-foreground">~35s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Elements Detected:</span>
                      <span className="text-muted-foreground">Formulas, Citations, Figures</span>
                    </div>
                    <Button size="sm" className="w-full mt-3">
                      <Eye className="h-4 w-4 mr-2" />
                      View Example
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Try These Examples</CardTitle>
                <p className="text-muted-foreground">
                  Download sample PDFs to test the extraction capabilities
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="font-medium">Invoice Sample</span>
                    <span className="text-xs text-muted-foreground">Business document</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Globe className="h-6 w-6" />
                    <span className="font-medium">Multilingual Brochure</span>
                    <span className="text-xs text-muted-foreground">Mixed languages</span>
                  </Button>
                  <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                    <Code className="h-6 w-6" />
                    <span className="font-medium">Academic Paper</span>
                    <span className="text-xs text-muted-foreground">Scientific content</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}