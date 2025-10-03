'use client';

import { useState } from 'react';
import { FileText, Eye, Download, Clock, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/header';
import Link from 'next/link';

interface ExampleDocument {
  id: string;
  title: string;
  description: string;
  type: string;
  pages: number;
  size: string;
  complexity: 'Simple' | 'Medium' | 'Complex';
  features: string[];
  recommendedModels: string[];
  preProcessed: boolean;
  demoResults: {
    model: string;
    processingTime: number;
    elementsDetected: number;
    accuracy: number;
  }[];
  downloadUrl?: string;
}

const examples: ExampleDocument[] = [
  {
    id: 'financial-report',
    title: '10-K Financial Report',
    description: 'Complex financial document with tables, charts, and structured data from SEC filings',
    type: 'Financial',
    pages: 24,
    size: '4.2 MB',
    complexity: 'Complex',
    features: ['Complex Tables', 'Financial Data', 'Multi-column Layout', 'Charts & Graphs'],
    recommendedModels: ['docling', 'surya'],
    preProcessed: true,
    demoResults: [
      { model: 'docling', processingTime: 45, elementsDetected: 234, accuracy: 94 },
      { model: 'surya', processingTime: 52, elementsDetected: 218, accuracy: 91 },
      { model: 'mineru', processingTime: 38, elementsDetected: 201, accuracy: 89 },
    ],
    downloadUrl: '/examples/10k-financial-report.pdf'
  },
  {
    id: 'scientific-paper',
    title: 'Machine Learning Research Paper',
    description: 'Academic paper with formulas, citations, figures, and technical references',
    type: 'Academic',
    pages: 12,
    size: '2.8 MB',
    complexity: 'Complex',
    features: ['LaTeX Formulas', 'Citations', 'Figures', 'References', 'Two-column Layout'],
    recommendedModels: ['PyMuPDF Advanced'],
    preProcessed: true,
    demoResults: [
      { model: 'PyMuPDF Advanced', processingTime: 28, elementsDetected: 189, accuracy: 92 },
      { model: 'PyMuPDF Basic', processingTime: 22, elementsDetected: 156, accuracy: 88 },
    ],
    downloadUrl: '/examples/ml-research-paper.pdf'
  },
  {
    id: 'newspaper-article',
    title: 'Newspaper Layout',
    description: 'Traditional newspaper with columns, images, captions, and mixed content',
    type: 'Media',
    pages: 2,
    size: '3.4 MB',
    complexity: 'Medium',
    features: ['Multi-column Text', 'Images with Captions', 'Headlines', 'Reading Order'],
    recommendedModels: ['PyMuPDF Advanced', 'PyMuPDF Basic'],
    preProcessed: true,
    demoResults: [
      { model: 'PyMuPDF Advanced', processingTime: 15, elementsDetected: 67, accuracy: 92 },
      { model: 'PyMuPDF Basic', processingTime: 12, elementsDetected: 58, accuracy: 88 },
    ],
    downloadUrl: '/examples/newspaper-layout.pdf'
  },
  {
    id: 'rent-roll',
    title: 'Real Estate Rent Roll',
    description: 'Structured tabular document with tenant data, lease terms, and calculations',
    type: 'Real Estate',
    pages: 5,
    size: '1.2 MB',
    complexity: 'Medium',
    features: ['Tabular Data', 'Structured Layout', 'Calculations', 'Headers'],
    recommendedModels: ['PyMuPDF Basic', 'PyMuPDF Advanced'],
    preProcessed: true,
    demoResults: [
      { model: 'PyMuPDF Basic', processingTime: 12, elementsDetected: 156, accuracy: 95 },
      { model: 'PyMuPDF Advanced', processingTime: 16, elementsDetected: 167, accuracy: 97 },
    ],
    downloadUrl: '/examples/rent-roll.pdf'
  },
  {
    id: 'multilingual-brochure',
    title: 'Multilingual Product Brochure',
    description: 'Marketing material with English, Spanish, and Chinese text with design elements',
    type: 'Marketing',
    pages: 6,
    size: '1.9 MB',
    complexity: 'Medium',
    features: ['Multiple Languages', 'Images', 'Design Elements', 'Mixed Layout'],
    recommendedModels: ['PyMuPDF Advanced', 'PyMuPDF Basic'],
    preProcessed: true,
    demoResults: [
      { model: 'PyMuPDF Advanced', processingTime: 22, elementsDetected: 95, accuracy: 91 },
      { model: 'PyMuPDF Basic', processingTime: 18, elementsDetected: 87, accuracy: 85 },
    ],
    downloadUrl: '/examples/multilingual-brochure.pdf'
  }
];

const getComplexityColor = (level: string) => {
  switch (level) {
    case 'Simple': return 'bg-green-100 text-green-800';
    case 'Medium': return 'bg-yellow-100 text-yellow-800';
    case 'Complex': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export function ExamplesPage() {
  const [selectedExample, setSelectedExample] = useState<ExampleDocument | null>(null);

  const handleViewExample = (example: ExampleDocument) => {
    setSelectedExample(example);
  };

  const handleTryExample = (exampleId: string) => {
    // Navigate to main extraction page with example pre-loaded
    window.location.href = `/?example=${exampleId}`;
  };

  const handleDownloadExample = (example: ExampleDocument) => {
    if (example.downloadUrl) {
      window.open(example.downloadUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Example Documents</h1>
            <p className="text-gray-600">
              Explore pre-processed examples to understand model capabilities and performance
            </p>
          </div>

          <Tabs defaultValue="gallery" className="space-y-6">
            <TabsList>
              <TabsTrigger value="gallery">Document Gallery</TabsTrigger>
              <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
              <TabsTrigger value="benchmarks">Performance Benchmarks</TabsTrigger>
            </TabsList>

            <TabsContent value="gallery">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examples.map((example) => (
                  <Card key={example.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <Badge className={getComplexityColor(example.complexity)}>
                          {example.complexity}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{example.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {example.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{example.pages} pages</span>
                        <span>{example.size}</span>
                        <Badge variant="secondary" className="text-xs">{example.type}</Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Key Features:</p>
                        <div className="flex flex-wrap gap-1">
                          {example.features.map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-700">Best Models:</p>
                        <div className="flex flex-wrap gap-1">
                          {example.recommendedModels.map((model) => (
                            <Badge key={model} className="text-xs bg-blue-100 text-blue-800">
                              {model}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {example.preProcessed && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Pre-processed results available</span>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-3">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewExample(example)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Results
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadExample(example)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance Comparison</CardTitle>
                  <CardDescription>
                    Compare how different models perform across various document types
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2">Document</th>
                          <th className="text-left py-3 px-2">Model</th>
                          <th className="text-left py-3 px-2">Processing Time</th>
                          <th className="text-left py-3 px-2">Elements Detected</th>
                          <th className="text-left py-3 px-2">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examples.flatMap(doc => 
                          doc.demoResults.map((result, idx) => (
                            <tr key={`${doc.id}-${idx}`} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-2 font-medium">{doc.title}</td>
                              <td className="py-3 px-2">{result.model}</td>
                              <td className="py-3 px-2">{result.processingTime}s</td>
                              <td className="py-3 px-2">{result.elementsDetected}</td>
                              <td className="py-3 px-2">
                                <div className="flex items-center gap-2">
                                  <Progress value={result.accuracy} className="w-20 h-2" />
                                  <span className="text-sm font-medium">{result.accuracy}%</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="benchmarks">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Average Processing Speed</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PyMuPDF Basic</span>
                      <div className="flex items-center gap-2">
                        <Progress value={85} className="w-16 h-2" />
                        <span className="text-sm font-medium">15s/page</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PyMuPDF Advanced</span>
                      <div className="flex items-center gap-2">
                        <Progress value={70} className="w-16 h-2" />
                        <span className="text-sm font-medium">22s/page</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Docling</span>
                      <div className="flex items-center gap-2">
                        <Progress value={65} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">(~25s/page)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Surya OCR</span>
                      <div className="flex items-center gap-2">
                        <Progress value={75} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">(~18s/page)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <CardTitle className="text-lg">Accuracy Rates</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PyMuPDF Basic</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-16 h-2" />
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">PyMuPDF Advanced</span>
                      <div className="flex items-center gap-2">
                        <Progress value={95} className="w-16 h-2" />
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Docling</span>
                      <div className="flex items-center gap-2">
                        <Progress value={94} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">(~94%)</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Surya OCR</span>
                      <div className="flex items-center gap-2">
                        <Progress value={91} className="w-16 h-2" />
                        <span className="text-sm text-muted-foreground">(~91%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                      <CardTitle className="text-lg">Feature Coverage</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Table Extraction</span>
                      <span className="text-sm font-medium">4/4 models</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Formula Recognition</span>
                      <span className="text-sm font-medium">2/4 models</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Multi-language</span>
                      <span className="text-sm font-medium">2/4 models</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Image Extraction</span>
                      <span className="text-sm font-medium">3/4 models</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Layout Analysis</span>
                      <span className="text-sm font-medium">4/4 models</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-12 text-center">
            <h2 className="text-xl font-semibold mb-4">Ready to try your own document?</h2>
            <Link href="/">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <FileText className="h-5 w-5 mr-2" />
                Start New Extraction
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Example Detail Modal */}
      {selectedExample && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">{selectedExample.title}</h2>
                <Button variant="outline" onClick={() => setSelectedExample(null)}>
                  Close
                </Button>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedExample.description}</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Performance Results</h3>
                  <div className="space-y-3">
                    {selectedExample.demoResults.map((result, idx) => (
                      <div key={idx} className="border rounded-lg p-4">
                        <div className="font-medium mb-2">{result.model}</div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Time:</span>
                            <div className="font-medium">{result.processingTime}s</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Elements:</span>
                            <div className="font-medium">{result.elementsDetected}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Accuracy:</span>
                            <div className="font-medium">{result.accuracy}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Document Features</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedExample.features.map((feature) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold mb-3">Recommended Models</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedExample.recommendedModels.map((model) => (
                      <Badge key={model} className="bg-blue-100 text-blue-800">
                        {model}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-3">
                    <Button onClick={() => handleTryExample(selectedExample.id)}>
                      Try This Example
                    </Button>
                    <Button variant="outline" onClick={() => handleDownloadExample(selectedExample)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}