'use client';

import { useState } from 'react';
import { ChevronDown, Brain, Globe, FlaskConical, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useExtractionStore } from '@/lib/store';
import { useModels } from '@/lib/api';

const modelIcons = {
  docling: Brain,
  surya: Globe,
  mineru: FlaskConical,
};

const modelColors = {
  docling: 'bg-blue-100 text-blue-800',
  surya: 'bg-green-100 text-green-800',
  mineru: 'bg-purple-100 text-purple-800',
};

export function ModelSelector() {
  const { selectedModels, setSelectedModels } = useExtractionStore();
  const { data: modelsData, isLoading } = useModels();
  const [isOpen, setIsOpen] = useState(false);

  const models = modelsData?.models || [];
  const availableModels = models.filter(m => m.available);

  const handleModelToggle = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      // Don't allow removing the last model
      if (selectedModels.length > 1) {
        setSelectedModels(selectedModels.filter(id => id !== modelId));
      }
    } else {
      // Limit to maximum 3 models for comparison
      if (selectedModels.length < 3) {
        setSelectedModels([...selectedModels, modelId]);
      }
    }
  };

  const getModelInfo = (modelId: string) => {
    return models.find(m => m.id === modelId);
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        Loading models...
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 text-xs min-w-[100px]">
          <div className="flex items-center gap-1">
            <span className="truncate">
              {selectedModels.length === 1 
                ? getModelInfo(selectedModels[0])?.name || 'Select Model'
                : `${selectedModels.length} Models`
              }
            </span>
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
            <DropdownMenuContent className="w-[250px]">
        <DropdownMenuLabel className="text-xs">Select Extraction Models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableModels.map((model) => {
          const modelInfo = getModelInfo(model.id);
          const isSelected = selectedModels.includes(model.id);
          
          return (
            <DropdownMenuCheckboxItem
              key={model.id}
              checked={isSelected}
              onCheckedChange={(checked) => {
                handleModelToggle(model.id);
              }}
              className="flex items-start p-2 space-x-2"
            >
              <div className="flex-1">
                <div className="font-medium text-xs">{modelInfo?.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
                  {modelInfo?.description}
                </div>
              </div>
            </DropdownMenuCheckboxItem>
          );
        })}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => setSelectedModels([])}
          className="text-xs text-muted-foreground py-1"
        >
          Clear All Selections
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}