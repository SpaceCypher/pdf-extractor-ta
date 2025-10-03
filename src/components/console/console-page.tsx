'use client';

import { useState } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  Zap,
  BarChart3,
  RefreshCw,
  Settings,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Header } from '@/components/layout/header';

interface SystemStatus {
  service: string;
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  responseTime: number;
  lastChecked: Date;
}

interface ProcessingJob {
  id: string;
  filename: string;
  model: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
}

export function ConsolePage() {
  const [systemStatus] = useState<SystemStatus[]>([
    {
      service: 'API Gateway',
      status: 'healthy',
      uptime: '99.9%',
      responseTime: 120,
      lastChecked: new Date()
    },
    {
      service: 'Docling Model',
      status: 'healthy',
      uptime: '99.5%',
      responseTime: 2500,
      lastChecked: new Date()
    },
    {
      service: 'Surya Model',
      status: 'healthy',
      uptime: '98.8%',
      responseTime: 1800,
      lastChecked: new Date()
    },
    {
      service: 'MinerU Model',
      status: 'warning',
      uptime: '95.2%',
      responseTime: 3200,
      lastChecked: new Date()
    },
    {
      service: 'File Storage',
      status: 'healthy',
      uptime: '100%',
      responseTime: 50,
      lastChecked: new Date()
    }
  ]);

  const [processingJobs] = useState<ProcessingJob[]>([
    {
      id: 'job_001',
      filename: 'quarterly_report.pdf',
      model: 'Docling',
      status: 'processing',
      progress: 65,
      startTime: new Date(Date.now() - 45000),
      estimatedCompletion: new Date(Date.now() + 15000)
    },
    {
      id: 'job_002',
      filename: 'research_paper.pdf',
      model: 'MinerU',
      status: 'queued',
      progress: 0,
      startTime: new Date(Date.now() - 30000)
    },
    {
      id: 'job_003',
      filename: 'invoice_batch.pdf',
      model: 'Surya',
      status: 'completed',
      progress: 100,
      startTime: new Date(Date.now() - 120000)
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'processing':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'queued':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold">System Console</h1>
              <p className="text-muted-foreground">Monitor system health and processing jobs</p>
            </div>
          </div>
          <Button>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">12,547</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Zap className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                  <p className="text-2xl font-bold">1.2s</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Health</p>
                  <p className="text-2xl font-bold text-green-600">98.5%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {systemStatus.map((service) => (
                    <div key={service.service} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(service.status)}
                        <div>
                          <p className="font-medium">{service.service}</p>
                          <p className="text-sm text-muted-foreground">
                            {service.responseTime}ms response time
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(service.status)}>
                          {service.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {service.uptime} uptime
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Processing Jobs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Processing Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {processingJobs.map((job) => (
                    <div key={job.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">{job.filename}</span>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Model: {job.model}</span>
                          <span>Progress: {job.progress}%</span>
                        </div>
                        
                        {job.status === 'processing' && (
                          <Progress value={job.progress} className="h-1" />
                        )}
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Started: {job.startTime.toLocaleTimeString()}</span>
                          {job.estimatedCompletion && (
                            <span>ETA: {job.estimatedCompletion.toLocaleTimeString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* System Metrics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">2.1s</div>
                <div className="text-sm text-blue-600">Avg Processing Time</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">97.3%</div>
                <div className="text-sm text-green-600">Success Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">847</div>
                <div className="text-sm text-purple-600">Jobs Today</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}