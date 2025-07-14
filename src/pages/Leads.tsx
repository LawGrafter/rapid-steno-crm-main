import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, Clock, DollarSign, TrendingUp, Eye, Edit, Trash2, X } from 'lucide-react';
import { Lead } from '../types';
import { supabase } from '../integrations/supabase/client';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu'
];

const PLANS = [
  { id: 'basic_monthly', name: 'Basic Monthly', price: 197, duration: 30 },
  { id: 'advanced_quarterly', name: 'Advanced Quarterly', price: 497, duration: 90 }
];

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'converted', 'lost'];
const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
const EXAM_CATEGORIES = ['CLAT', 'AILET', 'LSAT', 'Court Exams', 'SSC & other exams', 'Other'];
const HOW_DID_YOU_HEAR = ['Google', 'Facebook', 'Instagram', 'Telegram', 'YouTube', 'WhatsApp', 'Friend', 'Referral', 'Other'];
const SOURCES = ['Website', 'Social Media', 'Advertisement', 'Referral'];

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState('all');
  const [tagInput, setTagInput] = useState('');
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    state: '',
    gender: '',
    exam_category: '',
    how_did_you_hear: '',
    plan: '',
    referral_code: '',
    user_type: 'Trial User',
    source: '',
    status: 'new',
    notes: '',
    value: 0,
    subscription_plan: 'Trial User',
    amount_paid: 0,
    is_trial_active: true,
    is_subscription_active: false,
    tags: []
  });
  const [analytics, setAnalytics] = useState({
    totalLeads: 0,
    activeTrials: 0,
    expiringSoon: 0,
    activeSubscriptions: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, subscriptionFilter]);

  useEffect(() => {
    calculateAnalytics();
  }, [leads]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (subscriptionFilter !== 'all') {
      if (subscriptionFilter === 'trial') {
        filtered = filtered.filter(lead => lead.is_trial_active);
      } else if (subscriptionFilter === 'subscription') {
        filtered = filtered.filter(lead => lead.is_subscription_active);
      } else if (subscriptionFilter === 'expired') {
        filtered = filtered.filter(lead => !lead.is_trial_active && !lead.is_subscription_active);
      }
    }

    setFilteredLeads(filtered);
  };

  const calculateAnalytics = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeTrials = leads.filter(lead => lead.is_trial_active).length;
    const expiringSoon = leads.filter(lead => {
      if (!lead.trial_end_date && !lead.subscription_end_date) return false;
      const endDate = new Date(lead.trial_end_date || lead.subscription_end_date || '');
      return endDate <= sevenDaysFromNow && endDate > now;
    }).length;
    const activeSubscriptions = leads.filter(lead => lead.is_subscription_active).length;
    const totalRevenue = leads.reduce((sum, lead) => sum + (lead.amount_paid || 0), 0);

    setAnalytics({
      totalLeads: leads.length,
      activeTrials,
      expiringSoon,
      activeSubscriptions,
      totalRevenue
    });
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const leadData = {
        ...newLead,
        name: newLead.name || 'Untitled Lead',
        user_id: user.id,
        trial_start_date: new Date().toISOString(),
        trial_end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
      };

      const { error } = await supabase.from('leads').insert(leadData);
      if (error) throw error;

      setShowAddForm(false);
      resetForm();
      fetchLeads();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleEditLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      const { error } = await supabase
        .from('leads')
        .update(selectedLead)
        .eq('id', selectedLead.id);

      if (error) throw error;

      setShowEditForm(false);
      setSelectedLead(null);
      fetchLeads();
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      fetchLeads();
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const resetForm = () => {
    setNewLead({
      name: '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      state: '',
      gender: '',
      exam_category: '',
      how_did_you_hear: '',
      plan: '',
      referral_code: '',
      user_type: 'Trial User',
      source: '',
      status: 'new',
      notes: '',
      value: 0,
      subscription_plan: 'Trial User',
      amount_paid: 0,
      is_trial_active: true,
      is_subscription_active: false,
      tags: []
    });
    setTagInput('');
  };

  const getDaysLeft = (endDate: string | null) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, data: Partial<Lead>, setData: (data: Partial<Lead>) => void) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTags = [...(data.tags || []), tagInput.trim()];
      setData({ ...data, tags: newTags });
      setTagInput('');
    }
  };

  const removeTag = (indexToRemove: number, data: Partial<Lead>, setData: (data: Partial<Lead>) => void) => {
    const newTags = data.tags?.filter((_, index) => index !== indexToRemove) || [];
    setData({ ...data, tags: newTags });
  };

  const FormFields = ({ data, setData }: { data: Partial<Lead>, setData: (data: Partial<Lead>) => void }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Full Name *"
        value={data.name || ''}
        onChange={(e) => setData({ ...data, name: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
        required
      />
      <input
        type="text"
        placeholder="First Name"
        value={data.first_name || ''}
        onChange={(e) => setData({ ...data, first_name: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      />
      <input
        type="text"
        placeholder="Last Name"
        value={data.last_name || ''}
        onChange={(e) => setData({ ...data, last_name: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      />
      <input
        type="email"
        placeholder="Email"
        value={data.email || ''}
        onChange={(e) => setData({ ...data, email: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      />
      <input
        type="tel"
        placeholder="Phone"
        value={data.phone || ''}
        onChange={(e) => setData({ ...data, phone: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      />
      <input
        type="text"
        placeholder="Company"
        value={data.company || ''}
        onChange={(e) => setData({ ...data, company: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      />
      <select
        value={data.state || ''}
        onChange={(e) => setData({ ...data, state: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      >
        <option value="">Select State</option>
        {INDIAN_STATES.map(state => (
          <option key={state} value={state}>{state}</option>
        ))}
      </select>
      <select
        value={data.gender || ''}
        onChange={(e) => setData({ ...data, gender: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      >
        <option value="">Select Gender</option>
        {GENDER_OPTIONS.map(gender => (
          <option key={gender} value={gender}>{gender}</option>
        ))}
      </select>
      <select
        value={data.exam_category || ''}
        onChange={(e) => setData({ ...data, exam_category: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      >
        <option value="">Select Exam Category</option>
        {EXAM_CATEGORIES.map(category => (
          <option key={category} value={category}>{category}</option>
        ))}
      </select>
      <select
        value={data.how_did_you_hear || ''}
        onChange={(e) => setData({ ...data, how_did_you_hear: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      >
        <option value="">How did you hear about us?</option>
        {HOW_DID_YOU_HEAR.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
      <select
        value={data.source || ''}
        onChange={(e) => setData({ ...data, source: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      >
        <option value="">Select Source</option>
        {SOURCES.map(source => (
          <option key={source} value={source}>{source}</option>
        ))}
      </select>
      <select
        value={data.status || 'new'}
        onChange={(e) => setData({ ...data, status: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      >
        {STATUS_OPTIONS.map(status => (
          <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Referral Code"
        value={data.referral_code || ''}
        onChange={(e) => setData({ ...data, referral_code: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      />
      <input
        type="number"
        placeholder="Lead Value"
        value={data.value || ''}
        onChange={(e) => setData({ ...data, value: Number(e.target.value) })}
        className="p-2 border border-border rounded-md bg-background"
      />
      <select
        value={data.subscription_plan || 'Trial User'}
        onChange={(e) => setData({ ...data, subscription_plan: e.target.value })}
        className="p-2 border border-border rounded-md bg-background"
      >
        <option value="Trial User">Trial User</option>
        {PLANS.map(plan => (
          <option key={plan.id} value={plan.name}>{plan.name} - ₹{plan.price}</option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Amount Paid"
        value={data.amount_paid || ''}
        onChange={(e) => setData({ ...data, amount_paid: Number(e.target.value) })}
        className="p-2 border border-border rounded-md bg-background"
      />
      
      {/* Tags Input */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2">Tags</label>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Add a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => handleTagInputKeyDown(e, data, setData)}
            className="w-full p-2 border border-border rounded-md bg-background"
          />
          <div className="flex flex-wrap gap-2">
            {data.tags?.map((tag, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index, data, setData)}
                  className="text-primary hover:text-primary/80"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <textarea
        placeholder="Notes"
        value={data.notes || ''}
        onChange={(e) => setData({ ...data, notes: e.target.value })}
        className="p-2 border border-border rounded-md bg-background md:col-span-2"
        rows={3}
      />
    </div>
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-foreground">{analytics.totalLeads}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Trials</p>
              <p className="text-2xl font-bold text-foreground">{analytics.activeTrials}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
              <p className="text-2xl font-bold text-foreground">{analytics.expiringSoon}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              <p className="text-2xl font-bold text-foreground">{analytics.activeSubscriptions}</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">₹{analytics.totalRevenue}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-foreground">Leads</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-border rounded-md w-full bg-background"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="all">All Status</option>
          {STATUS_OPTIONS.map(status => (
            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
          ))}
        </select>
        <select
          value={subscriptionFilter}
          onChange={(e) => setSubscriptionFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md bg-background"
        >
          <option value="all">All Types</option>
          <option value="trial">Trial Users</option>
          <option value="subscription">Subscribed Users</option>
          <option value="expired">Expired Users</option>
        </select>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLeads.map((lead) => {
          const trialDaysLeft = getDaysLeft(lead.trial_end_date || null);
          const subscriptionDaysLeft = getDaysLeft(lead.subscription_end_date || null);
          
          return (
            <div key={lead.id} className="bg-card p-4 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{lead.name}</h3>
                  <p className="text-sm text-muted-foreground">{lead.email}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                  lead.status === 'qualified' ? 'bg-blue-100 text-blue-800' :
                  lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {lead.status}
                </span>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subscription:</span>
                  <span className="text-foreground">{lead.subscription_plan}</span>
                </div>
                {lead.is_trial_active && trialDaysLeft !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trial ends in:</span>
                    <span className={`font-medium ${trialDaysLeft <= 3 ? 'text-red-600' : 'text-foreground'}`}>
                      {trialDaysLeft} days
                    </span>
                  </div>
                )}
                {lead.is_subscription_active && subscriptionDaysLeft !== null && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subscription ends in:</span>
                    <span className={`font-medium ${subscriptionDaysLeft <= 7 ? 'text-orange-600' : 'text-foreground'}`}>
                      {subscriptionDaysLeft} days
                    </span>
                  </div>
                )}
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {lead.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => { setSelectedLead(lead); setShowViewModal(true); }}
                    className="text-primary hover:text-primary/80"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { setSelectedLead(lead); setShowEditForm(true); }}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLead(lead.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-muted-foreground">
                  ₹{lead.amount_paid || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Lead Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Add New Lead</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleAddLead} className="space-y-4">
              <FormFields data={newLead} setData={setNewLead} />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Lead Modal */}
      {showEditForm && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Edit Lead</h2>
              <button
                onClick={() => setShowEditForm(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleEditLead} className="space-y-4">
              <FormFields data={selectedLead} setData={(data) => setSelectedLead(data as Lead)} />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="px-4 py-2 border border-border rounded-md text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Update Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {showViewModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-foreground">Lead Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Name:</strong> {selectedLead.name}</div>
              <div><strong>First Name:</strong> {selectedLead.first_name}</div>
              <div><strong>Last Name:</strong> {selectedLead.last_name}</div>
              <div><strong>Email:</strong> {selectedLead.email}</div>
              <div><strong>Phone:</strong> {selectedLead.phone}</div>
              <div><strong>Company:</strong> {selectedLead.company}</div>
              <div><strong>State:</strong> {selectedLead.state}</div>
              <div><strong>Gender:</strong> {selectedLead.gender}</div>
              <div><strong>Exam Category:</strong> {selectedLead.exam_category}</div>
              <div><strong>How did you hear:</strong> {selectedLead.how_did_you_hear}</div>
              <div><strong>Source:</strong> {selectedLead.source}</div>
              <div><strong>Status:</strong> {selectedLead.status}</div>
              <div><strong>Referral Code:</strong> {selectedLead.referral_code}</div>
              <div><strong>Lead Value:</strong> ₹{selectedLead.value}</div>
              <div><strong>Subscription Plan:</strong> {selectedLead.subscription_plan}</div>
              <div><strong>Amount Paid:</strong> ₹{selectedLead.amount_paid}</div>
              <div><strong>Trial Active:</strong> {selectedLead.is_trial_active ? 'Yes' : 'No'}</div>
              <div><strong>Subscription Active:</strong> {selectedLead.is_subscription_active ? 'Yes' : 'No'}</div>
              {selectedLead.trial_end_date && (
                <div><strong>Trial Ends:</strong> {new Date(selectedLead.trial_end_date).toLocaleDateString()}</div>
              )}
              {selectedLead.subscription_end_date && (
                <div><strong>Subscription Ends:</strong> {new Date(selectedLead.subscription_end_date).toLocaleDateString()}</div>
              )}
              {selectedLead.tags && selectedLead.tags.length > 0 && (
                <div className="md:col-span-2">
                  <strong>Tags:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedLead.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedLead.notes && (
                <div className="md:col-span-2">
                  <strong>Notes:</strong> {selectedLead.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}