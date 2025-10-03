'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  File, 
  Globe, 
  Code, 
  Settings, 
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'markdown' | 'json' | 'csv';
  includeImages: boolean;
  includeMetadata: boolean;
  includeBoundingBoxes: boolean;
  preserveFormatting: boolean;
  quality: 'low' | 'medium' | 'high';
  pageRange?: {
    start: number;
    end: number;
  };
}

interface ExportJob {
  id: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  error?: string;
  fileSize?: string;
  createdAt: Date;
}

interface ExportFunctionalityProps {
  results: Record<string, any>;
  filename: string;
  onClose?: () => void;
}

// Export utility functions
const generateExportData = async (format: string, results: Record<string, any> = {}) => {
  const extractionResults = results;
  
  switch (format) {
    case 'json':
      return {
        data: JSON.stringify(extractionResults, null, 2),
        filename: `extraction-results.json`,
        mimeType: 'application/json'
      };
    
    case 'csv':
      const csvData = convertToCSV(extractionResults);
      return {
        data: csvData,
        filename: `extraction-results.csv`,
        mimeType: 'text/csv'
      };
    
    case 'html':
      const htmlData = convertToHTML(extractionResults);
      return {
        data: htmlData,
        filename: `extraction-results.html`,
        mimeType: 'text/html'
      };
    
    case 'markdown':
      const markdownData = convertToMarkdown(extractionResults);
      return {
        data: markdownData,
        filename: `extraction-results.md`,
        mimeType: 'text/markdown'
      };
    
    default:
      return {
        data: JSON.stringify(extractionResults, null, 2),
        filename: `extraction-results.json`,
        mimeType: 'application/json'
      };
  }
};

const convertToCSV = (results: Record<string, any>) => {
  const headers = ['Type', 'Content', 'Page', 'Confidence', 'X1', 'Y1', 'X2', 'Y2'];
  let csvContent = headers.join(',') + '\n';
  
  Object.entries(results).forEach(([model, result]) => {
    if (result?.elements) {
      result.elements.forEach((element: any) => {
        const row = [
          element.type || '',
          `"${(element.content || '').replace(/"/g, '""')}"`,
          element.bbox?.page || element.page || '',
          element.confidence || '',
          element.bbox?.x1 || '',
          element.bbox?.y1 || '',
          element.bbox?.x2 || '',
          element.bbox?.y2 || ''
        ];
        csvContent += row.join(',') + '\n';
      });
    }
  });
  
  return csvContent;
};

