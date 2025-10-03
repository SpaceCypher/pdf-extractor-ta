'use client';

import { useState } from 'react';
import { 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  BookOpen, 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Phone,
  Globe,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Header } from '@/components/layout/header';

const faqs = [
  {
    question: 'What file formats are supported?',
    answer: 'We currently support PDF files up to 50MB in size. Support for DOCX, images (JPG, PNG), and other formats is coming soon.',
    category: 'Files'
  },
  {
    question: 'Which AI model should I choose?',
    answer: 'Docling is best for business documents, Surya excels with multilingual content, and MinerU is optimized for scientific papers with formulas.',
    category: 'Models'
  },
  {
    question: 'How long does processing take?',
    answer: 'Processing time varies by model and document complexity. Typically 15-45 seconds per page. Surya is fastest, MinerU takes longest but provides highest accuracy for scientific content.',
    category: 'Processing'
  },
  {
    question: 'Can I process multiple documents at once?',
    answer: 'Yes! Use the batch processing feature to upload and process multiple documents simultaneously. You can compare results across different models.',
    category: 'Features'
  },
  {
    question: 'What export formats are available?',
    answer: 'You can export extracted content as Markdown (.md), HTML (.html), Word Document (.docx), or annotated PDF with bounding boxes.',
    category: 'Export'
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes, all uploaded files are processed securely and automatically deleted after 24 hours. We do not store or use your documents for training.',
    category: 'Security'
  }
];

const contactMethods = [
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    contact: 'support@pdfextractor.com',
    action: 'Send Email'
  },
  {
    icon: MessageCircle,
    title: 'Live Chat',
    description: 'Chat with our support team in real-time',
    contact: 'Available 9 AM - 6 PM EST',
    action: 'Start Chat'
  },
  {
    icon: BookOpen,
    title: 'Documentation',
    description: 'Browse our comprehensive guides',
    contact: 'View all documentation',
    action: 'View Docs'
  }
];

export function SupportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    priority: 'medium'
  });

  const categories = ['All', 'Files', 'Models', 'Processing', 'Features', 'Export', 'Security'];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log('Support ticket submitted:', ticketForm);
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <HelpCircle className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Help & Support</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions or get in touch with our team
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {contactMethods.map((method) => (
            <Card key={method.title} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 text-center">
                <method.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{method.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                <p className="text-sm font-medium mb-4">{method.contact}</p>
                <Button className="w-full">
                  {method.action}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Frequently Asked Questions
                </CardTitle>
                
                {/* Search and Filter */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search FAQs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {filteredFaqs.map((faq, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{faq.question}</h4>
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                  ))}
                  
                  {filteredFaqs.length === 0 && (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No FAQs found matching your search.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Ticket Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submit a Ticket
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Can't find what you're looking for? Send us a message.
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={ticketForm.name}
                      onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={ticketForm.email}
                      onChange={(e) => setTicketForm({...ticketForm, email: e.target.value})}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md"
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={ticketForm.message}
                      onChange={(e) => setTicketForm({...ticketForm, message: e.target.value})}
                      placeholder="Describe your issue in detail..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Support Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Avg Response Time</span>
                  </div>
                  <span className="text-sm font-medium">2.4 hours</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Resolution Rate</span>
                  </div>
                  <span className="text-sm font-medium">98.5%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Tickets Today</span>
                  </div>
                  <span className="text-sm font-medium">12</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}