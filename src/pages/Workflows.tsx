import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  ArrowLeft,
  Mail,
  Clock,
  Users,
  Settings,
  Save,
  X,
  ChevronDown,
  Calendar,
  Zap,
  BarChart3,
  CheckCircle,
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  stepNumber: number;
  subject: string;
  content: string;
  delay: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
  templateId?: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'draft';
  steps: WorkflowStep[];
  triggers: {
    type: 'lead_created' | 'trial_started' | 'plan_subscribed' | 'manual';
    conditions?: any;
  };
  recipients: number;
  opens: number;
  clicks: number;
  conversions: number;
  createdAt: Date;
  updatedAt: Date;
}

const Workflows = () => {
  const [currentView, setCurrentView] = useState<'list' | 'create' | 'edit'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // Mock workflow data
  const [workflows] = useState<Workflow[]>([
    {
      id: '1',
      name: 'Welcome Series',
      description: 'Onboard new users with a 5-step email sequence',
      status: 'active',
      steps: [
        {
          id: 'step1',
          stepNumber: 1,
          subject: 'Welcome to Rapid Steno!',
          content: 'Welcome email content...',
          delay: { value: 0, unit: 'minutes' }
        },
        {
          id: 'step2',
          stepNumber: 2,
          subject: 'Getting Started Guide',
          content: 'Getting started content...',
          delay: { value: 1, unit: 'days' }
        },
        {
          id: 'step3',
          stepNumber: 3,
          subject: 'Tips for Better Learning',
          content: 'Learning tips content...',
          delay: { value: 3, unit: 'days' }
        }
      ],
      triggers: { type: 'lead_created' },
      recipients: 1250,
      opens: 892,
      clicks: 234,
      conversions: 89,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-25')
    },
    {
      id: '2',
      name: 'Trial Conversion',
      description: 'Convert trial users to paid subscribers',
      status: 'active',
      steps: [
        {
          id: 'step1',
          stepNumber: 1,
          subject: 'Your trial is starting!',
          content: 'Trial start content...',
          delay: { value: 0, unit: 'minutes' }
        },
        {
          id: 'step2',
          stepNumber: 2,
          subject: 'Making the most of your trial',
          content: 'Trial tips content...',
          delay: { value: 2, unit: 'days' }
        },
        {
          id: 'step3',
          stepNumber: 3,
          subject: 'Your trial expires soon',
          content: 'Trial expiry content...',
          delay: { value: 5, unit: 'days' }
        }
      ],
      triggers: { type: 'trial_started' },
      recipients: 450,
      opens: 320,
      clicks: 95,
      conversions: 67,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-24')
    }
  ]);

  const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    status: 'draft',
    steps: [
      {
        id: 'step1',
        stepNumber: 1,
        subject: '',
        content: '',
        delay: { value: 0, unit: 'minutes' }
      }
    ],
    triggers: { type: 'manual' }
  });

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || workflow.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />;
      case 'paused': return <Pause className="w-4 h-4" />;
      case 'draft': return <Edit className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const addWorkflowStep = () => {
    const newStep: WorkflowStep = {
      id: `step${(newWorkflow.steps?.length || 0) + 1}`,
      stepNumber: (newWorkflow.steps?.length || 0) + 1,
      subject: '',
      content: '',
      delay: { value: 1, unit: 'days' }
    };
    
    setNewWorkflow({
      ...newWorkflow,
      steps: [...(newWorkflow.steps || []), newStep]
    });
  };

  const removeWorkflowStep = (stepId: string) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps?.filter(step => step.id !== stepId) || []
    });
  };

  const updateWorkflowStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    setNewWorkflow({
      ...newWorkflow,
      steps: newWorkflow.steps?.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      ) || []
    });
  };

  const handleCreateWorkflow = () => {
    setCurrentView('create');
    setNewWorkflow({
      name: '',
      description: '',
      status: 'draft',
      steps: [
        {
          id: 'step1',
          stepNumber: 1,
          subject: '',
          content: '',
          delay: { value: 0, unit: 'minutes' }
        }
      ],
      triggers: { type: 'manual' }
    });
  };

  const handleSaveWorkflow = () => {
    // Save workflow logic here
    console.log('Saving workflow:', newWorkflow);
    setCurrentView('list');
  };

  if (currentView === 'list') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflows</h1>
            <p className="text-gray-600">Create automated email sequences and campaigns</p>
          </div>
          <button
            onClick={handleCreateWorkflow}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workflow</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Workflows</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{workflows.length}</p>
              </div>
              <div className="bg-blue-500 p-3 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Workflows</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {workflows.filter(w => w.status === 'active').length}
                </p>
              </div>
              <div className="bg-green-500 p-3 rounded-lg">
                <Play className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Recipients</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {workflows.reduce((sum, w) => sum + w.recipients, 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-500 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Avg. Conversion</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {workflows.length > 0 ? 
                    ((workflows.reduce((sum, w) => sum + w.conversions, 0) / 
                      workflows.reduce((sum, w) => sum + w.recipients, 0)) * 100).toFixed(1) : '0.0'
                  }%
                </p>
              </div>
              <div className="bg-orange-500 p-3 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
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
                  placeholder="Search workflows..."
                  className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Workflows List */}
        <div className="space-y-4">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workflow.status)} flex items-center space-x-1`}>
                      {getStatusIcon(workflow.status)}
                      <span>{workflow.status}</span>
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{workflow.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{workflow.steps.length} steps</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Updated: {workflow.updatedAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Recipients</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{workflow.recipients.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Opens</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{workflow.opens.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {((workflow.opens / workflow.recipients) * 100).toFixed(1)}% rate
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Clicks</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{workflow.clicks.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {((workflow.clicks / workflow.recipients) * 100).toFixed(1)}% rate
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Conversions</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">{workflow.conversions.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    {((workflow.conversions / workflow.recipients) * 100).toFixed(1)}% rate
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors text-sm">
                    View Analytics
                  </button>
                  <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Edit Workflow
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Trigger: {workflow.triggers.type.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-12">
            <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No workflows found</h3>
            <p className="text-gray-600 mb-4">Create your first automated email workflow</p>
            <button
              onClick={handleCreateWorkflow}
              className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Create Workflow
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentView === 'create') {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentView('list')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Workflow</h1>
                <p className="text-sm text-gray-500">Build automated email sequences</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={handleSaveWorkflow}
                className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Workflow</span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Workflow Steps Sidebar */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Workflow Steps</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Workflow Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    placeholder="Enter workflow name"
                    value={newWorkflow.name}
                    onChange={(e) => setNewWorkflow({...newWorkflow, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    rows={3}
                    placeholder="Describe this workflow"
                    value={newWorkflow.description}
                    onChange={(e) => setNewWorkflow({...newWorkflow, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trigger</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    value={newWorkflow.triggers?.type}
                    onChange={(e) => setNewWorkflow({
                      ...newWorkflow, 
                      triggers: { type: e.target.value as any }
                    })}
                  >
                    <option value="manual">Manual</option>
                    <option value="lead_created">New Lead Created</option>
                    <option value="trial_started">Trial Started</option>
                    <option value="plan_subscribed">Plan Subscribed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {newWorkflow.steps?.map((step, index) => (
                  <div key={step.id} className="border-2 border-red-300 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">Step {step.stepNumber}</h4>
                      {newWorkflow.steps && newWorkflow.steps.length > 1 && (
                        <button
                          onClick={() => removeWorkflowStep(step.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          placeholder="Email subject"
                          value={step.subject}
                          onChange={(e) => updateWorkflowStep(step.id, { subject: e.target.value })}
                        />
                      </div>
                      
                      {index > 0 && (
                        <div className="border-2 border-red-300 rounded p-3 bg-white">
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Send next message in
                          </label>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                              value={step.delay.value}
                              onChange={(e) => updateWorkflowStep(step.id, {
                                delay: { ...step.delay, value: parseInt(e.target.value) || 0 }
                              })}
                            />
                            <select
                              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                              value={step.delay.unit}
                              onChange={(e) => updateWorkflowStep(step.id, {
                                delay: { ...step.delay, unit: e.target.value as any }
                              })}
                            >
                              <option value="minutes">Minutes</option>
                              <option value="hours">Hours</option>
                              <option value="days">Days</option>
                              <option value="weeks">Weeks</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>

                    <button className="w-full mt-3 text-accent hover:text-accent-hover text-sm flex items-center justify-center space-x-1">
                      <Plus className="w-4 h-4" />
                      <span>Add variant</span>
                    </button>
                  </div>
                ))}

                <button
                  onClick={addWorkflowStep}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-accent hover:text-accent transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Step</span>
                </button>
              </div>
            </div>
          </div>

          {/* Email Editor */}
          <div className="flex-1 flex flex-col">
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">Email Editor</h3>
                  <p className="text-sm text-gray-500">Design your email content</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-accent hover:text-accent-hover text-sm">Preview</button>
                  <button className="text-accent hover:text-accent-hover text-sm">Variables</button>
                  <button className="text-accent hover:text-accent-hover text-sm">Templates</button>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 bg-gray-50">
              <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-96">
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Your subject"
                      value={newWorkflow.steps?.[0]?.subject || ''}
                      onChange={(e) => {
                        if (newWorkflow.steps?.[0]) {
                          updateWorkflowStep(newWorkflow.steps[0].id, { subject: e.target.value });
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                    <div
                      className="min-h-64 border border-gray-200 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-accent"
                      contentEditable
                      suppressContentEditableWarning
                    >
                      <p>Start typing here...</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Workflows;