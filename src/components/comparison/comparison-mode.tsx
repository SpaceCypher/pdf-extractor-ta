'use client';

import { useState } from 'react';
import { 
  ArrowLeftRight, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Download,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PDFViewer } from '@/components/pdf/pdf-viewer';

interface ModelResult {
  model: string;
  processingTime: number;
  elementsDetected: number;
  accuracy: number;
  extractedText: string;
  confidence: number;
  errors: string[];
  metadata: {
    pages: number;
    fileSize: string;
    totalElements: number;
    byType: Record<string, number>;
  };
  elements: Array<{
    id: string;
    type: string;
    content: string;
    confidence: number;
    bbox: {
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      page: number;
    };
  }>;
}

interface ComparisonModeProps {
  file: File;
  results: Record<string, ModelResult>;
  onBack: () => void;
}

export function ComparisonMode({ file, results, onBack }: ComparisonModeProps) {
  const [selectedModels, setSelectedModels] = useState<[string, string]>([
    Object.keys(results)[0] || '',
    Object.keys(results)[1] || ''
  ]);
  const [activeTab, setActiveTab] = useState('side-by-side');
  const [showDifferences, setShowDifferences] = useState(true);

  const modelNames = Object.keys(results);
  const [leftModel, rightModel] = selectedModels;
  const leftResult = results[leftModel];
  const rightResult = results[rightModel];

  const handleModelChange = (position: 'left' | 'right', model: string) => {
    if (position === 'left') {
      setSelectedModels([model, selectedModels[1]]);
    } else {
      setSelectedModels([selectedModels[0], model]);
    }
  };

  const calculateDifference = (metric: keyof Pick<ModelResult, 'processingTime' | 'elementsDetected' | 'accuracy'>) => {
    if (!leftResult || !rightResult) return 0;
    const leftVal = leftResult[metric];
    const rightVal = rightResult[metric];
    return ((rightVal - leftVal) / leftVal * 100);
  };

  const getPerformanceColor = (value: number, isTime = false) => {
    if (isTime) {
      return value < 0 ? 'text-green-600' : 'text-red-600'; // Lower time is better
    }
    return value > 0 ? 'text-green-600' : 'text-red-600'; // Higher accuracy/elements is better
  };

  const formatDifference = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={onBack}>
              ← Back
            </Button>
            <h1 className="text-xl font-semibold">Model Comparison</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Compare:</span>
            <Select value={leftModel} onValueChange={(model) => handleModelChange('left', model)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelNames.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ArrowLeftRight className="h-4 w-4 text-gray-400" />

          <div className="flex items-center gap-2">
            <Select value={rightModel} onValueChange={(model) => handleModelChange('right', model)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modelNames.map(model => (
                  <SelectItem key={model} value={model}>{model}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="ml-auto">
            <Button
              variant={showDifferences ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowDifferences(!showDifferences)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showDifferences ? 'Hide' : 'Show'} Differences
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <div className="border-b bg-white px-6">
            <TabsList>
              <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
              <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
              <TabsTrigger value="content">Content Analysis</TabsTrigger>
              <TabsTrigger value="elements">Element Comparison</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="side-by-side" className="flex-1 p-0 m-0">
            <div className="h-full flex">
              {/* Left Panel */}
              <div className="flex-1 border-r">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{leftModel}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {leftResult?.processingTime}s
                    </div>
                  </div>
                </div>
                <div className="h-full">
                  {leftResult && (
                    <PDFViewer 
                      file={file} 
                      results={{
                        elements: leftResult.elements.map(el => ({
                          ...el,
                          type: el.type as 'text' | 'header' | 'footer' | 'title' | 'table' | 'image' | 'list' | 'equation',
                          page: el.bbox.page
                        })),
                        summary: {
                          total_elements: leftResult.metadata.totalElements,
                          by_type: leftResult.metadata.byType
                        }
                      }} 
                      showAnnotations={true}
                    />
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div className="flex-1">
                <div className="bg-green-50 px-4 py-2 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{rightModel}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      {rightResult?.processingTime}s
                      {showDifferences && leftResult && (
                        <span className={getPerformanceColor(calculateDifference('processingTime'), true)}>
                          ({formatDifference(calculateDifference('processingTime'))})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="h-full">
                  {rightResult && (
                    <PDFViewer 
                      file={file} 
                      results={{
                        elements: rightResult.elements.map(el => ({
                          ...el,
                          type: el.type as 'text' | 'header' | 'footer' | 'title' | 'table' | 'image' | 'list' | 'equation',
                          page: el.bbox.page
                        })),
                        summary: {
                          total_elements: rightResult.metadata.totalElements,
                          by_type: rightResult.metadata.byType
                        }
                      }} 
                      showAnnotations={true}
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="metrics" className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Processing Time */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Processing Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{leftModel}</span>
                      <span className="font-medium">{leftResult?.processingTime}s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{rightModel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rightResult?.processingTime}s</span>
                        {showDifferences && (
                          <span className={`text-sm ${getPerformanceColor(calculateDifference('processingTime'), true)}`}>
                            {formatDifference(calculateDifference('processingTime'))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Elements Detected */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Elements Detected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{leftModel}</span>
                      <span className="font-medium">{leftResult?.elementsDetected}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{rightModel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rightResult?.elementsDetected}</span>
                        {showDifferences && (
                          <span className={`text-sm ${getPerformanceColor(calculateDifference('elementsDetected'))}`}>
                            {formatDifference(calculateDifference('elementsDetected'))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accuracy */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Accuracy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{leftModel}</span>
                      <span className="font-medium">{leftResult?.accuracy}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{rightModel}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{rightResult?.accuracy}%</span>
                        {showDifferences && (
                          <span className={`text-sm ${getPerformanceColor(calculateDifference('accuracy'))}`}>
                            {formatDifference(calculateDifference('accuracy'))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Confidence */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{leftModel}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={leftResult?.confidence || 0} className="w-16 h-2" />
                        <span className="font-medium">{leftResult?.confidence}%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{rightModel}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={rightResult?.confidence || 0} className="w-16 h-2" />
                        <span className="font-medium">{rightResult?.confidence}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Element Type Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Element Type Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Element Type</th>
                        <th className="text-left py-2">{leftModel}</th>
                        <th className="text-left py-2">{rightModel}</th>
                        {showDifferences && <th className="text-left py-2">Difference</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(leftResult?.metadata?.byType || {}).map(type => {
                        const leftCount = leftResult?.metadata?.byType[type] || 0;
                        const rightCount = rightResult?.metadata?.byType[type] || 0;
                        const diff = rightCount - leftCount;
                        
                        return (
                          <tr key={type} className="border-b">
                            <td className="py-2 capitalize">{type}</td>
                            <td className="py-2">{leftCount}</td>
                            <td className="py-2">{rightCount}</td>
                            {showDifferences && (
                              <td className={`py-2 ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                {diff > 0 ? '+' : ''}{diff}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {leftModel}
                    <Badge variant="secondary">
                      {leftResult?.extractedText?.length || 0} chars
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {leftResult?.extractedText || 'No content extracted'}
                  </pre>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {rightModel}
                    <Badge variant="secondary">
                      {rightResult?.extractedText?.length || 0} chars
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap">
                    {rightResult?.extractedText || 'No content extracted'}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="elements" className="flex-1 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{leftModel} Elements</CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-auto">
                  <div className="space-y-2">
                    {leftResult?.elements?.map((element, idx) => (
                      <div key={idx} className="border rounded p-2 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{element.type}</Badge>
                          <span className="text-xs text-gray-500">
                            {Math.round(element.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 truncate">
                          {element.content}
                        </p>
                      </div>
                    )) || <p className="text-gray-500">No elements detected</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader>
                  <CardTitle>{rightModel} Elements</CardTitle>
                </CardHeader>
                <CardContent className="h-full overflow-auto">
                  <div className="space-y-2">
                    {rightResult?.elements?.map((element, idx) => (
                      <div key={idx} className="border rounded p-2 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{element.type}</Badge>
                          <span className="text-xs text-gray-500">
                            {Math.round(element.confidence * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 truncate">
                          {element.content}
                        </p>
                      </div>
                    )) || <p className="text-gray-500">No elements detected</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}