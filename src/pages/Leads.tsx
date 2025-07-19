import { useState, useMemo } from 'react';
import { Users, Plus, Search, Eye, Edit, Trash2, X, DollarSign, Upload, Calendar, Tag, User, Phone, Mail, MapPin, CreditCard, Clock, AlertCircle, CheckCircle, XCircle, Shield, GraduationCap, FileText, Star, Zap, TrendingUp, Activity, Award, Target, Briefcase, Globe, Smartphone, UserCheck, CalendarDays, Timer, Crown, Gift, Rocket } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { useLeadsData } from '../hooks/useLeadsData';
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
  const { addLead, updateLead, deleteLead, refreshData, user, isAuthenticated } = useCRM();
  
  // Use Supabase data for leads
  const { 
    leads, 
    loading, 
    error, 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter, 
    examFilter, 
    setExamFilter, 
    examCategories, 
    stats 
  } = useLeadsData();
  
  // Debug logging
  console.log('=== LEADS PAGE DEBUG ===');
  console.log('User authenticated:', isAuthenticated);
  console.log('Total leads from Supabase:', leads.length);
  console.log('First 3 leads:', leads.slice(0, 3));
  console.log('========================');

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

  // Calculate statistics from Supabase data
  const totalLeads = stats.total;
  const trialUsers = stats.trial;
  const paidUsers = stats.paid;
  const totalRevenue = paidUsers * 500; // Estimate ₹500 per paid user

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'basic monthly': return 'bg-green-100 text-green-800';
      case 'advanced quarterly': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'trial': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTrialStatus = (lead: any) => {
    if (!lead.trial_status) return { isActive: false, text: 'No Trial' };
    
    if (lead.trial_status === 'Active') {
      return { isActive: true, text: 'Active' };
    }
    
    return { isActive: false, text: 'Expired' };
  };

  const handleView = (lead: any) => {
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
      status: 'Active',
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

  const handleEdit = (lead: any) => {
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
      plan: lead.subscription_plan || 'Trial User',
      referral_code: lead.referral_code || '',
      notes: lead.notes || '',
      tags: lead.tags || [],
      trial_start_date: lead.trial_start_date || '',
      trial_end_date: lead.trial_end_date || '',
      subscription_plan: lead.subscription_plan || '',
      subscription_start_date: lead.subscription_start_date || '',
      subscription_end_date: lead.subscription_end_date || '',
      amount_paid: lead.amount_paid || 0,
      next_payment_date: lead.next_payment_date || '',
      is_trial_active: lead.is_trial_active || false,
      is_subscription_active: lead.is_subscription_active || false
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
      user_type: formData.is_subscription_active ? 'Paid User' : 'Trial User'
    };
    
    await updateLead(selectedLead.id, updatedData);
    setShowEditForm(false);
    setSelectedLead(null);
    resetForm();
  };

  const handleDelete = async (leadId: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await deleteLead(leadId);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setExamFilter('all');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading leads data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 mt-1">Manage your leads and track their progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCSVImport(true)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{totalLeads}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trial Users</p>
              <p className="text-3xl font-bold text-blue-600">{trialUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Users</p>
              <p className="text-3xl font-bold text-green-600">{paidUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-purple-600">₹{totalRevenue}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Filters ({leads.length} of {totalLeads} leads)
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                Show Advanced Filters
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

        <div className="p-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, phone, first name, or last name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Basic Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="trial">Trial Users</option>
              <option value="paid">Paid Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Exam Categories</option>
              {examCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leads.map((lead) => {
          // Calculate trial dates and days left
          const getTrialInfo = () => {
            if (!lead.created_at) return null;
            
            const createdDate = new Date(lead.created_at);
            const trialStartDate = createdDate;
            const trialEndDate = new Date(createdDate.getTime() + (15 * 24 * 60 * 60 * 1000)); // 15 days from created date
            const today = new Date();
            const diffTime = trialEndDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
              startDate: trialStartDate,
              endDate: trialEndDate,
              daysLeft: diffDays,
              isExpired: diffDays < 0
            };
          };

          const trialInfo = getTrialInfo();
          const isTrialUser = lead.subscription_plan === 'Trial' || lead.trial_status === 'Active';

          return (
            <div key={lead.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-96 flex flex-col">
              {/* Lead Info */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-lg">
                    {getInitials(`${lead.first_name || ''} ${lead.last_name || ''}`)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {lead.first_name} {lead.last_name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lead.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {lead.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                  <p className="text-xs text-gray-500">{lead.exam_category}</p>
                </div>
              </div>

              {/* Plan & Status */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Plan</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(lead.subscription_plan || 'Trial User')}`}>
                    {lead.subscription_plan || 'Trial User'}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-semibold text-gray-900">{lead.phone || 'N/A'}</p>
                </div>
              </div>

              {/* Trial Information */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-4">
                  {/* Always show subscription end info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Subscription End:</span>
                        <span className="text-gray-900">
                          {isTrialUser && trialInfo 
                            ? trialInfo.endDate.toLocaleDateString()
                            : lead.current_subscription_end 
                              ? new Date(lead.current_subscription_end).toLocaleDateString()
                              : 'No end date set'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Days Left:</span>
                        <span className={`font-medium ${
                          isTrialUser && trialInfo 
                            ? (trialInfo.isExpired ? 'text-red-600' : 
                               trialInfo.daysLeft <= 3 ? 'text-yellow-600' : 'text-green-600')
                            : lead.current_subscription_end
                              ? (() => {
                                  const endDate = new Date(lead.current_subscription_end);
                                  const today = new Date();
                                  const diffTime = endDate.getTime() - today.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  return diffDays < 0 ? 'text-red-600' : 
                                         diffDays <= 3 ? 'text-yellow-600' : 'text-green-600';
                                })()
                              : 'text-gray-500'
                        }`}>
                          {isTrialUser && trialInfo 
                            ? (trialInfo.isExpired ? `${Math.abs(trialInfo.daysLeft)} days expired` : 
                               `${trialInfo.daysLeft} days left`)
                            : lead.current_subscription_end
                              ? (() => {
                                  const endDate = new Date(lead.current_subscription_end);
                                  const today = new Date();
                                  const diffTime = endDate.getTime() - today.getTime();
                                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                  return diffDays < 0 ? `${Math.abs(diffDays)} days expired` : 
                                         `${diffDays} days left`;
                                })()
                              : 'N/A'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Always show subscription start and trial status */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex justify-between">
                        <span className="font-medium">Subscription Start:</span>
                        <span className="text-gray-900">
                          {isTrialUser && trialInfo 
                            ? trialInfo.startDate.toLocaleDateString()
                            : lead.current_subscription_start 
                              ? new Date(lead.current_subscription_start).toLocaleDateString()
                              : 'No start date set'
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Trial Status:</span>
                        <span className={`font-medium ${
                          isTrialUser && trialInfo && !trialInfo.isExpired ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {isTrialUser && trialInfo 
                            ? (trialInfo.isExpired ? 'Expired' : 'Active')
                            : (lead.trial_status || 'Inactive')
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center space-x-2 mt-auto pt-8 pb-2">
                  <button
                    onClick={() => handleView(lead)}
                    className="flex-1 flex items-center justify-center space-x-1 px-2 py-2 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEdit(lead)}
                    className="flex-1 flex items-center justify-center space-x-1 px-2 py-2 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200 transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-2 py-2 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSV Import Modal */}
      <CSVImport
        isOpen={showCSVImport}
        onClose={() => setShowCSVImport(false)}
      />
    </div>
  );
};

export default Leads;
