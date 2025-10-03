import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UploadedFile {
  file: File;
  uploadId: string;
  filename: string;
  size: number;
  pages: number;
}

export interface ExtractionResult {
  markdown: string;
  elements: Array<{
    id?: string;
    type: string;
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
  }>;
  metadata: {
    total_pages: number;
    total_elements: number;
    confidence_avg: number;
  };
  processing_time: number;
  model: string;
}

export interface ProcessingState {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  error?: string;
  totalSteps?: number;
  currentStepIndex?: number;
  estimatedTimeRemaining?: number;
}

interface ExtractionStore {
  // File state
  uploadedFile: UploadedFile | null;
  setUploadedFile: (file: UploadedFile | null) => void;

  // Processing state
  processing: ProcessingState;
  setProcessing: (state: Partial<ProcessingState> | ((prev: ProcessingState) => Partial<ProcessingState>)) => void;

  // Results
  results: Record<string, ExtractionResult>;
  setResults: (results: Record<string, ExtractionResult>) => void;
  addResult: (model: string, result: ExtractionResult | any) => void; // Accept both API and frontend format

  // UI state
  currentPage: number;
  setCurrentPage: (page: number) => void;
  
  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  
  selectedModels: string[];
  setSelectedModels: (models: string[]) => void;
  
  activeTab: 'markdown' | 'schema' | 'comparison';
  setActiveTab: (tab: 'markdown' | 'schema' | 'comparison') => void;
  
  showAnnotations: boolean;
  setShowAnnotations: (show: boolean) => void;
  
  annotationFilters: string[];
  setAnnotationFilters: (filters: string[]) => void;

  // Actions
  reset: () => void;
  clearResults: () => void;
}

export const useExtractionStore = create<ExtractionStore>()(
  persist(
    (set) => ({
      // Initial state
      uploadedFile: null,
      processing: {
        status: 'idle',
        progress: 0,
        currentStep: '',
      },
      results: {},
      currentPage: 1,
      zoomLevel: 100,
      selectedModels: ['docling'],
      activeTab: 'markdown',
      showAnnotations: true,
      annotationFilters: ['title', 'header', 'text', 'table', 'figure'],

      // File actions
      setUploadedFile: (file) => set({ uploadedFile: file }),

      // Processing actions
      setProcessing: (state) =>
        set((prev) => ({
          processing: { 
            ...prev.processing, 
            ...(typeof state === 'function' ? state(prev.processing) : state)
          }
        })),

      // Results actions
      setResults: (results) => set({ results }),
      addResult: (model, result) => {
        // Convert backend bbox format [x1, y1, x2, y2] to frontend format {x1, y1, x2, y2, page}
        const convertedResult: ExtractionResult = {
          ...result,
          elements: result.elements.map((element: any) => ({
            ...element,
            bbox: Array.isArray(element.bbox) 
              ? {
                  x1: element.bbox[0],
                  y1: element.bbox[1],
                  x2: element.bbox[2], 
                  y2: element.bbox[3],
                  page: element.page
                }
              : element.bbox // Already in correct format
          }))
        };
        
        set((prev) => ({
          results: { ...prev.results, [model]: convertedResult }
        }));
      },

      // UI actions
      setCurrentPage: (page) => set({ currentPage: page }),
      setZoomLevel: (zoom) => set({ zoomLevel: Math.max(50, Math.min(200, zoom)) }),
      setSelectedModels: (models) => {
        // Validate models - only allow known available models
        const validModels = ['docling', 'surya', 'mineru'];
        const filteredModels = models.filter(model => validModels.includes(model));
        // Ensure at least one model is selected
        const finalModels = filteredModels.length > 0 ? filteredModels : ['docling'];
        set({ selectedModels: finalModels });
      },
      setActiveTab: (tab) => set({ activeTab: tab }),
      setShowAnnotations: (show) => set({ showAnnotations: show }),
      setAnnotationFilters: (filters) => set({ annotationFilters: filters }),

      // Reset actions
      reset: () => set({
        uploadedFile: null,
        processing: { status: 'idle', progress: 0, currentStep: '' },
        results: {},
        currentPage: 1,
        activeTab: 'markdown',
      }),
      
      clearResults: () => set({
        results: {},
        processing: { status: 'idle', progress: 0, currentStep: '' },
        activeTab: 'markdown',
      }),
    }),
    {
      name: 'extraction-store',
      version: 3, // Increment this to clear old storage
      storage: createJSONStorage(() => sessionStorage),
      migrate: (persistedState: any, version: number) => {
        // Migration logic for version changes
        if (version < 3) {
          // Reset to defaults for major changes
          return {
            selectedModels: ['docling'],
            zoomLevel: 100,
            showAnnotations: true,
            annotationFilters: ['title', 'header', 'text', 'table', 'figure'],
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        selectedModels: state.selectedModels,
        zoomLevel: state.zoomLevel,
        showAnnotations: state.showAnnotations,
        annotationFilters: state.annotationFilters,
      }),
    }
  )
);

// Settings store for user preferences
interface SettingsStore {
  // User preferences
  defaultModel: string;
  setDefaultModel: (model: string) => void;
  
  defaultZoom: number;
  setDefaultZoom: (zoom: number) => void;
  
  enableAnnotations: boolean;
  setEnableAnnotations: (enable: boolean) => void;
  
  outputFormat: 'md' | 'html' | 'docx' | 'pdf';
  setOutputFormat: (format: 'md' | 'html' | 'docx' | 'pdf') => void;
  
  extractionOptions: {
    extractTables: boolean;
    extractImages: boolean;
    extractFormulas: boolean;
  };
  setExtractionOptions: (options: Partial<SettingsStore['extractionOptions']>) => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // Default values
      defaultModel: 'docling',
      defaultZoom: 100,
      enableAnnotations: true,
      outputFormat: 'md',
      extractionOptions: {
        extractTables: true,
        extractImages: true,
        extractFormulas: false,
      },
      theme: 'system',

      // Actions
      setDefaultModel: (model) => set({ defaultModel: model }),
      setDefaultZoom: (zoom) => set({ defaultZoom: zoom }),
      setEnableAnnotations: (enable) => set({ enableAnnotations: enable }),
      setOutputFormat: (format) => set({ outputFormat: format }),
      setExtractionOptions: (options) =>
        set((prev) => ({
          extractionOptions: { ...prev.extractionOptions, ...options }
        })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'settings-store',
      version: 3, // Increment this to clear old storage
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState: any, version: number) => {
        // Migration logic for version changes
        if (version < 3) {
          // Reset to defaults for major changes
          return {
            defaultModel: 'docling',
            defaultZoom: 100,
            enableAnnotations: true,
            outputFormat: 'md',
            extractionOptions: {
              extractTables: true,
              extractImages: true,
              extractFormulas: false,
            },
            theme: 'system',
          };
        }
        return persistedState;
      },
    }
  )
);