import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Tag, 
  Users,
  Edit,
  Trash2,
  Eye,
  MessageSquare,
  Calendar,
  Download,
  Upload,
  UserPlus,
  TrendingUp,
  Clock,
  Building,
  X,
  Star,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { Lead } from '../types';

const Leads = () => {
  const { state, dispatch } = useCRM();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [showAddLead, setShowAddLead] = useState(false);
  const [showLeadDetails, setShowLeadDetails] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: 'prefer-not-to-say' as 'male' | 'female' | 'other' | 'prefer-not-to-say',
    state: '',
    hearAboutUs: 'google' as 'google' | 'telegram' | 'facebook' | 'instagram' | 'youtube' | 'friend' | 'whatsapp' | 'pamphlet' | 'banner' | 'mouth-to-mouth',
    examCategory: 'Court Exams' as 'Court Exams' | 'SSC & other exams',
    referralCode: '',
    status: 'new' as 'new' | 'trial' | 'converted',
    plan: 'none' as 'basic' | 'advanced' | 'none',
    userType: 'unpaid' as 'unpaid' | 'trial' | 'paid',
    tags: [] as string[],
    notes: ''
  });

  const filteredLeads = state.leads.filter(lead => {
    const matchesSearch = lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesPlan = planFilter === 'all' || lead.plan === planFilter;
    const matchesSource = sourceFilter === 'all' || lead.hearAboutUs === sourceFilter;
    return matchesSearch && matchesStatus && matchesPlan && matchesSource;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'trial': return 'bg-orange-100 text-orange-800';
      case 'converted': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'none': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'basic': return '₹197/month';
      case 'advanced': return '₹497/3 months';
      case 'none': return 'No plan';
      default: return 'No plan';
    }
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case 'unpaid': return 'bg-gray-100 text-gray-800';
      case 'trial': return 'bg-orange-100 text-orange-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeLabel = (userType: string) => {
    switch (userType) {
      case 'unpaid': return 'Unpaid User';
      case 'trial': return 'Trial User';
      case 'paid': return 'Paid User';
      default: return 'Unknown';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <UserPlus className="w-4 h-4" />;
      case 'trial': return <PlayCircle className="w-4 h-4" />;
      case 'converted': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getSourceIcon = (hearAboutUs: string) => {
    switch (hearAboutUs) {
      case 'google': return '🔍';
      case 'telegram': return '✈️';
      case 'facebook': return '👥';
      case 'instagram': return '📱';
      case 'youtube': return '📺';
      case 'friend': return '👫';
      case 'whatsapp': return '💬';
      case 'pamphlet': return '📄';
      case 'banner': return '🎯';
      case 'mouth-to-mouth': return '🗣️';
      default: return '📝';
    }
  };

  const handleAddLead = () => {
    // Determine userType based on status and plan
    let userType: 'unpaid' | 'trial' | 'paid' = 'unpaid';
    if (newLead.status === 'trial') {
      userType = 'trial';
    } else if (newLead.status === 'converted' && newLead.plan !== 'none') {
      userType = 'paid';
    }

    const lead: Lead = {
      id: Date.now().toString(),
      firstName: newLead.firstName,
      lastName: newLead.lastName,
      email: newLead.email,
      phone: newLead.phone,
      gender: newLead.gender,
      state: newLead.state,
      hearAboutUs: newLead.hearAboutUs,
      examCategory: newLead.examCategory,
      referralCode: newLead.referralCode,
      status: newLead.status,
      plan: newLead.plan,
      userType: userType,
      createdAt: new Date(),
      tags: newLead.tags,
      notes: newLead.notes,
      lastActivity: new Date(),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    };

    dispatch({ type: 'ADD_LEAD', payload: lead });
    setShowAddLead(false);
    setNewLead({
      firstName: '', lastName: '', email: '', phone: '', gender: 'prefer-not-to-say',
      state: '', hearAboutUs: 'google', examCategory: 'Court Exams', referralCode: '',
      status: 'new', plan: 'none', userType: 'unpaid', tags: [], notes: ''
    });
  };

  const handleEditLead = (lead: Lead) => {
    dispatch({ type: 'UPDATE_LEAD', payload: lead });
    setEditingLead(null);
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      dispatch({ type: 'DELETE_LEAD', payload: leadId });
    }
  };

  const addTag = (tag: string) => {
    if (tag && !newLead.tags.includes(tag)) {
      setNewLead({ ...newLead, tags: [...newLead.tags, tag] });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewLead({ ...newLead, tags: newLead.tags.filter(tag => tag !== tagToRemove) });
  };

  const leadStats = {
    total: state.leads.length,
    new: state.leads.filter(l => l.status === 'new').length,
    trial: state.leads.filter(l => l.status === 'trial').length,
    converted: state.leads.filter(l => l.status === 'converted').length,
    unpaidUsers: state.leads.filter(l => l.userType === 'unpaid').length,
    trialUsers: state.leads.filter(l => l.userType === 'trial').length,
    paidUsers: state.leads.filter(l => l.userType === 'paid').length
  };

  const isTrialExpiring = (lead: Lead) => {
    if (!lead.trialEndDate) return false;
    const today = new Date();
    const daysLeft = Math.ceil((lead.trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 2 && daysLeft >= 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage your leads and track their progress</p>
        </div>
        <button
          onClick={() => setShowAddLead(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{leadStats.total}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">New Leads</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{leadStats.new}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Trial Users</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{leadStats.trial}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <PlayCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Converted</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{leadStats.converted}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
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
                placeholder="Search leads..."
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
              <option value="new">New</option>
              <option value="trial">Trial</option>
              <option value="converted">Converted</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
            >
              <option value="all">All Plans</option>
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
              <option value="none">No Plan</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {lead.firstName.charAt(0)}{lead.lastName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                    <p className="text-sm text-gray-600">{lead.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)} flex items-center space-x-1`}>
                    {getStatusIcon(lead.status)}
                    <span>{lead.status}</span>
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">{lead.phone}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">State:</span>
                  <span className="font-medium">{lead.state}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Exam Category:</span>
                  <span className="font-medium">{lead.examCategory}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Plan:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(lead.plan)}`}>
                    {lead.plan === 'none' ? 'No Plan' : lead.plan}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">User Type:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUserTypeColor(lead.userType)}`}>
                    {getUserTypeLabel(lead.userType)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Source:</span>
                  <div className="flex items-center space-x-1">
                    <span>{getSourceIcon(lead.hearAboutUs)}</span>
                    <span className="font-medium capitalize">{lead.hearAboutUs.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              {lead.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lead.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{lead.notes}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <button 
                  onClick={() => setShowLeadDetails(lead)}
                  className="flex-1 bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary-hover transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button 
                  onClick={() => setEditingLead(lead)}
                  className="flex-1 border border-gray-300 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button 
                  onClick={() => handleDeleteLead(lead.id)}
                  className="border border-gray-300 py-2 px-3 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors text-sm text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 text-xs text-gray-500 text-center">
                Created: {lead.createdAt.toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first lead</p>
          <button
            onClick={() => setShowAddLead(true)}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Add Lead
          </button>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add New Lead</h3>
              <button 
                onClick={() => setShowAddLead(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.firstName}
                  onChange={(e) => setNewLead({...newLead, firstName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.lastName}
                  onChange={(e) => setNewLead({...newLead, lastName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.email}
                  onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.phone}
                  onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.state}
                  onChange={(e) => setNewLead({...newLead, state: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.gender}
                  onChange={(e) => setNewLead({...newLead, gender: e.target.value as any})}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exam Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.examCategory}
                  onChange={(e) => setNewLead({...newLead, examCategory: e.target.value as any})}
                >
                  <option value="Court Exams">Court Exams</option>
                  <option value="SSC & other exams">SSC & other exams</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">How did you hear about us?</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.hearAboutUs}
                  onChange={(e) => setNewLead({...newLead, hearAboutUs: e.target.value as any})}
                >
                  <option value="google">Google</option>
                  <option value="telegram">Telegram</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="friend">Friend</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="pamphlet">Pamphlet</option>
                  <option value="banner">Banner</option>
                  <option value="mouth-to-mouth">Word of Mouth</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.status}
                  onChange={(e) => {
                    const status = e.target.value as 'new' | 'trial' | 'converted';
                    let plan = newLead.plan;
                    let userType: 'unpaid' | 'trial' | 'paid' = 'unpaid';
                    
                    if (status === 'trial') {
                      plan = 'none';
                      userType = 'trial';
                    } else if (status === 'converted') {
                      if (plan === 'none') plan = 'basic';
                      userType = 'paid';
                    }
                    
                    setNewLead({...newLead, status, plan, userType});
                  }}
                >
                  <option value="new">New</option>
                  <option value="trial">Trial</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.plan}
                  onChange={(e) => {
                    const plan = e.target.value as 'basic' | 'advanced' | 'none';
                    let userType = newLead.userType;
                    
                    if (plan !== 'none' && newLead.status === 'converted') {
                      userType = 'paid';
                    }
                    
                    setNewLead({...newLead, plan, userType});
                  }}
                  disabled={newLead.status === 'trial'}
                >
                  <option value="none">No Plan</option>
                  <option value="basic">Basic (₹197/month)</option>
                  <option value="advanced">Advanced (₹497/3 months)</option>
                </select>
                {newLead.status === 'trial' && (
                  <p className="text-xs text-orange-600 mt-1">Trial users cannot have paid plans</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referral Code</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newLead.referralCode}
                  onChange={(e) => setNewLead({...newLead, referralCode: e.target.value})}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                rows={3}
                value={newLead.notes}
                onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
              />
            </div>

            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => setShowAddLead(false)}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLead}
                disabled={!newLead.firstName || !newLead.lastName || !newLead.email}
                className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;