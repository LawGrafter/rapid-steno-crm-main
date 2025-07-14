import { useState } from 'react';
import { Users, Plus, Calendar, Search, Eye, Edit, Trash2, X } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Lead } from '../types';

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
const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
const PLANS = ['No Plan', 'Basic', 'Advanced', 'Premium'];

const Leads = () => {
  const { leads, addLead, updateLead, deleteLead } = useCRM();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    state: '',
    gender: '',
    exam_category: '',
    how_did_you_hear: '',
    status: 'New',
    plan: 'No Plan',
    referral_code: '',
    notes: ''
  });

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    const leadData = {
      ...formData,
      name: `${formData.first_name} ${formData.last_name}`.trim(),
      company: formData.state,
      source: formData.how_did_you_hear,
      user_type: 'Trial User'
    };
    
    await addLead(leadData);
    resetForm();
    setShowAddForm(false);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'New').length;
  const qualifiedLeads = leads.filter(lead => lead.status === 'Qualified').length;
  const thisMonthLeads = leads.filter(lead => new Date(lead.created_at).getMonth() === new Date().getMonth()).length;

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'advanced': return 'bg-blue-100 text-blue-800';
      case 'premium': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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
      state: '',
      gender: '',
      exam_category: '',
      how_did_you_hear: '',
      status: 'New',
      plan: 'No Plan',
      referral_code: '',
      notes: ''
    });
  };

  const handleEdit = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      state: lead.state || '',
      gender: lead.gender || '',
      exam_category: lead.exam_category || '',
      how_did_you_hear: lead.how_did_you_hear || '',
      status: lead.status || 'New',
      plan: lead.plan || 'No Plan',
      referral_code: lead.referral_code || '',
      notes: lead.notes || ''
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
      user_type: 'Trial User'
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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Manage your leads and track their progress</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Lead</span>
        </button>
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
              <p className="text-sm text-gray-600">New Leads</p>
              <p className="text-2xl font-bold text-gray-900">{newLeads}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Qualified</p>
              <p className="text-2xl font-bold text-gray-900">{qualifiedLeads}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">{thisMonthLeads}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeads.map(lead => (
          <div key={lead.id} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            {/* Lead Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">{getInitials(lead.name)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                  <p className="text-sm text-gray-500">{lead.email}</p>
                </div>
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                trial
              </span>
            </div>

            {/* Lead Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Phone:</span>
                <span className="text-gray-900 font-medium">{lead.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">State:</span>
                <span className="text-gray-900 font-medium">{lead.state || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Exam Category:</span>
                <span className="text-gray-900 font-medium">{lead.exam_category || 'N/A'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Plan:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPlanColor(lead.plan || 'No Plan')}`}>
                  {lead.plan || 'No Plan'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">User Type:</span>
                <span className="text-orange-600 font-medium">{lead.user_type || 'Trial User'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Source:</span>
                <div className="flex items-center gap-1">
                  <span className="text-blue-600">🔍</span>
                  <span className="text-gray-900 font-medium">{lead.how_did_you_hear || lead.source || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">legal</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">court-reporting</span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {lead.notes || "Interested in shorthand for court proceedings. Currently on 7-day trial."}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => handleView(lead)}
                className="flex items-center space-x-1 text-teal-600 hover:text-teal-800 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </button>
              <button 
                onClick={() => handleEdit(lead)}
                className="flex items-center space-x-1 text-orange-600 hover:text-orange-800 text-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => handleDelete(lead.id)}
                className="flex items-center space-x-1 text-red-600 hover:text-red-800 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Created Date */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Created: {new Date(lead.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Lead Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add New Lead</h2>
              <button onClick={() => setShowAddForm(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Lead Details</h2>
              <button onClick={() => setShowViewModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center font-semibold text-white">
                  {getInitials(selectedLead.name)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedLead.name}</h3>
                  <p className="text-gray-500">{selectedLead.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Phone:</strong> {selectedLead.phone || 'N/A'}</div>
                <div><strong>State:</strong> {selectedLead.state || 'N/A'}</div>
                <div><strong>Gender:</strong> {selectedLead.gender || 'N/A'}</div>
                <div><strong>Exam Category:</strong> {selectedLead.exam_category || 'N/A'}</div>
                <div><strong>Plan:</strong> {selectedLead.plan || 'N/A'}</div>
                <div><strong>Source:</strong> {selectedLead.how_did_you_hear || selectedLead.source || 'N/A'}</div>
                <div><strong>Status:</strong> {selectedLead.status}</div>
                <div><strong>User Type:</strong> {selectedLead.user_type || 'Trial User'}</div>
              </div>
              {selectedLead.referral_code && (
                <div><strong>Referral Code:</strong> {selectedLead.referral_code}</div>
              )}
              {selectedLead.notes && (
                <div><strong>Notes:</strong> <p className="mt-1">{selectedLead.notes}</p></div>
              )}
              <div className="text-sm text-gray-500">
                Created: {new Date(selectedLead.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leads;