'use client';

import { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Bell, 
  Shield, 
  Palette, 
  Monitor,
  Globe,
  Database,
  Zap,
  Eye,
  Download,
  Users,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface AdvancedSettingsProps {
  onClose?: () => void;
}

interface UserSettings {
  // General
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  
  // Processing
  defaultModel: string;
  maxConcurrentJobs: number;
  processingTimeout: number;
  retryAttempts: number;
  qualityThreshold: number;
  
  // Privacy & Security
  dataRetention: number;
  shareAnalytics: boolean;
  encryptResults: boolean;
  requireAuth: boolean;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  processingAlerts: boolean;
  errorAlerts: boolean;
  
  // Performance
  cacheResults: boolean;
  prefetchModels: boolean;
  enableGPU: boolean;
  memoryLimit: number;
  
  // Export
  defaultExportFormat: string;
  includeMetadata: boolean;
  compressExports: boolean;
  watermarkExports: boolean;
  
  // API
  apiRateLimit: number;
  webhookUrl: string;
  apiKeyEnabled: boolean;
}

export function AdvancedSettings({ onClose }: AdvancedSettingsProps) {
  const [settings, setSettings] = useState<UserSettings>({
    // General
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
    
    // Processing
    defaultModel: 'pymupdf-advanced',
    maxConcurrentJobs: 3,
    processingTimeout: 300,
    retryAttempts: 2,
    qualityThreshold: 85,
    
    // Privacy & Security
    dataRetention: 30,
    shareAnalytics: true,
    encryptResults: false,
    requireAuth: false,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    processingAlerts: true,
    errorAlerts: true,
    
    // Performance
    cacheResults: true,
    prefetchModels: false,
    enableGPU: true,
    memoryLimit: 4096,
    
    // Export
    defaultExportFormat: 'pdf',
    includeMetadata: true,
    compressExports: false,
    watermarkExports: false,
    
    // API
    apiRateLimit: 100,
    webhookUrl: '',
    apiKeyEnabled: false
  });

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateSetting = <K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasUnsavedChanges(false);
    console.log('Settings saved:', settings);
  };

  const handleReset = () => {
    // Reset to default values
    setSettings({
      theme: 'system',
      language: 'en',
      timezone: 'UTC',
      defaultModel: 'pymupdf-advanced',
      maxConcurrentJobs: 3,
      processingTimeout: 300,
      retryAttempts: 2,
      qualityThreshold: 85,
      dataRetention: 30,
      shareAnalytics: true,
      encryptResults: false,
      requireAuth: false,
      emailNotifications: true,
      pushNotifications: false,
      processingAlerts: true,
      errorAlerts: true,
      cacheResults: true,
      prefetchModels: false,
      enableGPU: true,
      memoryLimit: 4096,
      defaultExportFormat: 'pdf',
      includeMetadata: true,
      compressExports: false,
      watermarkExports: false,
      apiRateLimit: 100,
      webhookUrl: '',
      apiKeyEnabled: false
    });
    setHasUnsavedChanges(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6" />
          <div>
            <h1 className="text-2xl font-bold">Advanced Settings</h1>
            <p className="text-gray-600">Customize your PDF extraction experience</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Unsaved Changes
            </Badge>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select 
                    value={settings.theme} 
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      updateSetting('theme', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => updateSetting('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select 
                  value={settings.timezone} 
                  onValueChange={(value) => updateSetting('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">GMT</SelectItem>
                    <SelectItem value="Europe/Paris">CET</SelectItem>
                    <SelectItem value="Asia/Tokyo">JST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Processing Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Default Model</Label>
                  <Select 
                    value={settings.defaultModel} 
                    onValueChange={(value) => updateSetting('defaultModel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docling">Docling</SelectItem>
                      <SelectItem value="surya">Surya</SelectItem>
                      <SelectItem value="mineru">MinerU</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Concurrent Jobs</Label>
                  <div className="px-3">
                    <Slider
                      value={[settings.maxConcurrentJobs]}
                      onValueChange={([value]: number[]) => updateSetting('maxConcurrentJobs', value)}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1</span>
                      <span className="font-medium">{settings.maxConcurrentJobs}</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Processing Timeout (seconds)</Label>
                  <Input
                    type="number"
                    value={settings.processingTimeout}
                    onChange={(e) => updateSetting('processingTimeout', parseInt(e.target.value))}
                    min={30}
                    max={3600}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Retry Attempts</Label>
                  <Input
                    type="number"
                    value={settings.retryAttempts}
                    onChange={(e) => updateSetting('retryAttempts', parseInt(e.target.value))}
                    min={0}
                    max={5}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Quality Threshold (%)</Label>
                <div className="px-3">
                  <Slider
                    value={[settings.qualityThreshold]}
                    onValueChange={([value]: number[]) => updateSetting('qualityThreshold', value)}
                    max={100}
                    min={50}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>50%</span>
                    <span className="font-medium">{settings.qualityThreshold}%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Share Analytics</div>
                    <div className="text-sm text-gray-500">
                      Help improve the service by sharing anonymous usage data
                    </div>
                  </div>
                  <Switch
                    checked={settings.shareAnalytics}
                    onCheckedChange={(checked: boolean) => updateSetting('shareAnalytics', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Encrypt Results</div>
                    <div className="text-sm text-gray-500">
                      Encrypt extraction results before storage
                    </div>
                  </div>
                  <Switch
                    checked={settings.encryptResults}
                    onCheckedChange={(checked) => updateSetting('encryptResults', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Require Authentication</div>
                    <div className="text-sm text-gray-500">
                      Require login for all operations
                    </div>
                  </div>
                  <Switch
                    checked={settings.requireAuth}
                    onCheckedChange={(checked) => updateSetting('requireAuth', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Data Retention (days)</Label>
                  <Input
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => updateSetting('dataRetention', parseInt(e.target.value))}
                    min={1}
                    max={365}
                  />
                  <div className="text-sm text-gray-500">
                    Documents and results will be automatically deleted after this period
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Email Notifications</div>
                    <div className="text-sm text-gray-500">
                      Receive updates via email
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Push Notifications</div>
                    <div className="text-sm text-gray-500">
                      Browser push notifications
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Processing Alerts</div>
                    <div className="text-sm text-gray-500">
                      Notify when processing completes
                    </div>
                  </div>
                  <Switch
                    checked={settings.processingAlerts}
                    onCheckedChange={(checked) => updateSetting('processingAlerts', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Error Alerts</div>
                    <div className="text-sm text-gray-500">
                      Notify when errors occur
                    </div>
                  </div>
                  <Switch
                    checked={settings.errorAlerts}
                    onCheckedChange={(checked) => updateSetting('errorAlerts', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Performance Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Cache Results</div>
                    <div className="text-sm text-gray-500">
                      Store results locally for faster access
                    </div>
                  </div>
                  <Switch
                    checked={settings.cacheResults}
                    onCheckedChange={(checked) => updateSetting('cacheResults', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Prefetch Models</div>
                    <div className="text-sm text-gray-500">
                      Load models in advance for faster processing
                    </div>
                  </div>
                  <Switch
                    checked={settings.prefetchModels}
                    onCheckedChange={(checked) => updateSetting('prefetchModels', checked)}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">Enable GPU Acceleration</div>
                    <div className="text-sm text-gray-500">
                      Use GPU for faster processing when available
                    </div>
                  </div>
                  <Switch
                    checked={settings.enableGPU}
                    onCheckedChange={(checked) => updateSetting('enableGPU', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Memory Limit (MB)</Label>
                  <div className="px-3">
                    <Slider
                      value={[settings.memoryLimit]}
                      onValueChange={([value]: number[]) => updateSetting('memoryLimit', value)}
                      max={8192}
                      min={1024}
                      step={512}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1GB</span>
                      <span className="font-medium">{(settings.memoryLimit / 1024).toFixed(1)}GB</span>
                      <span>8GB</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-sm font-medium">Enable API Key</div>
                  <div className="text-sm text-gray-500">
                    Require API key for programmatic access
                  </div>
                </div>
                <Switch
                  checked={settings.apiKeyEnabled}
                  onCheckedChange={(checked) => updateSetting('apiKeyEnabled', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>API Rate Limit (requests/hour)</Label>
                <Input
                  type="number"
                  value={settings.apiRateLimit}
                  onChange={(e) => updateSetting('apiRateLimit', parseInt(e.target.value))}
                  min={10}
                  max={10000}
                />
              </div>

              <div className="space-y-2">
                <Label>Webhook URL</Label>
                <Input
                  type="url"
                  value={settings.webhookUrl}
                  onChange={(e) => updateSetting('webhookUrl', e.target.value)}
                  placeholder="https://your-domain.com/webhook"
                />
                <div className="text-sm text-gray-500">
                  Optional: Receive processing completion notifications
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSaving}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>

        <Button
          onClick={handleSave}
          disabled={!hasUnsavedChanges || isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}