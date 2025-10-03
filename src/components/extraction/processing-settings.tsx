'use client';

import { Settings, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ProcessingSettings() {
  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2">
            <Settings className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Processing Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Model Selection</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Docling (Recommended)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Surya (Multilingual)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>MinerU (Scientific)</span>
                </label>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Output Options</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Extract tables</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span>Extract images</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" />
                  <span>Extract formulas</span>
                </label>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2">
            <FileEdit className="h-3 w-3" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schema Editor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Define custom extraction rules and output schema.
            </p>
            <textarea
              className="w-full h-32 border rounded-md p-2 text-sm font-mono"
              placeholder="Enter JSON schema..."
              defaultValue={`{
  "title": "string",
  "headers": ["string"],
  "content": "string",
  "tables": [{}],
  "metadata": {}
}`}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}