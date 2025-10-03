'use client';

import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Clock,
  Zap,
  FileText,
  BarChart3,
  X
} from 'lucide-react';

interface ProcessingStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: number; // in seconds
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface LiveProgressProps {
  isActive: boolean;
  onCancel?: () => void;
  totalSteps?: number;
  currentStep?: number;
  stepTitle?: string;
  progress?: number;
  estimatedTimeRemaining?: number;
  processingModel?: string;
}

const defaultSteps: ProcessingStep[] = [
  {
    id: 'upload',
    title: 'Uploading File',
    description: 'Uploading PDF to processing server',
    estimatedTime: 3,
    status: 'pending'
  },
  {
    id: 'analyze',
    title: 'Analyzing Document',
    description: 'Analyzing document structure and layout',
    estimatedTime: 8,
    status: 'pending'
  },
  {
    id: 'extract',
    title: 'Extracting Content',
    description: 'Extracting text, tables, and images',
    estimatedTime: 15,
    status: 'pending'
  },
  {
    id: 'annotate',
    title: 'Generating Annotations',
    description: 'Creating visual annotations and bounding boxes',
    estimatedTime: 5,
    status: 'pending'
  },
  {
    id: 'finalize',
    title: 'Finalizing Results',
    description: 'Preparing markdown output and metadata',
    estimatedTime: 3,
    status: 'pending'
  }
];

export function LiveProgress({ 
  isActive, 
  onCancel, 
  totalSteps = 5,
  currentStep = 0, 
  stepTitle = 'Processing...',
  progress = 0,
  estimatedTimeRemaining = 0,
  processingModel = 'Docling'
}: LiveProgressProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>(defaultSteps);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (isActive && !startTime) {
      setStartTime(new Date());
    }
  }, [isActive, startTime]);

  useEffect(() => {
    if (!isActive || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, startTime]);

  useEffect(() => {
    // Update step statuses based on current progress
    setSteps(prevSteps => 
      prevSteps.map((step, index) => {
        if (index < currentStep) {
          return { ...step, status: 'completed' as const };
        } else if (index === currentStep) {
          return { ...step, status: 'active' as const };
        } else {
          return { ...step, status: 'pending' as const };
        }
      })
    );
  }, [currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'active':
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Processing with {processingModel}</h3>
              <p className="text-sm text-muted-foreground">{stepTitle}</p>
            </div>
          </div>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Overall Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Processing Steps */}
        <div className="space-y-4 mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${
                    step.status === 'active' ? 'text-blue-600' : 
                    step.status === 'completed' ? 'text-green-600' : 
                    'text-gray-600'
                  }`}>
                    {step.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ~{step.estimatedTime}s
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Time Information */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Elapsed</p>
              <p className="text-sm font-medium">{formatTime(elapsedTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Remaining</p>
              <p className="text-sm font-medium">
                {estimatedTimeRemaining > 0 ? formatTime(estimatedTimeRemaining) : '~0s'}
              </p>
            </div>
          </div>
        </div>

        {/* Current Activity */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm text-blue-800 font-medium">
              {stepTitle}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}