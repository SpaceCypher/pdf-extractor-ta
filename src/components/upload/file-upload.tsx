'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
}

export function FileUpload({ onFileUpload }: FileUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setUploadedFile(file);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
  });

  const removeFile = () => {
    setUploadedFile(null);
  };

  if (uploadedFile) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8">
          <div className="text-center">
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-3 py-2 rounded-lg">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{uploadedFile.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                  className="h-auto p-1 text-red-700 hover:text-red-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              File ready for processing
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-2 border-dashed transition-colors ${
      isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
    }`}>
      <CardContent className="p-8">
        <div {...getRootProps()} className="cursor-pointer">
          <input {...getInputProps()} />
          <div className="text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isDragActive ? 'Drop the file here' : 'Drag and drop files here, or click to upload'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Allowed files: PDF, DOCX, JPG, PNG
            </p>
            <Button variant="outline">Upload Files</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}