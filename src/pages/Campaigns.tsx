import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Campaign } from '../types';
import { 
  Plus, 
  Search, 
  Calendar, 
  Users, 
  Eye, 
  MousePointer, 
  MoreHorizontal, 
  Play, 
  Edit,
  ArrowLeft,
  Mail,
  CheckCircle,
  FileText,
  Settings,
  X,
  ChevronDown,
  Copy
} from 'lucide-react';

interface CampaignBuilder {
  id?: string;
  name: string;
  sender: {
    email: string;
    name: string;
  };
  recipients: {
    lists: string[];
    count: number;
  };
  subject: string;
  design: {
    templateId?: string;
    htmlContent: string;
  };
  schedule: {
    type: 'now' | 'later';
    date?: string;
    time?: string;
    timezone: string;
  };
  status: 'draft' | 'scheduled' | 'sent' | 'sending';
}

const Campaigns = () => {
  const { campaigns } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentStep, setCurrentStep] = useState<'list' | 'builder'>('list');
  const [builderStep, setBuilderStep] = useState<'setup' | 'recipients' | 'subject' | 'design' | 'schedule'>('setup');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [campaignBuilder, setCampaignBuilder] = useState<CampaignBuilder>({
    name: '',
    sender: {
      email: 'hello@rapidsteno.com',
      name: 'Rapid Steno Team'
    },
    recipients: {
      lists: [],
      count: 0
    },
    subject: '',
    design: {
      htmlContent: ''
    },
    schedule: {
      type: 'later',
      date: '',
      time: '',
      timezone: 'Asia/Kolkata GMT +05:30'
    },
    status: 'draft'
  });

  const senderEmails = [
    { email: 'hello@rapidsteno.com', name: 'Rapid Steno Team' },
    { email: 'support@rapidsteno.com', name: 'Rapid Steno Support' },
    { email: 'noreply@rapidsteno.com', name: 'Rapid Steno' },
    { email: 'team@rapidsteno.com', name: 'Rapid Steno Team' }
  ];

  const emailLists = [
    { id: '1', name: 'Premium Subscribers', count: 1250 },
    { id: '2', name: 'Newsletter Subscribers', count: 3420 },
    { id: '3', name: 'Trial Users', count: 890 },
    { id: '4', name: 'Basic Plan Users', count: 567 }
  ];

  const personalizationTags = [
    { tag: '{{first_name}}', description: 'First name' },
    { tag: '{{last_name}}', description: 'Last name' },
    { tag: '{{email}}', description: 'Email address' },
    { tag: '{{company}}', description: 'Company name' },
    { tag: '{{trial_end_date}}', description: 'Trial end date' },
    { tag: '{{plan_name}}', description: 'Subscription plan' }
  ];

  const filteredCampaigns = campaigns.filter((campaign: Campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (campaign.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'sending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'automated': return 'bg-purple-100 text-purple-800';
      case 'broadcast': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  const handleCreateCampaign = () => {
    setCurrentStep('builder');
    setBuilderStep('setup');
    setCampaignBuilder({
      name: '',
      sender: {
        email: 'hello@rapidsteno.com',
        name: 'Rapid Steno Team'
      },
      recipients: {
        lists: [],
        count: 0
      },
      subject: '',
      design: {
        htmlContent: ''
      },
      schedule: {
        type: 'later',
        date: '',
        time: '',
        timezone: 'Asia/Kolkata GMT +05:30'
      },
      status: 'draft'
    });
  };

  const handleNextStep = () => {
    switch (builderStep) {
      case 'setup':
        setBuilderStep('recipients');
        break;
      case 'recipients':
        setBuilderStep('subject');
        break;
      case 'subject':
        setBuilderStep('design');
        break;
      case 'design':
        setBuilderStep('schedule');
        break;
      case 'schedule':
        setShowScheduleModal(true);
        break;
    }
  };

  const handlePreviousStep = () => {
    switch (builderStep) {
      case 'recipients':
        setBuilderStep('setup');
        break;
      case 'subject':
        setBuilderStep('recipients');
        break;
      case 'design':
        setBuilderStep('subject');
        break;
      case 'schedule':
        setBuilderStep('design');
        break;
    }
  };

  const insertPersonalizationTag = (tag: string) => {
    setCampaignBuilder({
      ...campaignBuilder,
      subject: campaignBuilder.subject + tag
    });
  };

  const handleListSelection = (listId: string) => {
    const isSelected = campaignBuilder.recipients.lists.includes(listId);
    let newLists;
    
    if (isSelected) {
      newLists = campaignBuilder.recipients.lists.filter(id => id !== listId);
    } else {
      newLists = [...campaignBuilder.recipients.lists, listId];
    }
    
    const totalCount = newLists.reduce((sum, id) => {
      const list = emailLists.find(l => l.id === id);
      return sum + (list?.count || 0);
    }, 0);

    setCampaignBuilder({
      ...campaignBuilder,
      recipients: {
        lists: newLists,
        count: totalCount
      }
    });
  };

  const handleSenderChange = (email: string) => {
    const sender = senderEmails.find(s => s.email === email);
    if (sender) {
      setCampaignBuilder({
        ...campaignBuilder,
        sender: sender
      });
    }
  };

  const handleScheduleCampaign = () => {
    // Save campaign logic here
    console.log('Scheduling campaign:', campaignBuilder);
    setShowScheduleModal(false);
    setCurrentStep('list');
  };

  const getStepIcon = (step: string, currentStep: string) => {
    const stepOrder = ['setup', 'recipients', 'subject', 'design', 'schedule'];
    const currentIndex = stepOrder.indexOf(currentStep);
    const stepIndex = stepOrder.indexOf(step);
    
    if (stepIndex < currentIndex) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (stepIndex === currentIndex) {
      return <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">{stepIndex + 1}</div>;
    } else {
      return <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center text-white text-xs font-bold">{stepIndex + 1}</div>;
    }
  };

  if (currentStep === 'list') {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-600">Create and manage your email campaigns</p>
          </div>
          <button
            onClick={handleCreateCampaign}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
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
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status || 'draft')}`}>
                      {campaign.status || 'draft'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(campaign.type || 'broadcast')}`}>
                      {campaign.type || 'broadcast'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{campaign.description || 'Email campaign'}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {new Date(campaign.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Target: {campaign.target_audience || 'All subscribers'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Play className="w-4 h-4" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Recipients</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{(Math.random() * 5000 + 1000).toFixed(0)}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Open Rate</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{(Math.random() * 30 + 15).toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MousePointer className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Click Rate</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{(Math.random() * 8 + 2).toFixed(1)}%</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <MousePointer className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Total Clicks</span>
                  </div>
                  <p className="text-xl font-bold text-gray-900">{(Math.random() * 200 + 50).toFixed(0)}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors text-sm">
                    View Details
                  </button>
                  <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    Duplicate
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Template: Newsletter Template
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to get started</p>
            <button
              onClick={handleCreateCampaign}
              className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Create Campaign
            </button>
          </div>
        )}
      </div>
    );
  }

  if (currentStep === 'builder') {
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {campaignBuilder.name || 'New Campaign'}
                </h1>
                <span className="text-sm text-gray-500">Draft</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Preview & Test</span>
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-4xl">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                {getStepIcon('setup', builderStep)}
                <div>
                  <div className="text-sm font-medium text-gray-900">Sender</div>
                  {campaignBuilder.sender.email && (
                    <div className="text-xs text-gray-500">{campaignBuilder.sender.name}</div>
                  )}
                </div>
                {builderStep !== 'setup' && campaignBuilder.sender.email && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>

              <div className="flex items-center space-x-3">
                {getStepIcon('recipients', builderStep)}
                <div>
                  <div className="text-sm font-medium text-gray-900">Recipients</div>
                  {campaignBuilder.recipients.count > 0 && (
                    <div className="text-xs text-gray-500">{campaignBuilder.recipients.count.toLocaleString()} contacts</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStepIcon('subject', builderStep)}
                <div>
                  <div className="text-sm font-medium text-gray-900">Subject</div>
                  {campaignBuilder.subject && (
                    <div className="text-xs text-gray-500 max-w-32 truncate">{campaignBuilder.subject}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStepIcon('design', builderStep)}
                <div>
                  <div className="text-sm font-medium text-gray-900">Design</div>
                  <div className="text-xs text-gray-500">Create your email content</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto">
          {builderStep === 'setup' && (
            <div className="max-w-2xl mx-auto p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Sender</h2>
                  <p className="text-gray-600">Choose who this campaign is from</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Enter campaign name"
                      value={campaignBuilder.name}
                      onChange={(e) => setCampaignBuilder({...campaignBuilder, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Email</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      value={campaignBuilder.sender.email}
                      onChange={(e) => handleSenderChange(e.target.value)}
                    >
                      {senderEmails.map((sender) => (
                        <option key={sender.email} value={sender.email}>
                          {sender.name} - {sender.email}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {campaignBuilder.sender.name} - {campaignBuilder.sender.email}
                      </span>
                      <button className="text-sm text-accent hover:text-accent-hover">
                        Manage sender
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextStep}
                    disabled={!campaignBuilder.name || !campaignBuilder.sender.email}
                    className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {builderStep === 'recipients' && (
            <div className="max-w-2xl mx-auto p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-gray-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Recipients</h2>
                  <p className="text-gray-600">The people who receive your campaign</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Select Lists</h3>
                    <button className="text-accent hover:text-accent-hover text-sm">
                      Add recipients
                    </button>
                  </div>

                  {emailLists.map((list) => (
                    <div
                      key={list.id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        campaignBuilder.recipients.lists.includes(list.id)
                          ? 'border-accent bg-accent/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleListSelection(list.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{list.name}</h4>
                          <p className="text-sm text-gray-500">{list.count.toLocaleString()} subscribers</p>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          campaignBuilder.recipients.lists.includes(list.id)
                            ? 'border-accent bg-accent'
                            : 'border-gray-300'
                        }`}>
                          {campaignBuilder.recipients.lists.includes(list.id) && (
                            <CheckCircle className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {campaignBuilder.recipients.count > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="font-medium text-blue-900">
                          Total Recipients: {campaignBuilder.recipients.count.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={campaignBuilder.recipients.count === 0}
                    className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {builderStep === 'subject' && (
            <div className="max-w-2xl mx-auto p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-gray-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Subject</h2>
                  <p className="text-gray-600">Add a subject line for this campaign</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                      <span className="text-sm text-gray-500">{campaignBuilder.subject.length}/150</span>
                    </div>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                      placeholder="Enter subject line"
                      value={campaignBuilder.subject}
                      onChange={(e) => setCampaignBuilder({...campaignBuilder, subject: e.target.value})}
                      maxLength={150}
                    />
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-3">Personalization Tags</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {personalizationTags.map((tag) => (
                        <button
                          key={tag.tag}
                          onClick={() => insertPersonalizationTag(tag.tag)}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                          <div>
                            <code className="text-sm font-mono text-blue-600">{tag.tag}</code>
                            <p className="text-xs text-gray-500">{tag.description}</p>
                          </div>
                          <Copy className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {campaignBuilder.subject && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Preview</h4>
                      <div className="bg-white rounded border p-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{campaignBuilder.sender.name}</div>
                          <div className="text-gray-600">{campaignBuilder.subject}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={!campaignBuilder.subject.trim()}
                    className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {builderStep === 'design' && (
            <div className="max-w-2xl mx-auto p-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Design</h2>
                  <p className="text-gray-600">Create your email content</p>
                </div>

                <div className="space-y-6">
                  <button
                    onClick={() => {
                      // Navigate to template builder
                      window.open('/templates', '_blank');
                    }}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <div className="text-center">
                      <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Start designing</h3>
                      <p className="text-gray-600">Use our email builder to create your campaign</p>
                    </div>
                  </button>

                  <div className="text-center">
                    <div className="text-sm text-gray-500">or</div>
                  </div>

                  <button className="w-full border border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-left">
                    <div className="flex items-center space-x-4">
                      <FileText className="w-8 h-8 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Choose from templates</h3>
                        <p className="text-gray-600">Select from your saved templates</p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handlePreviousStep}
                    className="border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent-hover transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                <button 
                  onClick={() => setShowScheduleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">When would you like to send the campaign?</h4>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="schedule"
                        value="now"
                        checked={campaignBuilder.schedule.type === 'now'}
                        onChange={() => setCampaignBuilder({
                          ...campaignBuilder,
                          schedule: { ...campaignBuilder.schedule, type: 'now' }
                        })}
                        className="w-4 h-4 text-accent"
                      />
                      <span className="text-gray-900">Send now</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="schedule"
                        value="later"
                        checked={campaignBuilder.schedule.type === 'later'}
                        onChange={() => setCampaignBuilder({
                          ...campaignBuilder,
                          schedule: { ...campaignBuilder.schedule, type: 'later' }
                        })}
                        className="w-4 h-4 text-accent"
                      />
                      <span className="text-gray-900">Schedule for later</span>
                    </label>
                  </div>
                </div>

                {campaignBuilder.schedule.type === 'later' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          value={campaignBuilder.schedule.date}
                          onChange={(e) => setCampaignBuilder({
                            ...campaignBuilder,
                            schedule: { ...campaignBuilder.schedule, date: e.target.value }
                          })}
                        />
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          value={campaignBuilder.schedule.time?.split(':')[0] || '18'}
                          onChange={(e) => {
                            const minutes = campaignBuilder.schedule.time?.split(':')[1] || '30';
                            setCampaignBuilder({
                              ...campaignBuilder,
                              schedule: { ...campaignBuilder.schedule, time: `${e.target.value}:${minutes}` }
                            });
                          }}
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i.toString().padStart(2, '0')}>
                              {i.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        <select
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                          value={campaignBuilder.schedule.time?.split(':')[1] || '30'}
                          onChange={(e) => {
                            const hours = campaignBuilder.schedule.time?.split(':')[0] || '18';
                            setCampaignBuilder({
                              ...campaignBuilder,
                              schedule: { ...campaignBuilder.schedule, time: `${hours}:${e.target.value}` }
                            });
                          }}
                        >
                          <option value="00">00</option>
                          <option value="15">15</option>
                          <option value="30">30</option>
                          <option value="45">45</option>
                        </select>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{campaignBuilder.schedule.timezone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleCampaign}
                  className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
                >
                  {campaignBuilder.schedule.type === 'now' ? 'Send Now' : 'Schedule'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default Campaigns;