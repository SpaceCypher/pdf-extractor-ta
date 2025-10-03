'use client';

import { useState, useCallback } from 'react';
import { 
  Upload, 
  File, 
  Trash2, 
  Play, 
  Pause, 
  RotateCw,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Download,
  Settings,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDropzone } from 'react-dropzone';

interface BatchFile {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'paused';
  progress: number;
  model?: string;
  results?: any;
  error?: string;
  processingTime?: number;
  elementsDetected?: number;
  startTime?: Date;
  endTime?: Date;
}

interface BatchSettings {
  defaultModel: string;
  priority: 'low' | 'normal' | 'high';
  concurrentJobs: number;
  retryFailures: boolean;
  exportOnComplete: boolean;
  exportFormat: string;
  notifyOnComplete: boolean;
}

export function BatchProcessing() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [batchSettings, setBatchSettings] = useState<BatchSettings>({
    defaultModel: 'pymupdf-advanced',
    priority: 'normal',
    concurrentJobs: 2,
    retryFailures: true,
    exportOnComplete: false,
    exportFormat: 'pdf',
    notifyOnComplete: true
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: BatchFile[] = acceptedFiles.map(file => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'pending',
      progress: 0,
      model: batchSettings.defaultModel
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [batchSettings.defaultModel]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      newSet.delete(fileId);
      return newSet;
    });
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const retryFailed = () => {
    setFiles(prev => prev.map(f => 
      f.status === 'error' ? { ...f, status: 'pending', progress: 0, error: undefined } : f
    ));
  };

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedFiles(new Set(files.map(f => f.id)));
  };

  const deselectAll = () => {
    setSelectedFiles(new Set());
  };

  const updateFileModel = (fileId: string, model: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, model } : f
    ));
  };

  const startBatchProcessing = async () => {
    setIsProcessing(true);
    setIsPaused(false);
    
    const pendingFiles = files.filter(f => f.status === 'pending');
    const concurrentLimit = batchSettings.concurrentJobs;
    
    // Process files in batches based on concurrency limit
    for (let i = 0; i < pendingFiles.length; i += concurrentLimit) {
      if (isPaused) break;
      
      const batch = pendingFiles.slice(i, i + concurrentLimit);
      
      // Process current batch
      await Promise.all(batch.map(file => processFile(file.id)));
    }
    
    setIsProcessing(false);
    
    // Handle post-processing actions
    if (batchSettings.exportOnComplete) {
      // Trigger export of all completed files
      console.log('Auto-exporting completed files...');
    }
    
    if (batchSettings.notifyOnComplete) {
      // Show notification
      console.log('Batch processing completed!');
    }
  };

  const processFile = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    // Update status to processing
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { 
        ...f, 
        status: 'processing', 
        startTime: new Date(),
        progress: 0 
      } : f
    ));

    try {
      // Simulate file processing with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        if (isPaused) {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'paused' } : f
          ));
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 300));
        
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
      }

      // Simulate completion
      const mockResults = {
        elementsDetected: Math.floor(Math.random() * 200) + 50,
        processingTime: Math.floor(Math.random() * 30) + 10,
        extractedText: 'Sample extracted content...',
        accuracy: Math.floor(Math.random() * 20) + 80
      };

      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'completed',
          progress: 100,
          endTime: new Date(),
          results: mockResults,
          elementsDetected: mockResults.elementsDetected,
          processingTime: mockResults.processingTime
        } : f
      ));

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { 
          ...f, 
          status: 'error',
          error: 'Processing failed. Please try again.',
          endTime: new Date()
        } : f
      ));

      if (batchSettings.retryFailures) {
        // Auto-retry after a delay
        setTimeout(() => {
          setFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'pending', progress: 0, error: undefined } : f
          ));
        }, 5000);
      }
    }
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    startBatchProcessing();
  };

  const getStatusIcon = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />;
      case 'processing':
        return <RotateCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: BatchFile['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-orange-100 text-orange-800';
    }
  };

  const stats = {
    total: files.length,
    pending: files.filter(f => f.status === 'pending').length,
    processing: files.filter(f => f.status === 'processing').length,
    completed: files.filter(f => f.status === 'completed').length,
    failed: files.filter(f => f.status === 'error').length,
    paused: files.filter(f => f.status === 'paused').length
  };

  const totalProgress = files.length > 0 
    ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length) 
    : 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batch Processing</h1>
          <p className="text-gray-600">Process multiple PDF documents simultaneously</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total Files</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <div className="text-sm text-gray-500">Processing</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-sm text-gray-500">Failed</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.paused}</div>
            <div className="text-sm text-gray-500">Paused</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* File Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Drag & drop PDF files here, or click to select files
                </p>
                <p className="text-sm text-gray-500">
                  Supports multiple PDF files up to 10MB each
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Batch Controls */}
      {files.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={deselectAll}
            >
              Deselect All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearCompleted}
              disabled={stats.completed === 0}
            >
              Clear Completed
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={retryFailed}
              disabled={stats.failed === 0}
            >
              Retry Failed
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {!isProcessing && !isPaused && (
              <Button
                onClick={startBatchProcessing}
                disabled={stats.pending === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Processing
              </Button>
            )}
            {isProcessing && (
              <Button
                variant="outline"
                onClick={pauseProcessing}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            {isPaused && (
              <Button
                onClick={resumeProcessing}
              >
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(file => (
                <div key={file.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedFiles.has(file.id)}
                        onCheckedChange={() => toggleFileSelection(file.id)}
                      />
                      <File className="h-5 w-5 text-gray-500" />
                      <div>
                        <div className="font-medium truncate max-w-xs">
                          {file.file.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={file.model}
                        onValueChange={(model) => updateFileModel(file.id, model)}
                        disabled={file.status === 'processing'}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="docling">Docling</SelectItem>
                          <SelectItem value="surya">Surya</SelectItem>
                          <SelectItem value="mineru">MinerU</SelectItem>
                        </SelectContent>
                      </Select>

                      <Badge className={getStatusColor(file.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(file.status)}
                          {file.status}
                        </div>
                      </Badge>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        disabled={file.status === 'processing'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {file.status === 'processing' && (
                    <div className="space-y-1 mb-3">
                      <Progress value={file.progress} className="h-2" />
                      <div className="text-sm text-gray-500">
                        {file.progress}% complete
                      </div>
                    </div>
                  )}

                  {file.error && (
                    <Alert className="mb-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{file.error}</AlertDescription>
                    </Alert>
                  )}

                  {file.status === 'completed' && file.results && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Processing Time:</span>
                        <div className="font-medium">{file.processingTime}s</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Elements:</span>
                        <div className="font-medium">{file.elementsDetected}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Accuracy:</span>
                        <div className="font-medium">{file.results.accuracy}%</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {files.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No files added yet</h3>
            <p className="text-gray-500 mb-4">
              Upload PDF files to start batch processing
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Files
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}