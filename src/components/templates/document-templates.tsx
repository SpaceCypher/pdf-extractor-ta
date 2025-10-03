'use client';

import { useState } from 'react';
import { 
  FileType, 
  BookOpen, 
  FileText, 
  Receipt, 
  Newspaper,
  GraduationCap,
  Building,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'academic' | 'legal' | 'technical' | 'personal';
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  sampleFields: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  recommendedModel: string;
}

export function DocumentTemplates() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const templates: DocumentTemplate[] = [
    {
      id: 'invoice',
      name: 'Invoice Template',
      description: 'Extract line items, totals, vendor information, and payment details',
      category: 'business',
      icon: Receipt,
      features: ['Table Extraction', 'Number Recognition', 'Date Parsing'],
      sampleFields: ['Invoice Number', 'Date', 'Amount', 'Line Items', 'Tax'],
      difficulty: 'basic',
      recommendedModel: 'Docling'
    },
    {
      id: 'research-paper',
      name: 'Research Paper',
      description: 'Extract abstract, sections, citations, figures, and references',
      category: 'academic',
      icon: GraduationCap,
      features: ['Citation Parsing', 'Figure Extraction', 'Section Headers'],
      sampleFields: ['Title', 'Abstract', 'Authors', 'References', 'Figures'],
      difficulty: 'advanced',
      recommendedModel: 'MinerU'
    },
    {
      id: 'contract',
      name: 'Legal Contract',
      description: 'Extract parties, terms, clauses, and important dates',
      category: 'legal',
      icon: FileText,
      features: ['Entity Recognition', 'Date Extraction', 'Clause Identification'],
      sampleFields: ['Parties', 'Terms', 'Effective Date', 'Signatures'],
      difficulty: 'intermediate',
      recommendedModel: 'Docling'
    },
    {
      id: 'manual',
      name: 'Technical Manual',
      description: 'Extract procedures, diagrams, specifications, and troubleshooting',
      category: 'technical',
      icon: BookOpen,
      features: ['Diagram Recognition', 'Step Extraction', 'Table Processing'],
      sampleFields: ['Procedures', 'Specifications', 'Diagrams', 'Warnings'],
      difficulty: 'intermediate',
      recommendedModel: 'Docling'
    },
    {
      id: 'report',
      name: 'Business Report',
      description: 'Extract executive summary, data tables, charts, and conclusions',
      category: 'business',
      icon: Building,
      features: ['Chart Recognition', 'Data Tables', 'Summary Extraction'],
      sampleFields: ['Executive Summary', 'Data Points', 'Charts', 'Conclusions'],
      difficulty: 'intermediate',
      recommendedModel: 'Docling'
    },
    {
      id: 'newsletter',
      name: 'Newsletter',
      description: 'Extract articles, headlines, images, and contact information',
      category: 'personal',
      icon: Newspaper,
      features: ['Multi-column Layout', 'Image Extraction', 'Article Segmentation'],
      sampleFields: ['Headlines', 'Articles', 'Images', 'Contact Info'],
      difficulty: 'basic',
      recommendedModel: 'Surya'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'business', label: 'Business' },
    { id: 'academic', label: 'Academic' },
    { id: 'legal', label: 'Legal' },
    { id: 'technical', label: 'Technical' },
    { id: 'personal', label: 'Personal' }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'business':
        return 'bg-blue-100 text-blue-800';
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'legal':
        return 'bg-red-100 text-red-800';
      case 'technical':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileType className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5" />
            Document Templates
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Pre-configured extraction templates for common document types
          </p>
        </DialogHeader>
        
        <div className="mt-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          <ScrollArea className="h-[500px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Card key={template.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              <Badge className={getCategoryColor(template.category)}>
                                {template.category}
                              </Badge>
                              <Badge className={getDifficultyColor(template.difficulty)}>
                                {template.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-xs font-medium text-gray-600 mb-1">Features</h4>
                          <div className="flex flex-wrap gap-1">
                            {template.features.map((feature) => (
                              <Badge key={feature} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-gray-600 mb-1">Sample Fields</h4>
                          <div className="text-xs text-muted-foreground">
                            {template.sampleFields.join(', ')}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div>
                            <span className="text-xs text-muted-foreground">Recommended:</span>
                            <div className="text-xs font-medium">{template.recommendedModel}</div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {filteredTemplates.length} templates available
            </span>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Custom Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}