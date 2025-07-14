import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Copy, 
  Trash2, 
  Mail, 
  FileText, 
  Code, 
  Layout,
  Save,
  Send,
  ArrowLeft,
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Type,
  Settings,
  User,
  Calendar,
  Building,
  Tag,
  X
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  previewText: string;
  fromEmail: string;
  fromName: string;
  htmlContent: string;
  createdAt: Date;
  updatedAt: Date;
  category: 'welcome' | 'newsletter' | 'promotion' | 'transactional' | 'custom';
  isActive: boolean;
}

const Templates = () => {
  const [currentStep, setCurrentStep] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [editorMode, setEditorMode] = useState<'simple' | 'code'>('simple');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'layouts' | 'gallery' | 'my-templates' | 'code'>('layouts');

  // Mock data for templates
  const [templates] = useState<EmailTemplate[]>([
    {
      id: '1',
      name: 'Welcome Email',
      subject: 'Welcome to Rapid Steno, {{first_name}}!',
      previewText: 'Get started with your shorthand journey',
      fromEmail: 'hello@rapidsteno.com',
      fromName: 'Rapid Steno Team',
      htmlContent: `<!DOCTYPE html><html><head><title>Welcome</title></head><body><h1>Welcome to Rapid Steno!</h1><p>Hello {{first_name}},</p><p>Thank you for joining Rapid Steno. We're excited to help you master shorthand writing.</p></body></html>`,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20'),
      category: 'welcome',
      isActive: true
    },
    {
      id: '2',
      name: 'Trial Reminder',
      subject: 'Your trial expires in 3 days',
      previewText: 'Don\'t miss out on your shorthand progress',
      fromEmail: 'support@rapidsteno.com',
      fromName: 'Rapid Steno Support',
      htmlContent: `<!DOCTYPE html><html><head><title>Trial Reminder</title></head><body><h1>Your trial is ending soon</h1><p>Hi {{first_name}},</p><p>Your trial expires on {{trial_end_date}}. Upgrade now to continue your learning.</p></body></html>`,
      createdAt: new Date('2024-01-18'),
      updatedAt: new Date('2024-01-22'),
      category: 'transactional',
      isActive: true
    }
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    previewText: '',
    fromEmail: 'hello@rapidsteno.com',
    fromName: 'Rapid Steno Team',
    htmlContent: '',
    category: 'custom' as 'welcome' | 'newsletter' | 'promotion' | 'transactional' | 'custom'
  });

  const fromEmails = [
    'hello@rapidsteno.com',
    'support@rapidsteno.com',
    'noreply@rapidsteno.com',
    'team@rapidsteno.com'
  ];

  const personalizationTags = [
    { tag: '{{first_name}}', description: 'First name' },
    { tag: '{{last_name}}', description: 'Last name' },
    { tag: '{{email}}', description: 'Email address' },
    { tag: '{{company}}', description: 'Company name' },
    { tag: '{{trial_end_date}}', description: 'Trial end date' },
    { tag: '{{plan_name}}', description: 'Subscription plan' }
  ];

  const layoutTemplates = [
    {
      id: 'simple',
      name: 'Simple Newsletter',
      preview: 'https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Newsletter</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #002E2C; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rapid Steno</h1>
        </div>
        <div class="content">
            <h2>Your headline here</h2>
            <p>Your content goes here...</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Rapid Steno. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
    },
    {
      id: 'product',
      name: 'Product Showcase',
      preview: 'https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=400&h=300',
      htmlContent: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Showcase</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #002E2C; color: white; padding: 20px; text-align: center; }
        .content { padding: 30px; }
        .product { border: 1px solid #ddd; padding: 20px; margin: 20px 0; text-align: center; }
        .button { background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Rapid Steno</h1>
        </div>
        <div class="content">
            <h2>Essential gear for every adventure</h2>
            <div class="product">
                <h3>Your Product</h3>
                <p>Describe your product here...</p>
                <a href="#" class="button">Learn More</a>
            </div>
        </div>
        <div class="footer">
            <p>&copy; 2024 Rapid Steno. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    setCurrentStep('create');
    setNewTemplate({
      name: '',
      subject: '',
      previewText: '',
      fromEmail: 'hello@rapidsteno.com',
      fromName: 'Rapid Steno Team',
      htmlContent: '',
      category: 'custom'
    });
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      previewText: template.previewText,
      fromEmail: template.fromEmail,
      fromName: template.fromName,
      htmlContent: template.htmlContent,
      category: template.category
    });
    setCurrentStep('edit');
  };

  const handleSaveTemplate = () => {
    // Save template logic here
    console.log('Saving template:', newTemplate);
    setCurrentStep('list');
  };

  const insertPersonalizationTag = (tag: string, field: 'subject' | 'previewText') => {
    if (field === 'subject') {
      setNewTemplate({...newTemplate, subject: newTemplate.subject + tag});
    } else {
      setNewTemplate({...newTemplate, previewText: newTemplate.previewText + tag});
    }
  };

  const useLayoutTemplate = (layout: any) => {
    setNewTemplate({
      ...newTemplate,
      htmlContent: layout.htmlContent
    });
    setEditorMode('simple');
  };

  if (currentStep === 'list') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Templates</h1>
            <p className="text-gray-600">Create and manage your email templates</p>
          </div>
          <button
            onClick={handleCreateTemplate}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Template</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Templates</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{templates.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Templates</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{templates.filter(t => t.isActive).length}</p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Welcome Templates</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{templates.filter(t => t.category === 'welcome').length}</p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Last Updated</p>
                <p className="text-sm font-bold text-gray-900 mt-1">2 days ago</p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="welcome">Welcome</option>
                <option value="newsletter">Newsletter</option>
                <option value="promotion">Promotion</option>
                <option value="transactional">Transactional</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                    <p className="text-xs text-gray-500">{template.previewText}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{template.fromName} &lt;{template.fromEmail}&gt;</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4" />
                    <span className="capitalize">{template.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Updated {template.updatedAt.toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className="flex-1 bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary-hover transition-colors text-sm flex items-center justify-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>Preview</span>
                  </button>
                  <button 
                    onClick={() => handleEditTemplate(template)}
                    className="flex-1 border border-gray-300 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button className="border border-gray-300 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600 mb-4">Create your first email template to get started</p>
            <button
              onClick={handleCreateTemplate}
              className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Create Template
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'create' || currentStep === 'edit') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentStep('list')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                {currentStep === 'create' ? 'Create Template' : 'Edit Template'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Preview & Test</span>
              </button>
              <button
                onClick={handleSaveTemplate}
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Template</span>
              </button>
            </div>
          </div>
        </div>

        {/* Template Settings */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter template name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                  <div className="flex space-x-1">
                    {personalizationTags.slice(0, 3).map((tag) => (
                      <button
                        key={tag.tag}
                        onClick={() => insertPersonalizationTag(tag.tag, 'subject')}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        title={tag.description}
                      >
                        {tag.tag}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter subject line"
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Preview Text</label>
                  <div className="flex space-x-1">
                    {personalizationTags.slice(0, 2).map((tag) => (
                      <button
                        key={tag.tag}
                        onClick={() => insertPersonalizationTag(tag.tag, 'previewText')}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        title={tag.description}
                      >
                        {tag.tag}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter preview text"
                  value={newTemplate.previewText}
                  onChange={(e) => setNewTemplate({...newTemplate, previewText: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newTemplate.fromEmail}
                  onChange={(e) => setNewTemplate({...newTemplate, fromEmail: e.target.value})}
                >
                  {fromEmails.map((email) => (
                    <option key={email} value={email}>{email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter sender name"
                  value={newTemplate.fromName}
                  onChange={(e) => setNewTemplate({...newTemplate, fromName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newTemplate.category}
                  onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value as any})}
                >
                  <option value="welcome">Welcome</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="promotion">Promotion</option>
                  <option value="transactional">Transactional</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Template Builder */}
        <div className="flex-1 flex">
          {/* Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('layouts')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'layouts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Layouts
                </button>
                <button
                  onClick={() => setActiveTab('my-templates')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'my-templates' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Templates
                </button>
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'code' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Code
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'layouts' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Choose a Layout</h3>
                  <div className="space-y-3">
                    {layoutTemplates.map((layout) => (
                      <div
                        key={layout.id}
                        onClick={() => useLayoutTemplate(layout)}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <img
                          src={layout.preview}
                          alt={layout.name}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                        <p className="font-medium text-gray-900 text-sm">{layout.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'my-templates' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Editor Options</h3>
                  <div className="space-y-3">
                    <div
                      onClick={() => setEditorMode('simple')}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                        editorMode === 'simple' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Simple Editor</h4>
                        <p className="text-sm text-gray-600">Use the simple editor to create simple emails</p>
                      </div>
                    </div>
                    <div
                      onClick={() => setEditorMode('code')}
                      className={`border-2 rounded-lg p-6 cursor-pointer transition-colors ${
                        editorMode === 'code' ? 'border-accent bg-accent/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="font-semibold text-gray-900 mb-2">Paste your Code</h4>
                        <p className="text-sm text-gray-600">Copy and paste your HTML code</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'code' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Personalization Tags</h3>
                  <div className="space-y-2">
                    {personalizationTags.map((tag) => (
                      <div
                        key={tag.tag}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <code className="text-sm font-mono text-blue-600">{tag.tag}</code>
                          <p className="text-xs text-gray-500">{tag.description}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(tag.tag);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {editorMode === 'simple' ? (
              <>
                {/* Toolbar */}
                <div className="bg-white border-b border-gray-200 p-3">
                  <div className="flex items-center space-x-2">
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                      <option>Arial</option>
                      <option>Helvetica</option>
                      <option>Times</option>
                    </select>
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                      <option>16</option>
                      <option>14</option>
                      <option>18</option>
                    </select>
                    <div className="border-l border-gray-300 h-6 mx-2"></div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Bold className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Italic className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Underline className="w-4 h-4" />
                    </button>
                    <div className="border-l border-gray-300 h-6 mx-2"></div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <AlignLeft className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <AlignCenter className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <AlignRight className="w-4 h-4" />
                    </button>
                    <div className="border-l border-gray-300 h-6 mx-2"></div>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Link className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Image className="w-4 h-4" />
                    </button>
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Simple Editor Content */}
                <div className="flex-1 p-6 bg-gray-50">
                  <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-96">
                    <div className="p-6">
                      <div
                        className="min-h-64 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-accent"
                        contentEditable
                        suppressContentEditableWarning
                      >
                        <h2>Your email content goes here...</h2>
                        <p>Start typing to create your email template.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 p-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">HTML Editor</h3>
                  </div>
                  <div className="p-4 h-full">
                    <textarea
                      className="w-full h-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                      value={newTemplate.htmlContent}
                      onChange={(e) => setNewTemplate({...newTemplate, htmlContent: e.target.value})}
                      placeholder="Paste your HTML code here..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Templates;