'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/layout/header';
import { ApiKeyManager } from '@/components/settings/api-key-manager';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function SettingsPage() {
  const { data: session } = useSession();

  const userInitials = session?.user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || session?.user?.email?.[0].toUpperCase() || 'U';

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen">
        <Header />
        
        <div className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Settings</h1>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage your personal information and display preferences
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={session?.user?.image || undefined} alt={session?.user?.name || 'User'} />
                    <AvatarFallback className="text-lg font-semibold">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{session?.user?.name || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    <p className="text-sm text-muted-foreground">Role: User</p>
                  </div>
                </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    defaultValue="Space Bar"
                    placeholder="Your full legal name for official purposes"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your full legal name for official purposes
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred Name</Label>
                  <Input
                    id="preferredName"
                    placeholder="Not set"
                    className="text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground">
                    How you&apos;d like to be addressed in the application
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Input
                    id="organization"
                    defaultValue="Space Bar's Organization"
                  />
                  <p className="text-xs text-muted-foreground">
                    The organization you belong to
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="sanidhyaisaprogrammer@gmail.com"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>
              </div>

              <div className="pt-4">
                <Button>Edit Profile</Button>
              </div>
            </CardContent>
          </Card>

          {/* Processing Preferences */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Processing Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure default settings for document processing
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultModel">Default Extraction Model</Label>
                  <select
                    id="defaultModel"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    defaultValue="docling"
                  >
                    <option value="docling">Docling (Recommended)</option>
                    <option value="surya">Surya (Multilingual)</option>
                    <option value="mineru">MinerU (Scientific)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outputFormat">Default Output Format</Label>
                  <select
                    id="outputFormat"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    defaultValue="markdown"
                  >
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="docx">Word Document</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="extractTables" defaultChecked />
                  <Label htmlFor="extractTables">Extract tables by default</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="extractImages" defaultChecked />
                  <Label htmlFor="extractImages">Extract images by default</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="extractFormulas" />
                  <Label htmlFor="extractFormulas">Extract formulas and equations</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="enableAnnotations" defaultChecked />
                  <Label htmlFor="enableAnnotations">Show visual annotations</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage backend service connections and authentication
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Backend API Keys</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure authentication for PDF extraction services
                  </p>
                </div>
                <ApiKeyManager />
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Statistics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track your document processing usage
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">127</div>
                  <div className="text-sm text-blue-600">Documents Processed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">1,543</div>
                  <div className="text-sm text-green-600">Pages Extracted</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">89.2%</div>
                  <div className="text-sm text-purple-600">Accuracy Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}