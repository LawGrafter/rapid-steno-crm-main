import { useState } from 'react';
import { Users, Plus, Search, Eye, Edit, Trash2, X, DollarSign, Upload, Calendar, Tag, User, Phone, Mail, MapPin, CreditCard, Clock, AlertCircle, CheckCircle, XCircle, Shield, GraduationCap, FileText, Star, Zap, TrendingUp, Activity, Award, Target, Briefcase, Globe, Smartphone, UserCheck, CalendarDays, Timer, Crown, Gift, Rocket } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Lead } from '../types';
import CSVImport from '../components/CSVImport';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry',
  'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Lakshadweep'
];

const EXAM_CATEGORIES = ['Court Exams', 'SSC & other exams'];
const SOURCES = ['Google', 'Telegram', 'Facebook', 'Instagram', 'YouTube', 'Friend', 'WhatsApp', 'Pamphlet', 'Banner', 'Word of Mouth'];
const GENDERS = ['Male', 'Female', 'Prefer not to say'];
const STATUSES = ['Active', 'Inactive'];
const PLANS = ['Trial User', 'Basic Monthly', 'Advanced Quarterly', 'Paid', 'Unpaid'];
const AVAILABLE_TAGS = ['legal', 'court-reporting', 'ssc', 'advanced', 'premium', 'urgent'];

