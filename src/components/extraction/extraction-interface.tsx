'use client';

import { useEffect, useRef } from 'react';
import { Upload, Download, RefreshCw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUpload } from '@/components/upload/file-upload';
import { PDFViewer } from '@/components/pdf/pdf-viewer';
import { MarkdownDisplay } from '@/components/markdown/markdown-display';
import { ProcessingSettings } from '@/components/extraction/processing-settings';
import { ModelSelector } from '@/components/extraction/model-selector';
import { DocumentHistory } from '@/components/history/document-history';
import { DocumentTemplates } from '@/components/templates/document-templates';
import { LiveProgress } from '@/components/progress/live-progress';
import { Header } from '@/components/layout/header';
import { useExtractionStore, useSettingsStore } from '@/lib/store';
import { api, useUploadFile, useExtractContent } from '@/lib/api';
import { loadExampleResults } from '@/lib/example-data';
import { toast } from 'sonner';

export function ExtractionInterface() {
  const {
    uploadedFile,
    setUploadedFile,
    processing,
    setProcessing,
    results,
    addResult,
    setResults,
    selectedModels,
    showAnnotations,
    reset,
  } = useExtractionStore();
  
  const { defaultModel, extractionOptions } = useSettingsStore();
  
  const uploadMutation = useUploadFile();
  const extractMutation = useExtractContent();
  const initialized = useRef(false);

  // Initialize selected models with default (only once)
  useEffect(() => {
    if (!initialized.current && selectedModels.length === 0) {
      const validModels = ['docling', 'surya', 'mineru'];
      const validDefaultModel = validModels.includes(defaultModel) ? defaultModel : 'docling';
      useExtractionStore.getState().setSelectedModels([validDefaultModel]);
      initialized.current = true;
    }
  }, [selectedModels.length, defaultModel]); // Include dependencies but use ref to prevent loops

  // Handle example loading from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const exampleId = urlParams.get('example');
    
    if (exampleId) {
      handleLoadExample(exampleId);
      // Clear the URL parameter after loading
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('example');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, []);

  const handleLoadExample = (exampleId: string) => {
    const exampleResults = loadExampleResults(exampleId);
    
    if (!exampleResults) {
      toast.error('Example not found');
      return;
    }

    // Create a mock uploaded file for the example
    const exampleFile = new File(['mock-example-content'], `${exampleId}.pdf`, {
      type: 'application/pdf'
    });

    const mockUploadedFile = {
      file: exampleFile,
      uploadId: `example_${exampleId}`,
      filename: `${exampleId}.pdf`,
      size: 1024 * 1024, // 1MB mock size
      pages: Object.values(exampleResults)[0]?.metadata.total_pages || 1
    };

    // Set the uploaded file and results
    setUploadedFile(mockUploadedFile);
    setResults(exampleResults);
    setProcessing({
      status: 'completed',
      progress: 100,
      currentStep: 'Example loaded successfully!'
    });

    toast.success(`Loaded example: ${exampleId.replace('-', ' ')}`);
  };

  const handleFileUpload = async (file: File) => {
    setProcessing({ status: 'uploading', progress: 0, currentStep: 'Uploading file...' });
    
    try {
      const result = await uploadMutation.mutateAsync({
        file,
        onProgress: (progress: number) => {
          setProcessing(prev => ({
            ...prev,
            progress,
            currentStep: `Uploading file... ${progress}%`
          }));
        }
      });
      
      setUploadedFile({
        file,
        uploadId: result.upload_id,
        filename: result.filename,
        size: result.size,
        pages: result.pages,
      });
      
      setProcessing({ status: 'idle', progress: 100, currentStep: 'Upload completed' });
      toast.success(`File uploaded successfully! ${result.pages} pages detected.`);
      
    } catch (error) {
      console.error('Upload error:', error);
      setProcessing({ 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Upload failed',
        currentStep: 'Upload failed'
      });
      toast.error('Failed to upload file. Please try again.');
    }
  };

  const handleExtractAll = async () => {
    if (!uploadedFile) return;
    
    setProcessing({ 
      status: 'processing', 
      progress: 0, 
      currentStep: 'Initializing extraction process...',
      totalSteps: 5,
      currentStepIndex: 0
    });

    try {
      // Realistic progress tracking with steps
      const progressSteps = [
        { title: 'Analyzing document structure', duration: 8000, progress: 20 },
        { title: 'Extracting text content', duration: 12000, progress: 50 },
        { title: 'Processing tables and images', duration: 8000, progress: 75 },
        { title: 'Generating annotations', duration: 5000, progress: 90 },
        { title: 'Finalizing results', duration: 3000, progress: 100 }
      ];

      let totalProgress = 0;
      const startTime = Date.now();

      // Simulate realistic progress for each step
      for (let i = 0; i < progressSteps.length; i++) {
        const step = progressSteps[i];
        const stepStartTime = Date.now();
        
        setProcessing(prev => ({
          ...prev,
          currentStep: step.title,
          currentStepIndex: i,
          progress: i > 0 ? progressSteps[i - 1].progress : 0
        }));

        // Animate progress within the step
        const stepInterval = setInterval(() => {
          const stepElapsed = Date.now() - stepStartTime;
          const stepProgress = Math.min(stepElapsed / step.duration, 1);
          const overallProgress = (i > 0 ? progressSteps[i - 1].progress : 0) + 
                                  (stepProgress * (step.progress - (i > 0 ? progressSteps[i - 1].progress : 0)));
          
          const timeElapsed = (Date.now() - startTime) / 1000;
          const estimatedTotal = 36; // seconds
          const timeRemaining = Math.max(0, estimatedTotal - timeElapsed);
          
          setProcessing(prev => ({
            ...prev,
            progress: overallProgress,
            estimatedTimeRemaining: Math.round(timeRemaining)
          }));
          
          if (stepProgress >= 1) {
            clearInterval(stepInterval);
          }
        }, 200);

        // Wait for step to complete
        await new Promise(resolve => setTimeout(resolve, step.duration));
        clearInterval(stepInterval);
      }

      // Now make the actual API call
      const result = await extractMutation.mutateAsync({
        uploadId: uploadedFile.uploadId,
        models: selectedModels,
        options: extractionOptions,
      });
      
      // Add results for each model
      Object.entries(result.results).forEach(([model, modelResult]) => {
        addResult(model, modelResult);
      });

      setProcessing({ 
        status: 'completed', 
        progress: 100, 
        currentStep: 'Extraction completed successfully!',
        currentStepIndex: 5,
        estimatedTimeRemaining: 0
      });
      
      toast.success(`Successfully extracted content using ${selectedModels.length} model(s)!`);
      
    } catch (error) {
      console.error('Extraction error:', error);
      setProcessing({
        status: 'error',
        error: error instanceof Error ? error.message : 'Extraction failed',
        currentStep: 'Extraction failed - please try again',
        progress: 0
      });
      toast.error('Failed to extract content. Please try again.');
    }
  };

  const handleDownload = async (format: 'md' | 'html' | 'docx' | 'pdf') => {
    if (!uploadedFile || Object.keys(results).length === 0) return;
    
    try {
      const primaryModel = selectedModels[0];
      const blob = await api.downloadContent(uploadedFile.uploadId, primaryModel, format);
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${uploadedFile.filename.replace('.pdf', '')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleReset = () => {
    reset();
    toast.info('Session reset');
  };

  const hasResults = Object.keys(results).length > 0;
  const isProcessingOrUploading = processing.status === 'processing' || processing.status === 'uploading';

  return (
    <div className="flex flex-col h-screen">
      <Header />
      
      <div className="flex-1 flex overflow-hidden w-full">
        <div className="flex-1 flex flex-col">
          {!uploadedFile ? (
            // Upload State
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="w-full max-w-2xl space-y-6">
                <FileUpload onFileUpload={handleFileUpload} />
                
                {processing.status === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>{processing.currentStep}</span>
                      <span>{processing.progress}%</span>
                    </div>
                    <Progress value={processing.progress} />
                  </div>
                )}
                
                {processing.status === 'error' && (
                  <Alert variant="destructive">
                    <AlertDescription>{processing.error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ) : (
            // Dual Pane View
            <div className="flex-1 flex min-h-0 gap-2 p-2">
              {/* Left Pane - PDF Viewer */}
              <div className="flex-1 min-w-0">
                <div className="h-full flex flex-col border rounded-lg bg-white overflow-hidden">
                  <div className="border-b px-3 py-2 flex items-center justify-between flex-shrink-0 bg-gray-50">
                    <h2 className="text-sm font-medium truncate">
                      Document 1 / 1 ({uploadedFile.filename})
                    </h2>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownload('md')}
                        disabled={!hasResults}
                        className="h-7 px-2 text-xs"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleReset} className="h-7 px-2">
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <PDFViewer 
                      file={uploadedFile.file}
                      uploadId={uploadedFile.uploadId}
                      results={results}
                      showAnnotations={showAnnotations}
                    />
                  </div>
                </div>
              </div>

              {/* Right Pane - Content Display */}
              <div className="flex-1 min-w-0">
                <div className="h-full flex flex-col border rounded-lg bg-white overflow-hidden">
                  <div className="border-b px-2 py-1 flex-shrink-0 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0 flex-1">
                        <h3 className="text-xs font-medium truncate max-w-[200px]">
                          Doc 1/1 ({uploadedFile.filename.replace('.pdf', '').substring(0, 15)}...)
                        </h3>
                        {processing.status === 'completed' && (
                          <span className="text-xs text-green-600 font-medium">✓</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0 text-xs">
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <ProcessingSettings />
                        <DocumentHistory />
                        <DocumentTemplates />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-1">
                        <ModelSelector />
                      </div>
                      <Button 
                        onClick={handleExtractAll}
                        disabled={isProcessingOrUploading}
                        className="bg-green-600 hover:bg-green-700 h-6 px-2 text-xs"
                      >
                        {isProcessingOrUploading ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            ...
                          </>
                        ) : (
                          'Extract All'
                        )}
                      </Button>
                    </div>
                    
                    {/* Additional Action Buttons */}
                    <div className="flex items-center justify-center gap-2 mt-2 pt-2 border-t border-gray-200">
                      <Button 
                        onClick={handleExtractAll}
                        disabled={isProcessingOrUploading}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs px-3"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Extract
                      </Button>
                      <DocumentTemplates />
                    </div>
                    
                    {!hasResults && processing.status !== 'processing' && (
                      <p className="text-xs text-muted-foreground">
                        Upload files and click &quot;Extract All&quot; to view content
                      </p>
                    )}
                  </div>
                  
                  <div className="flex-1 min-h-0 overflow-hidden">
                    {processing.status === 'processing' ? (
                      <div className="h-full p-4 overflow-y-auto">
                        <LiveProgress
                          isActive={true}
                          currentStep={processing.currentStepIndex || 0}
                          totalSteps={processing.totalSteps || 5}
                          stepTitle={processing.currentStep}
                          progress={processing.progress}
                          estimatedTimeRemaining={processing.estimatedTimeRemaining || 0}
                          processingModel={selectedModels[0] || 'Docling'}
                          onCancel={() => {
                            setProcessing({ status: 'idle', progress: 0, currentStep: '' });
                            toast.info('Processing cancelled');
                          }}
                        />
                      </div>
                    ) : hasResults ? (
                      <MarkdownDisplay 
                        results={results}
                        uploadId={uploadedFile.uploadId}
                        onDownload={handleDownload}
                      />
                    ) : processing.status === 'error' ? (
                      <div className="p-3 h-full overflow-auto">
                        <Alert variant="destructive">
                          <AlertDescription className="text-sm">{processing.error}</AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
                            {(processing.status as string) === 'processing' 
                              ? 'Processing your document...' 
                              : 'No content extracted yet'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}