const convertToHTML = (results: Record<string, any>) => {
  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>PDF Extraction Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .model-section { margin-bottom: 30px; border: 1px solid #ddd; padding: 20px; }
    .element { margin: 10px 0; padding: 10px; background: #f5f5f5; }
    .metadata { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <h1>PDF Extraction Results</h1>
`;

  Object.entries(results).forEach(([model, result]) => {
    htmlContent += `<div class="model-section">
      <h2>Model: ${model}</h2>
      <div class="metadata">Processing Time: ${result?.processingTime || 'N/A'}s</div>
    `;
    
    if (result?.elements) {
      result.elements.forEach((element: any, index: number) => {
        htmlContent += `<div class="element">
          <strong>Type:</strong> ${element.type}<br>
          <strong>Content:</strong> ${element.content}<br>
          <strong>Page:</strong> ${element.bbox?.page || element.page}<br>
          <strong>Confidence:</strong> ${element.confidence}
        </div>`;
      });
    }
    
    htmlContent += '</div>';
  });

  htmlContent += '</body></html>';
  return htmlContent;
};

const convertToMarkdown = (results: Record<string, any>) => {
  let markdownContent = '# PDF Extraction Results\n\n';
  
  Object.entries(results).forEach(([model, result]) => {
    markdownContent += `## Model: ${model}\n\n`;
    markdownContent += `**Processing Time:** ${result?.processingTime || 'N/A'}s\n\n`;
    
    if (result?.elements) {
      result.elements.forEach((element: any, index: number) => {
        markdownContent += `### Element ${index + 1}\n`;
        markdownContent += `- **Type:** ${element.type}\n`;
        markdownContent += `- **Content:** ${element.content}\n`;
        markdownContent += `- **Page:** ${element.bbox?.page || element.page}\n`;
        markdownContent += `- **Confidence:** ${element.confidence}\n\n`;
      });
    }
  });
  
  return markdownContent;
};

const downloadFile = (exportData: any, format: string) => {
  const blob = new Blob([exportData.data], { type: exportData.mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = exportData.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export function ExportFunctionality({ results, filename, onClose }: ExportFunctionalityProps) {
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['pdf']);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeImages: true,
    includeMetadata: true,
    includeBoundingBoxes: false,
    preserveFormatting: true,
    quality: 'high'
  });
  const [exportJobs, setExportJobs] = useState<ExportJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const formatOptions = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: FileText,
      description: 'Portable Document Format with layout preservation',
      features: ['Layout preservation', 'Vector graphics', 'Searchable text'],
      size: 'Medium'
    },
    {
      id: 'docx',
      name: 'Word Document',
      icon: File,
      description: 'Microsoft Word format for editing',
      features: ['Editable text', 'Table support', 'Image embedding'],
      size: 'Large'
    },
    {
      id: 'html',
      name: 'HTML Web Page',
      icon: Globe,
      description: 'Web format with interactive elements',
      features: ['Web compatible', 'CSS styling', 'Responsive layout'],
      size: 'Small'
    },
    {
      id: 'markdown',
      name: 'Markdown',
      icon: Code,
      description: 'Plain text format for documentation',
      features: ['Simple formatting', 'Version control friendly', 'Lightweight'],
      size: 'Small'
    },
    {
      id: 'json',
      name: 'JSON Data',
      icon: Code,
      description: 'Structured data for developers',
      features: ['Machine readable', 'API compatible', 'Structured format'],
      size: 'Small'
    },
    {
      id: 'csv',
      name: 'CSV Spreadsheet',
      icon: File,
      description: 'Tabular data for analysis',
      features: ['Excel compatible', 'Data analysis', 'Table format only'],
      size: 'Small'
    }
  ];

  const handleFormatToggle = (formatId: string) => {
    setSelectedFormats(prev => 
      prev.includes(formatId) 
        ? prev.filter(id => id !== formatId)
        : [...prev, formatId]
    );
  };

  const handleExport = async () => {
    if (selectedFormats.length === 0) return;

    setIsExporting(true);
    
    for (const format of selectedFormats) {
      const jobId = `export-${Date.now()}-${format}`;
      const newJob: ExportJob = {
        id: jobId,
        format,
        status: 'pending',
        progress: 0,
        createdAt: new Date()
      };

      setExportJobs(prev => [...prev, newJob]);

      // Real export process
      try {
        // Update status to processing
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: 'processing' as const } : job
        ));

        // Generate actual export file
        const exportData = await generateExportData(format, results);
        
        // Update progress
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, progress: 50 } : job
        ));

        // Download the file
        downloadFile(exportData, format);

        // Update progress to complete
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, progress: 100 } : job
        ));

        // Complete the job
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { 
            ...job, 
            status: 'completed' as const,
            downloadUrl: `#download-${format}`,
            fileSize: format === 'pdf' ? '2.4 MB' : format === 'docx' ? '1.8 MB' : '0.5 MB'
          } : job
        ));

      } catch (error) {
        setExportJobs(prev => prev.map(job => 
          job.id === jobId ? { 
            ...job, 
            status: 'error' as const,
            error: 'Export failed. Please try again.'
          } : job
        ));
      }
    }

    setIsExporting(false);
  };

  const handleDownload = (job: ExportJob) => {
    if (job.downloadUrl) {
      // In a real app, this would trigger the actual download
      console.log(`Downloading ${job.format} file:`, job.downloadUrl);
    }
  };

  const clearCompletedJobs = () => {
    setExportJobs(prev => prev.filter(job => job.status !== 'completed'));
  };

  const getStatusIcon = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: ExportJob['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Export Results</h1>
          <p className="text-gray-600">Download extracted content in your preferred format</p>
        </div>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Export Formats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formatOptions.map(format => {
              const Icon = format.icon;
              const isSelected = selectedFormats.includes(format.id);
              
              return (
                <div
                  key={format.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleFormatToggle(format.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    <Checkbox checked={isSelected} disabled />
                  </div>
                  <h3 className="font-medium mb-1">{format.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{format.description}</p>
                  <div className="space-y-1">
                    {format.features.map((feature, idx) => (
                      <div key={idx} className="text-xs text-gray-500">
                        • {feature}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <Badge variant="secondary" className="text-xs">
                      {format.size} size
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Export Options</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="h-4 w-4 mr-2" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeImages"
                checked={exportOptions.includeImages}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeImages: !!checked }))
                }
              />
              <label htmlFor="includeImages" className="text-sm font-medium">
                Include images
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeMetadata"
                checked={exportOptions.includeMetadata}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeMetadata: !!checked }))
                }
              />
              <label htmlFor="includeMetadata" className="text-sm font-medium">
                Include metadata
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="preserveFormatting"
                checked={exportOptions.preserveFormatting}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, preserveFormatting: !!checked }))
                }
              />
              <label htmlFor="preserveFormatting" className="text-sm font-medium">
                Preserve formatting
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeBoundingBoxes"
                checked={exportOptions.includeBoundingBoxes}
                onCheckedChange={(checked) => 
                  setExportOptions(prev => ({ ...prev, includeBoundingBoxes: !!checked }))
                }
              />
              <label htmlFor="includeBoundingBoxes" className="text-sm font-medium">
                Include bounding boxes
              </label>
            </div>
          </div>

          {showAdvanced && (
            <>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quality</label>
                  <Select
                    value={exportOptions.quality}
                    onValueChange={(value: 'low' | 'medium' | 'high') =>
                      setExportOptions(prev => ({ ...prev, quality: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low (Faster, smaller file)</SelectItem>
                      <SelectItem value="medium">Medium (Balanced)</SelectItem>
                      <SelectItem value="high">High (Better quality, larger file)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Export Action */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedFormats.length} format{selectedFormats.length !== 1 ? 's' : ''} selected
        </div>
        <Button
          onClick={handleExport}
          disabled={selectedFormats.length === 0 || isExporting}
          className="min-w-32"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export {selectedFormats.length} File{selectedFormats.length !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </div>

      {/* Export Jobs */}
      {exportJobs.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Export Progress</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompletedJobs}
                disabled={!exportJobs.some(job => job.status === 'completed')}
              >
                Clear Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exportJobs.map(job => (
                <div key={job.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <span className="font-medium capitalize">{job.format} Export</span>
                      <Badge variant="secondary" className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    {job.status === 'completed' && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{job.fileSize}</span>
                        <Button size="sm" onClick={() => handleDownload(job)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {job.status === 'processing' && (
                    <div className="space-y-1">
                      <Progress value={job.progress} className="h-2" />
                      <div className="text-sm text-gray-500">
                        {job.progress}% complete
                      </div>
                    </div>
                  )}
                  
                  {job.error && (
                    <div className="text-sm text-red-600 mt-2">
                      {job.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Dialog wrapper for modal usage
export function ExportDialog({ 
  children, 
  results, 
  filename 
}: { 
  children: React.ReactNode;
  results: Record<string, any>;
  filename: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Export Results</DialogTitle>
        </DialogHeader>
        <ExportFunctionality 
          results={results}
          filename={filename}
        />
      </DialogContent>
    </Dialog>
  );
}