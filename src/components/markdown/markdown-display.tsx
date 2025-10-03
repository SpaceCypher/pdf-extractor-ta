'use client';

import { Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MarkdownDisplayProps {
  content?: string;
  results?: Record<string, unknown>;
  uploadId?: string;
  onDownload?: (format: 'md' | 'html' | 'docx' | 'pdf') => Promise<void>;
}

export function MarkdownDisplay({ content, results, onDownload }: MarkdownDisplayProps) {
  const firstResult = results ? Object.values(results)[0] as { markdown?: string } : null;
  const activeContent = content || firstResult?.markdown || '';
  
  const handleCopy = () => {
    if (activeContent) {
      navigator.clipboard.writeText(activeContent);
    }
  };

  const handleDownload = async () => {
    if (onDownload) {
      await onDownload('md');
    } else if (activeContent) {
      const blob = new Blob([activeContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-content.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="h-full w-full flex flex-col min-h-0">
      <Tabs defaultValue="markdown" className="h-full w-full flex flex-col min-h-0">
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 bg-white border-b border-gray-200">
          <TabsList className="h-9 bg-gray-100 border border-gray-200 shadow-sm">
            <TabsTrigger 
              value="markdown" 
              className="text-sm px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium"
            >
              Markdown
            </TabsTrigger>
            <TabsTrigger 
              value="schema" 
              className="text-sm px-5 py-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 text-gray-600 font-medium"
            >
              Schema
            </TabsTrigger>
            <TabsTrigger 
              value="chunking" 
              disabled 
              className="text-sm px-5 py-2 text-gray-400 cursor-not-allowed"
            >
              No chunking
            </TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy} 
              className="h-9 px-4 text-sm border-gray-300 hover:bg-gray-50 shadow-sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>

        <TabsContent value="markdown" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full w-full">
            <div className="p-6 bg-white min-h-full w-full">
              <div className="prose prose-sm max-w-none text-gray-900 w-full">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 w-full break-words">
                  {activeContent || 'No content available'}
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="schema" className="flex-1 m-0 min-h-0">
          <ScrollArea className="h-full">
            <div className="p-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="font-medium mb-3 text-sm">Document Schema</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>Title Elements:</span>
                    <span className="font-mono">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Header Elements:</span>
                    <span className="font-mono">44</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Text Blocks:</span>
                    <span className="font-mono">208</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tables:</span>
                    <span className="font-mono">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lists:</span>
                    <span className="font-mono">15</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}