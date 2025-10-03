'use client';

import { useState } from 'react';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Edit,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKey {
  id: string;
  name: string;
  service: string;
  keyPreview: string;
  status: 'active' | 'expired' | 'disabled';
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export function ApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production Key',
      service: 'Modal Backend',
      keyPreview: 'ak-prod-****-**7f',
      status: 'active',
      createdAt: new Date('2025-01-01'),
      lastUsed: new Date('2025-01-02T09:30:00'),
      usageCount: 247
    },
    {
      id: '2',
      name: 'Development Key',
      service: 'Modal Backend',
      keyPreview: 'ak-dev-****-**2a',
      status: 'active',
      createdAt: new Date('2024-12-15'),
      lastUsed: new Date('2025-01-02T08:15:00'),
      usageCount: 89
    }
  ]);

  const [showKey, setShowKey] = useState<string | null>(null);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const handleAddKey = () => {
    if (!newKeyName || !newKeyValue) return;
    
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      service: 'Modal Backend',  
      keyPreview: `ak-****-****-${newKeyValue.slice(-4)}`,
      status: 'active',
      createdAt: new Date(),
      usageCount: 0
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setNewKeyValue('');
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
  };

  const toggleKeyVisibility = (id: string) => {
    setShowKey(showKey === id ? null : id);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="h-4 w-4 mr-2" />
          API Keys
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Management
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Manage API keys for backend services and integrations
          </p>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Warning Alert */}
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Keep your API keys secure. Never share them publicly or commit them to version control.
            </AlertDescription>
          </Alert>

          {/* Add New Key */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-base">Add New API Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="keyValue">API Key</Label>
                  <Input
                    id="keyValue"
                    type="password"
                    placeholder="Paste your API key here"
                    value={newKeyValue}
                    onChange={(e) => setNewKeyValue(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddKey} disabled={!newKeyName || !newKeyValue}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Keys */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <Card key={key.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium">{key.name}</span>
                          <Badge className={getStatusColor(key.status)}>
                            {key.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {key.service}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {showKey === key.id ? 'ak-prod-1234567890abcdef-7f2a' : key.keyPreview}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(key.id)}
                          >
                            {showKey === key.id ? (
                              <EyeOff className="h-3 w-3" />
                            ) : (
                              <Eye className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(key.createdAt)}
                          </div>
                          <div>
                            <span className="font-medium">Last used:</span> {key.lastUsed ? formatDate(key.lastUsed) : 'Never'}
                          </div>
                          <div>
                            <span className="font-medium">Usage:</span> {key.usageCount} requests
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteKey(key.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {apiKeys.length} API keys configured
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Test Connection
              </Button>
              <Button variant="outline" size="sm">
                Export Keys
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}