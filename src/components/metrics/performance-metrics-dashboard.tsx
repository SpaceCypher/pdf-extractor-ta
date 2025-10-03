'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  Clock, 
  Zap, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Cpu,
  HardDrive,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'good' | 'warning' | 'critical';
}

interface ModelPerformance {
  name: string;
  avgProcessingTime: number;
  avgAccuracy: number;
  avgElementsDetected: number;
  totalProcessed: number;
  successRate: number;
  avgConfidence: number;
  memoryUsage: number;
  throughput: number;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  queueSize: number;
  activeJobs: number;
  totalProcessed: number;
  averageLatency: number;
  errorRate: number;
}

export function PerformanceMetricsDashboard() {
  const [timeRange, setTimeRange] = useState('24h');
  const [selectedModel, setSelectedModel] = useState('all');
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - in real app, this would come from API
  const [systemMetrics] = useState<SystemMetrics>({
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 32,
    queueSize: 12,
    activeJobs: 3,
    totalProcessed: 1247,
    averageLatency: 15.2,
    errorRate: 2.1
  });

  const [modelPerformance] = useState<ModelPerformance[]>([
    {
      name: 'Docling',
      avgProcessingTime: 28.3,
      avgAccuracy: 96.8,
      avgElementsDetected: 164,
      totalProcessed: 267,
      successRate: 98.5,
      avgConfidence: 92.3,
      memoryUsage: 728,
      throughput: 2.1
    },
    {
      name: 'Surya',
      avgProcessingTime: 19.7,
      avgAccuracy: 94.4,
      avgElementsDetected: 142,
      totalProcessed: 389,
      successRate: 96.2,
      avgConfidence: 89.8,
      memoryUsage: 396,
      throughput: 3.0
    },
    {
      name: 'MinerU',
      avgProcessingTime: 35.2,
      avgAccuracy: 97.1,
      avgElementsDetected: 198,
      totalProcessed: 156,
      successRate: 94.8,
      avgConfidence: 94.5,
      memoryUsage: 892,
      throughput: 1.7
    }
  ]);

  const [keyMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'avg-processing-time',
      name: 'Avg Processing Time',
      value: 21.5,
      unit: 's/page',
      trend: 'down',
      change: -8.2,
      status: 'good'
    },
    {
      id: 'throughput',
      name: 'Throughput',
      value: 2.8,
      unit: 'docs/min',
      trend: 'up',
      change: 12.5,
      status: 'good'
    },
    {
      id: 'accuracy',
      name: 'Avg Accuracy',
      value: 92.5,
      unit: '%',
      trend: 'up',
      change: 2.1,
      status: 'good'
    },
    {
      id: 'error-rate',
      name: 'Error Rate',
      value: 2.1,
      unit: '%',
      trend: 'down',
      change: -0.8,
      status: 'good'
    },
    {
      id: 'memory-usage',
      name: 'Memory Usage',
      value: 68,
      unit: '%',
      trend: 'stable',
      change: 0.5,
      status: 'warning'
    },
    {
      id: 'queue-size',
      name: 'Queue Size',
      value: 12,
      unit: 'jobs',
      trend: 'up',
      change: 15.4,
      status: 'warning'
    }
  ]);

  // Real-time updates simulation
  useEffect(() => {
    if (!realTimeUpdates) return;
    
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMetricIcon = (id: string) => {
    const icons = {
      'avg-processing-time': Clock,
      'throughput': Zap,
      'accuracy': Target,
      'error-rate': AlertCircle,
      'memory-usage': HardDrive,
      'queue-size': BarChart3
    };
    const Icon = icons[id as keyof typeof icons] || Activity;
    return <Icon className="h-5 w-5" />;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Dashboard</h1>
          <p className="text-gray-600">
            Real-time monitoring and analytics for PDF extraction performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRealTimeUpdates(!realTimeUpdates)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${realTimeUpdates ? 'animate-spin' : ''}`} />
            {realTimeUpdates ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Last Updated */}
      <div className="text-sm text-gray-500 text-right">
        Last updated: {lastUpdated.toLocaleTimeString()}
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {keyMetrics.map(metric => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                {getMetricIcon(metric.id)}
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status}
                </Badge>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-bold">
                  {metric.value}{metric.unit}
                </div>
                <div className="text-sm text-gray-600">{metric.name}</div>
                <div className="flex items-center gap-1 text-sm">
                  {getTrendIcon(metric.trend)}
                  <span className={
                    metric.trend === 'up' && metric.id !== 'error-rate' && metric.id !== 'queue-size'
                      ? 'text-green-600'
                      : metric.trend === 'down' && (metric.id === 'error-rate' || metric.id === 'avg-processing-time')
                      ? 'text-green-600'
                      : metric.trend === 'up'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }>
                    {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="system" className="space-y-6">
        <TabsList>
          <TabsTrigger value="system">System Performance</TabsTrigger>
          <TabsTrigger value="models">Model Comparison</TabsTrigger>
          <TabsTrigger value="throughput">Throughput Analysis</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">{systemMetrics.cpuUsage}%</span>
                  </div>
                  <Progress value={systemMetrics.cpuUsage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className="font-medium">{systemMetrics.memoryUsage}%</span>
                  </div>
                  <Progress value={systemMetrics.memoryUsage} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Disk Usage</span>
                    <span className="font-medium">{systemMetrics.diskUsage}%</span>
                  </div>
                  <Progress value={systemMetrics.diskUsage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Processing Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Processing Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Active Jobs</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {systemMetrics.activeJobs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Queue Size</span>
                    <span className="text-2xl font-bold text-orange-600">
                      {systemMetrics.queueSize}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Processed</span>
                    <span className="text-2xl font-bold text-green-600">
                      {systemMetrics.totalProcessed.toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Model</th>
                      <th className="text-left py-3 px-2">Avg Time (s)</th>
                      <th className="text-left py-3 px-2">Accuracy (%)</th>
                      <th className="text-left py-3 px-2">Elements</th>
                      <th className="text-left py-3 px-2">Success Rate</th>
                      <th className="text-left py-3 px-2">Throughput</th>
                      <th className="text-left py-3 px-2">Memory (MB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelPerformance.map(model => (
                      <tr key={model.name} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 font-medium">{model.name}</td>
                        <td className="py-3 px-2">{model.avgProcessingTime}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Progress value={model.avgAccuracy} className="w-16 h-2" />
                            <span className="text-sm">{model.avgAccuracy}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">{model.avgElementsDetected}</td>
                        <td className="py-3 px-2">
                          <Badge className={
                            model.successRate > 95 
                              ? 'bg-green-100 text-green-800'
                              : model.successRate > 90
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }>
                            {model.successRate}%
                          </Badge>
                        </td>
                        <td className="py-3 px-2">{model.throughput} docs/min</td>
                        <td className="py-3 px-2">{model.memoryUsage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="throughput">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Processing Throughput</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {modelPerformance.reduce((acc, m) => acc + m.throughput, 0).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Combined docs/min</div>
                  </div>
                  
                  <div className="space-y-3">
                    {modelPerformance.map(model => (
                      <div key={model.name} className="flex items-center justify-between">
                        <span className="text-sm">{model.name}</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={(model.throughput / 4) * 100} 
                            className="w-20 h-2" 
                          />
                          <span className="text-sm font-medium">
                            {model.throughput} docs/min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latency Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {systemMetrics.averageLatency}s
                    </div>
                    <div className="text-sm text-gray-600">Average Latency</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>p50</span>
                      <span className="font-medium">12.4s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>p90</span>
                      <span className="font-medium">28.7s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>p95</span>
                      <span className="font-medium">35.2s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>p99</span>
                      <span className="font-medium">58.1s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  Error Rate Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600">
                      {systemMetrics.errorRate}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Error Rate</div>
                  </div>
                  
                  <div className="space-y-3">
                    {modelPerformance.map(model => {
                      const errorRate = 100 - model.successRate;
                      return (
                        <div key={model.name} className="flex items-center justify-between">
                          <span className="text-sm">{model.name}</span>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={errorRate * 10} 
                              className="w-20 h-2"
                            />
                            <span className="text-sm font-medium">
                              {errorRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Common Error Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Timeout Errors', count: 12, percentage: 35 },
                    { type: 'Memory Errors', count: 8, percentage: 24 },
                    { type: 'Parse Errors', count: 7, percentage: 21 },
                    { type: 'Network Errors', count: 4, percentage: 12 },
                    { type: 'Other', count: 3, percentage: 8 }
                  ].map(error => (
                    <div key={error.type} className="flex items-center justify-between">
                      <span className="text-sm">{error.type}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={error.percentage} className="w-20 h-2" />
                        <span className="text-sm font-medium w-8">
                          {error.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}