const Leads = () => {
  const { leads, addLead, updateLead, deleteLead } = useCRM();
  

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [trialStatusFilter, setTrialStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [examCategoryFilter, setExamCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [newTag, setNewTag] = useState('');
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    ip_address: '',
    state: '',
    gender: '',
    exam_category: '',
    how_did_you_hear: '',
    status: 'Active',
    plan: 'Trial User',
    referral_code: '',
    notes: '',
    tags: [] as string[],
    trial_start_date: '',
    trial_end_date: '',
    subscription_plan: '',
    subscription_start_date: '',
    subscription_end_date: '',
    amount_paid: 0,
    next_payment_date: '',
    is_trial_active: true,
    is_subscription_active: false
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      ...formData,
      name: `${formData.first_name} ${formData.last_name}`.trim(),
      company: formData.state,
      source: formData.how_did_you_hear,
      user_type: formData.is_subscription_active ? 'Paid User' : 'Trial User',
      trial_start_date: formData.trial_start_date ? new Date(formData.trial_start_date).toISOString() : new Date().toISOString(),
      trial_end_date: formData.trial_end_date ? new Date(formData.trial_end_date).toISOString() : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      subscription_start_date: formData.subscription_start_date ? new Date(formData.subscription_start_date).toISOString() : null,
      subscription_end_date: formData.subscription_end_date ? new Date(formData.subscription_end_date).toISOString() : null,
      next_payment_date: formData.next_payment_date ? new Date(formData.next_payment_date).toISOString() : null
    };
    
    await addLead(leadData);
    resetForm();
    setShowAddForm(false);
  };

  const filteredLeads = leads.filter(lead => {
    // Status filter
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    // Subscription plan filter
    const matchesSubscription = subscriptionFilter === 'all' || lead.subscription_plan === subscriptionFilter;
    
    // Trial status filter
    let matchesTrialStatus = true;
    if (trialStatusFilter !== 'all') {
      const trialStatus = getTrialStatus(lead);
      if (trialStatusFilter === 'active') {
        matchesTrialStatus = trialStatus.isActive;
      } else if (trialStatusFilter === 'expired') {
        matchesTrialStatus = !trialStatus.isActive;
      } else if (trialStatusFilter === 'expiring_soon') {
        matchesTrialStatus = trialStatus.isActive && (trialStatus.daysLeft || 0) <= 7;
      }
    }
    
    // State filter
    const matchesState = stateFilter === 'all' || lead.state === stateFilter;
    
    // Exam category filter
    const matchesExamCategory = examCategoryFilter === 'all' || lead.exam_category === examCategoryFilter;
    
    // Source filter
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRangeFilter !== 'all' && lead.created_at) {
      const createdDate = new Date(lead.created_at);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateRangeFilter === 'today') {
        matchesDateRange = daysDiff === 0;
      } else if (dateRangeFilter === 'week') {
        matchesDateRange = daysDiff <= 7;
      } else if (dateRangeFilter === 'month') {
        matchesDateRange = daysDiff <= 30;
      } else if (dateRangeFilter === 'quarter') {
        matchesDateRange = daysDiff <= 90;
      }
    }
    
    // Search filter
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm) ||
                         lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSubscription && matchesTrialStatus && 
           matchesState && matchesExamCategory && matchesSource && 
           matchesDateRange && matchesSearch;
  });

  // Calculate statistics
  const totalLeads = leads.length;
  const trialUsers = leads.filter(lead => lead.is_trial_active).length;
  const paidUsers = leads.filter(lead => lead.is_subscription_active).length;
  const totalRevenue = leads.reduce((sum, lead) => sum + (lead.amount_paid || 0), 0);

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'basic monthly': return 'bg-green-100 text-green-800';
      case 'advanced quarterly': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrialStatus = (lead: Lead) => {
    if (!lead.trial_end_date) return { isActive: false, text: 'No Trial' };
    
    const trialEndDate = new Date(lead.trial_end_date);
    const today = new Date();
    const daysLeft = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      isActive: daysLeft > 0,
      text: daysLeft > 0 ? 'Active' : 'Expired',
      daysLeft
    };
  };

  const handleView = (lead: Lead) => {
    setSelectedLead(lead);
    setShowViewModal(true);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      ip_address: '',
      state: '',
      gender: '',
      exam_category: '',
      how_did_you_hear: '',
      status: 'New',
      plan: 'Trial User',
      referral_code: '',
      notes: '',
      tags: [],
      trial_start_date: '',
      trial_end_date: '',
      subscription_plan: '',
      subscription_start_date: '',
      subscription_end_date: '',
      amount_paid: 0,
      next_payment_date: '',
      is_trial_active: true,
      is_subscription_active: false
    });
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      ip_address: lead.ip_address || '',
      state: lead.state || '',
      gender: lead.gender || '',
      exam_category: lead.exam_category || '',
      how_did_you_hear: lead.how_did_you_hear || '',
      status: lead.status || 'Active',
      plan: lead.plan || 'Trial User',
      referral_code: lead.referral_code || '',
      notes: lead.notes || '',
      tags: lead.tags || [],
      trial_start_date: lead.trial_start_date ? lead.trial_start_date.split('T')[0] : '',
      trial_end_date: lead.trial_end_date ? lead.trial_end_date.split('T')[0] : '',
      subscription_plan: lead.subscription_plan || '',
      subscription_start_date: lead.subscription_start_date ? lead.subscription_start_date.split('T')[0] : '',
      subscription_end_date: lead.subscription_end_date ? lead.subscription_end_date.split('T')[0] : '',
      amount_paid: lead.amount_paid || 0,
      next_payment_date: lead.next_payment_date ? lead.next_payment_date.split('T')[0] : '',
      is_trial_active: lead.is_trial_active ?? true,
      is_subscription_active: lead.is_subscription_active ?? false
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    
    const updatedData = {
      ...formData,
      name: `${formData.first_name} ${formData.last_name}`.trim(),
      company: formData.state,
      source: formData.how_did_you_hear,
      user_type: formData.is_subscription_active ? 'Paid User' : 'Trial User',
      trial_start_date: formData.trial_start_date ? new Date(formData.trial_start_date).toISOString() : null,
      trial_end_date: formData.trial_end_date ? new Date(formData.trial_end_date).toISOString() : null,
      subscription_start_date: formData.subscription_start_date ? new Date(formData.subscription_start_date).toISOString() : null,
      subscription_end_date: formData.subscription_end_date ? new Date(formData.subscription_end_date).toISOString() : null,
      next_payment_date: formData.next_payment_date ? new Date(formData.next_payment_date).toISOString() : null
    };
    
    await updateLead(selectedLead.id, updatedData);
    resetForm();
    setShowEditForm(false);
    setSelectedLead(null);
  };

  const handleDelete = async (leadId: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(leadId);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({...formData, tags: [...formData.tags, tag]});
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Function to clear all filters
  const clearAllFilters = () => {
    setStatusFilter('all');
    setSubscriptionFilter('all');
    setTrialStatusFilter('all');
    setStateFilter('all');
    setExamCategoryFilter('all');
    setSourceFilter('all');
    setDateRangeFilter('all');
    setSearchTerm('');
  };

  // Get unique values for filter options
  const getUniqueStates = () => {
    const states = leads.map(lead => lead.state).filter(Boolean);
    return [...new Set(states)].sort();
  };

  const getUniqueSources = () => {
    const sources = leads.map(lead => lead.source).filter(Boolean);
    return [...new Set(sources)].sort();
  };

  // Function to calculate trial end date (15 days from trial start date)
  const calculateTrialEndDate = (trialStartDate: string): string => {
    if (!trialStartDate) return '';
    const startDate = new Date(trialStartDate);
    const endDate = new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000);
    return endDate.toISOString().split('T')[0];
  };

  // Function to handle trial start date change and automatically calculate trial end date
  const handleTrialStartDateChange = (trialStartDate: string) => {
    const calculatedEndDate = calculateTrialEndDate(trialStartDate);
    setFormData({
      ...formData,
      trial_start_date: trialStartDate,
      trial_end_date: calculatedEndDate
    });
  };

  // Function to handle subscription plan change and update related fields
  const handleSubscriptionPlanChange = (plan: string) => {
    const isTrial = plan === 'Trial';
    const isPaid = plan === 'Paid';
    
    setFormData({
      ...formData,
      subscription_plan: plan,
      is_trial_active: isTrial,
      is_subscription_active: isPaid,
      status: isTrial ? 'Active' : (isPaid ? 'Active' : 'Inactive')
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage your leads and track their progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowCSVImport(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Trial Users</p>
              <p className="text-2xl font-bold text-gray-900">{trialUsers}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid Users</p>
              <p className="text-2xl font-bold text-gray-900">{paidUsers}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalRevenue}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Filter Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Filters</h3>
              <span className="text-sm text-gray-500">({filteredLeads.length} of {leads.length} leads)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                {showFilters ? 'Hide' : 'Show'} Advanced Filters
              </button>
              <button
                onClick={clearAllFilters}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, first name, or last name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Subscription Plan Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select
                  value={subscriptionFilter}
                  onChange={(e) => setSubscriptionFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Plans</option>
                  <option value="Trial">Trial</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              {/* Trial Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trial Status</label>
                <select
                  value={trialStatusFilter}
                  onChange={(e) => setTrialStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Trials</option>
                  <option value="active">Active Trials</option>
                  <option value="expired">Expired Trials</option>
                  <option value="expiring_soon">Expiring Soon (≤7 days)</option>
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All States</option>
                  {getUniqueStates().map(state => (
                    <option key={state} value={state || ''}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Exam Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Exam Category</label>
                <select
                  value={examCategoryFilter}
                  onChange={(e) => setExamCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {EXAM_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Sources</option>
                  {getUniqueSources().map(source => (
                    <option key={source} value={source || ''}>{source}</option>
                  ))}
                </select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            <div className="flex flex-wrap gap-2">
              {statusFilter !== 'all' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter('all')} className="text-blue-600 hover:text-blue-800">×</button>
                </span>
              )}
              {subscriptionFilter !== 'all' && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center gap-1">
                  Plan: {subscriptionFilter}
                  <button onClick={() => setSubscriptionFilter('all')} className="text-green-600 hover:text-green-800">×</button>
                </span>
              )}
              {trialStatusFilter !== 'all' && (
                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full flex items-center gap-1">
                  Trial: {trialStatusFilter.replace('_', ' ')}
                  <button onClick={() => setTrialStatusFilter('all')} className="text-orange-600 hover:text-orange-800">×</button>
                </span>
              )}
              {stateFilter !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
                  State: {stateFilter}
                  <button onClick={() => setStateFilter('all')} className="text-purple-600 hover:text-purple-800">×</button>
                </span>
              )}
              {examCategoryFilter !== 'all' && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                  Category: {examCategoryFilter}
                  <button onClick={() => setExamCategoryFilter('all')} className="text-yellow-600 hover:text-yellow-800">×</button>
                </span>
              )}
              {sourceFilter !== 'all' && (
                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                  Source: {sourceFilter}
                  <button onClick={() => setSourceFilter('all')} className="text-red-600 hover:text-red-800">×</button>
                </span>
              )}
              {dateRangeFilter !== 'all' && (
                <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full flex items-center gap-1">
                  Date: {dateRangeFilter.replace('_', ' ')}
                  <button onClick={() => setDateRangeFilter('all')} className="text-gray-600 hover:text-gray-800">×</button>
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full flex items-center gap-1">
                  Search: "{searchTerm}"
                  <button onClick={() => setSearchTerm('')} className="text-indigo-600 hover:text-indigo-800">×</button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-white border-2 border-white/30">
                    {getInitials(lead.name)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate">{lead.name}</h3>
                  <p className="text-sm text-blue-100 truncate">{lead.email}</p>
                </div>
                <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded-full font-medium shadow-sm">
                  trial
                </span>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              {/* Contact Info */}
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{lead.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{lead.state || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-gray-400" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(lead.plan || 'Trial User')}`}>
                    {lead.plan || 'Trial User'}
                  </span>
                </div>
              </div>
              
              {/* Trial & Subscription */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg mb-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Timer className="w-4 h-4 text-gray-600" />
                  <h4 className="font-semibold text-sm text-gray-800">Trial & Subscription</h4>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center gap-1">
                      {getTrialStatus(lead).isActive ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`font-medium ${
                        getTrialStatus(lead).isActive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getTrialStatus(lead).text}
                      </span>
                    </div>
                  </div>
                  {lead.trial_start_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trial Starts:</span>
                      <span className="font-medium">{new Date(lead.trial_start_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {lead.trial_end_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Trial Ends:</span>
                      <span className="font-medium">{new Date(lead.trial_end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {lead.trial_end_date && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Days Left:</span>
                      <span className={`font-bold ${
                        (getTrialStatus(lead).daysLeft || 0) < 0 ? 'text-red-600' : 
                        (getTrialStatus(lead).daysLeft || 0) <= 3 ? 'text-orange-600' : 
                        (getTrialStatus(lead).daysLeft || 0) <= 7 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {(getTrialStatus(lead).daysLeft || 0) < 0 ? 
                          `${Math.abs(getTrialStatus(lead).daysLeft || 0)} days overdue` : 
                          (getTrialStatus(lead).daysLeft || 0) === 0 ? 'Expires today' :
                          (getTrialStatus(lead).daysLeft || 0) === 1 ? '1 day left' :
                          `${getTrialStatus(lead).daysLeft || 0} days left`
                        }
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subscription:</span>
                    <span className={`font-medium ${
                      lead.is_subscription_active ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {lead.subscription_plan || 'Trial User'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Tags */}
              {lead.tags && lead.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs rounded-full font-medium shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Footer */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleView(lead)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group-hover:scale-105"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(lead)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors group-hover:scale-105"
                    title="Edit Lead"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors group-hover:scale-105"
                    title="Delete Lead"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Lead</h2>
              <button onClick={() => setShowAddForm(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    placeholder="e.g., 192.168.1.100"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Category</label>
                  <select
                    value={formData.exam_category}
                    onChange={(e) => setFormData({...formData, exam_category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select exam category</option>
                    {EXAM_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us?</label>
                  <select
                    value={formData.how_did_you_hear}
                    onChange={(e) => setFormData({...formData, how_did_you_hear: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select source</option>
                    {SOURCES.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({...formData, plan: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PLANS.map((plan) => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trial & Subscription Details */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Trial & Subscription Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trial Start Date</label>
                    <input
                      type="date"
                      value={formData.trial_start_date}
                      onChange={(e) => handleTrialStartDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trial End Date (Auto-calculated)</label>
                    <input
                      type="date"
                      value={formData.trial_end_date}
                      onChange={(e) => setFormData({...formData, trial_end_date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically calculated as 15 days from trial start date</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                    <select
                      value={formData.subscription_plan}
                      onChange={(e) => handleSubscriptionPlanChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Plan</option>
                      <option value="Trial">Trial</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                    <input
                      type="number"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({...formData, amount_paid: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_trial_active}
                      onChange={(e) => setFormData({...formData, is_trial_active: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Trial Active</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_subscription_active}
                      onChange={(e) => setFormData({...formData, is_subscription_active: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Subscription Active</label>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                    placeholder="Add a tag..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(newTag)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {AVAILABLE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => addTag(tag)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
                <input
                  type="text"
                  value={formData.referral_code}
                  onChange={(e) => setFormData({...formData, referral_code: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Lead</h2>
              <button onClick={() => setShowEditForm(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Exam Category</label>
                  <select
                    value={formData.exam_category}
                    onChange={(e) => setFormData({...formData, exam_category: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select exam category</option>
                    {EXAM_CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">How did you hear about us?</label>
                  <select
                    value={formData.how_did_you_hear}
                    onChange={(e) => setFormData({...formData, how_did_you_hear: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select source</option>
                    {SOURCES.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({...formData, plan: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PLANS.map((plan) => (
                      <option key={plan} value={plan}>{plan}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trial & Subscription Details */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Trial & Subscription Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trial Start Date</label>
                    <input
                      type="date"
                      value={formData.trial_start_date}
                      onChange={(e) => handleTrialStartDateChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trial End Date (Auto-calculated)</label>
                    <input
                      type="date"
                      value={formData.trial_end_date}
                      onChange={(e) => setFormData({...formData, trial_end_date: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Automatically calculated as 15 days from trial start date</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                    <select
                      value={formData.subscription_plan}
                      onChange={(e) => handleSubscriptionPlanChange(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Plan</option>
                      <option value="Trial">Trial</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid</label>
                    <input
                      type="number"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({...formData, amount_paid: Number(e.target.value)})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_trial_active}
                      onChange={(e) => setFormData({...formData, is_trial_active: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Trial Active</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_subscription_active}
                      onChange={(e) => setFormData({...formData, is_subscription_active: e.target.checked})}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">Subscription Active</label>
                  </div>
                </div>
              </div>

              {/* Tags section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                    placeholder="Add a tag..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => addTag(newTag)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Referral Code</label>
                <input
                  type="text"
                  value={formData.referral_code}
                  onChange={(e) => setFormData({...formData, referral_code: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header with gradient background */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Lead Details
                  </h2>
                  <p className="text-sm text-gray-500">Complete information about this lead</p>
                </div>
              </div>
              <button 
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-teal-500 to-blue-600 flex items-center justify-center font-bold text-white text-2xl shadow-lg">
                        {getInitials(selectedLead.name)}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate">{selectedLead.name}</h3>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <p className="text-sm break-all">{selectedLead.email}</p>
                        <button 
                          onClick={() => navigator.clipboard.writeText(selectedLead.email || '')}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="Copy email"
                        >
                          <FileText className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs rounded-full font-medium shadow-sm">
                          {selectedLead.plan || 'Trial User'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Information */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Phone className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Contact Information</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">Phone:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">IP Address:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.ip_address || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">State:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.state || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">Gender:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.gender || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Middle Column - Lead Details */}
              <div className="space-y-6">
                {/* Lead Details */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Lead Details</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">Exam Category:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.exam_category || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Crown className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">Plan:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.plan || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Rocket className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">Source:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.how_did_you_hear || selectedLead.source || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">Status:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <div className="flex-1">
                        <span className="text-gray-500 font-medium">User Type:</span>
                        <span className="text-gray-600 ml-2">{selectedLead.user_type || 'Trial User'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedLead.tags && selectedLead.tags.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Tag className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full font-medium shadow-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Information */}
                {(selectedLead.referral_code || selectedLead.notes) && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <FileText className="w-4 h-4 text-yellow-600" />
                      </div>
                      <h4 className="font-semibold text-gray-800">Additional Information</h4>
                    </div>
                    <div className="space-y-3 text-sm">
                      {selectedLead.referral_code && (
                        <div className="flex items-center gap-3">
                          <Gift className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <span className="text-gray-500 font-medium">Referral Code:</span>
                            <span className="text-gray-600 ml-2">{selectedLead.referral_code}</span>
                          </div>
                        </div>
                      )}
                      {selectedLead.notes && (
                        <div className="flex items-start gap-3">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="flex-1 text-gray-600">
                            <p className="font-medium mb-1 text-gray-500">Notes:</p>
                            <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedLead.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Right Column - Trial & Subscription Details */}
              <div className="space-y-6">
                {/* Trial Status Card */}
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Timer className="w-4 h-4 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Trial Status</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Trial Status:</span>
                      <div className="flex items-center gap-2">
                        {getTrialStatus(selectedLead).isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={`font-medium ${
                          getTrialStatus(selectedLead).isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {getTrialStatus(selectedLead).text}
                        </span>
                      </div>
                    </div>
                    {selectedLead.trial_start_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Trial Starts:</span>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{new Date(selectedLead.trial_start_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    {selectedLead.trial_end_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Trial Ends:</span>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{new Date(selectedLead.trial_end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    {selectedLead.trial_end_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Days Left:</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className={`font-bold ${
                            (getTrialStatus(selectedLead).daysLeft || 0) < 0 ? 'text-red-600' : 
                            (getTrialStatus(selectedLead).daysLeft || 0) <= 3 ? 'text-orange-600' : 
                            (getTrialStatus(selectedLead).daysLeft || 0) <= 7 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {(getTrialStatus(selectedLead).daysLeft || 0) < 0 ? 
                              `${Math.abs(getTrialStatus(selectedLead).daysLeft || 0)} days overdue` : 
                              (getTrialStatus(selectedLead).daysLeft || 0) === 0 ? 'Expires today' :
                              (getTrialStatus(selectedLead).daysLeft || 0) === 1 ? '1 day left' :
                              `${getTrialStatus(selectedLead).daysLeft || 0} days left`
                            }
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Subscription Details */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-4 h-4 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Subscription Details</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Subscription Plan:</span>
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-gray-400" />
                        <span className={`font-medium ${
                          selectedLead.is_subscription_active ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {selectedLead.subscription_plan || 'Trial User'}
                        </span>
                      </div>
                    </div>
                    {selectedLead.subscription_end_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Subscription Ends:</span>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{new Date(selectedLead.subscription_end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    {selectedLead.next_payment_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Next Payment:</span>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{new Date(selectedLead.next_payment_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    )}
                    {selectedLead.amount_paid && selectedLead.amount_paid > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-medium">Amount Paid:</span>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-bold">₹{selectedLead.amount_paid}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Creation Info */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-600" />
                    </div>
                    <h4 className="font-semibold text-gray-800">Account Information</h4>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div className="flex-1">
                      <span className="text-gray-500 font-medium">Created:</span>
                      <span className="text-gray-600 ml-2">{new Date(selectedLead.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CSVImport 
        isOpen={showCSVImport} 
        onClose={() => setShowCSVImport(false)} 
      />
    </div>
  );
};

export default Leads;
