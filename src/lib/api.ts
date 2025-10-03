// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://spacecypher--pdf-extraction-simple-fastapi-app.modal.run';

export interface UploadResponse {
  upload_id: string;
  filename: string;
  size: number;
  pages: number;
  status: string;
}

export interface ApiExtractionResult {
  markdown: string;
  elements: Array<{
    id?: string;
    type: string;
    content: string;
    bbox: number[]; // [x1, y1, x2, y2] - matches backend format
    page: number;
    confidence: number;
  }>;
  metadata: {
    total_pages: number;
    total_elements: number;
    confidence_avg: number;
    processing_time: number;
    model_used: string;
    by_type?: Record<string, number>;
  };
  processing_time: number;
  model: string;
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
    processing_time: number;
    model_used: string;
    by_type?: Record<string, number>;
  };
  processing_time: number;
  model: string;
}

// Helper function to convert backend bbox format to frontend format
export function convertElementToFrontendFormat(element: any) {
  return {
    ...element,
    bbox: {
      x1: element.bbox[0],
      y1: element.bbox[1], 
      x2: element.bbox[2],
      y2: element.bbox[3],
      page: element.page
    }
  };
}

export interface ExtractResponse {
  upload_id: string;
  results: Record<string, ApiExtractionResult>;
  status: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  description: string;
  features: string[];
  speed: string;
  recommended_for: string[];
  available: boolean;
}

// API functions
export const api = {
  // Upload PDF file with progress tracking
  async uploadFile(file: File, onProgress?: (progress: number) => void): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed: Network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload`);
      xhr.send(formData);
    });
  },

  // Extract content using selected models
  async extractContent(
    uploadId: string,
    models: string[],
    options: Record<string, unknown> = {}
  ): Promise<ExtractResponse> {
    console.log('Extracting content with:', { uploadId, models, options });
    
    const response = await fetch(`${API_BASE_URL}/extract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        upload_id: uploadId,
        models,
        options,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Extraction failed: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = `Extraction failed: ${errorData.detail || response.statusText}`;
      } catch {
        // If can't parse JSON, use status text
      }
      console.error('Extraction API error:', { status: response.status, statusText: response.statusText });
      throw new Error(errorMessage);
    }

    return response.json();
  },

  // Get annotated image for a specific page
  getAnnotatedImageUrl(uploadId: string, model: string, page: number): string {
    return `${API_BASE_URL}/annotated-image/${uploadId}/${model}/${page}`;
  },

  // Get available models
  async getModels(): Promise<{ models: ModelInfo[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/models`);
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error('Failed to fetch models from API, using fallback:', error);
      // Return the enhanced models that should now be available
      return {
        models: [
          {
            id: 'docling',
            name: 'Docling',
            description: 'IBM\'s advanced document AI model with superior accuracy for complex layouts',
            features: ['Advanced Layout Analysis', 'Table Detection', 'Scientific Content', 'Multi-column Support'],
            speed: 'Medium',
            recommended_for: ['Business Reports', 'Academic Papers', 'Complex Documents'],
            available: true
          },
          {
            id: 'surya',
            name: 'Surya',
            description: 'Multilingual OCR and layout detection with excellent performance across languages',
            features: ['Multilingual OCR', 'Layout Detection', 'Text Recognition', 'Reading Order'],
            speed: 'Fast',
            recommended_for: ['Multilingual Documents', 'Scanned PDFs', 'Mixed Languages'],
            available: true
          },
          {
            id: 'mineru',
            name: 'MinerU',
            description: 'Specialized for scientific documents with formula and equation extraction',
            features: ['Formula Extraction', 'Scientific Notation', 'Citation Parsing', 'Reference Detection'],
            speed: 'Slow',
            recommended_for: ['Scientific Papers', 'Mathematical Content', 'Research Documents'],
            available: true
          }
        ]
      };
    }
  },

  // Download extracted content in various formats
  async downloadContent(
    uploadId: string,
    model: string,
    format: 'md' | 'html' | 'docx' | 'pdf'
  ): Promise<Blob> {
    const response = await fetch(
      `${API_BASE_URL}/download/${uploadId}/${model}/${format}`
    );

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  },
};

// React Query hooks for better caching and state management
import { useMutation, useQuery } from '@tanstack/react-query';

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({ file, onProgress }: { file: File; onProgress?: (progress: number) => void }) => 
      api.uploadFile(file, onProgress),
    onError: (error: Error) => {
      console.error('Upload error:', error);
    },
  });
};

export const useExtractContent = () => {
  return useMutation({
    mutationFn: ({
      uploadId,
      models,
      options,
    }: {
      uploadId: string;
      models: string[];
      options?: Record<string, unknown>;
    }) => api.extractContent(uploadId, models, options),
    onError: (error: Error) => {
      console.error('Extraction error:', error);
    },
  });
};

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: api.getModels,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Document History API
export const documentHistoryApi = {
  async saveDocumentHistory(data: {
    filename: string;
    userId?: string;
    models: string[];
    totalElements: number;
    totalPages: number;
    processingTime: number;
  }) {
    const formData = new FormData();
    formData.append('filename', data.filename);
    if (data.userId) formData.append('user_id', data.userId);
    formData.append('models', data.models.join(','));
    formData.append('total_elements', data.totalElements.toString());
    formData.append('total_pages', data.totalPages.toString());
    formData.append('processing_time', data.processingTime.toString());

    const response = await fetch(`${API_BASE_URL}/history/save`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to save document history');
    }

    return response.json();
  },

  async getDocumentHistory(userId?: string) {
    const url = new URL(`${API_BASE_URL}/history`);
    if (userId) {
      url.searchParams.append('user_id', userId);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error('Failed to fetch document history');
    }

    return response.json();
  }
};

// Hook for saving document history
export const useSaveDocumentHistory = () => {
  return useMutation({
    mutationFn: documentHistoryApi.saveDocumentHistory,
    onError: (error: Error) => {
      console.error('Failed to save document history:', error);
    },
  });
};

// Hook for fetching document history
export const useDocumentHistory = (userId?: string) => {
  return useQuery({
    queryKey: ['documentHistory', userId],
    queryFn: () => documentHistoryApi.getDocumentHistory(userId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};