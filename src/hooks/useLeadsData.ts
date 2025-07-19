import { useState, useEffect } from 'react';
import { useSupabaseData } from './useSupabaseData';

export interface Lead {
  id: string;
  mongo_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  subscription_plan: string;
  exam_category: string;
  is_active: boolean;
  last_active_date: string;
  login_count: number;
  created_at: string;
  current_subscription_type: string;
  current_subscription_start: string;
  current_subscription_end: string;
  trial_status: string;
  total_activities: number;
  total_time_spent: number;
}

export const useLeadsData = () => {
  const { users, loading, error } = useSupabaseData();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [examFilter, setExamFilter] = useState('all');

  useEffect(() => {
    if (users && users.length > 0) {
      // Convert users to leads format
      const leadsData: Lead[] = users.map(user => ({
        id: user.id,
        mongo_id: user.mongo_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        subscription_plan: user.subscription_plan,
        exam_category: user.exam_category,
        is_active: user.is_active,
        last_active_date: user.last_active_date,
        login_count: user.login_count,
        created_at: user.created_at,
        current_subscription_type: user.current_subscription_type,
        current_subscription_start: user.current_subscription_start,
        current_subscription_end: user.current_subscription_end,
        trial_status: user.trial_status,
        total_activities: user.total_activities,
        total_time_spent: user.total_time_spent
      }));
      
      setLeads(leadsData);
      setFilteredLeads(leadsData);
    }
  }, [users]);

  // Apply filters and search
  useEffect(() => {
    let filtered = leads;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(lead => 
        lead.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone?.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => {
        switch (statusFilter) {
          case 'trial':
            return lead.subscription_plan === 'Trial' || lead.trial_status === 'Active';
          case 'paid':
            return lead.subscription_plan === 'Paid' || lead.current_subscription_type === 'Paid';
          case 'active':
            return lead.is_active;
          case 'inactive':
            return !lead.is_active;
          default:
            return true;
        }
      });
    }

    // Apply exam category filter
    if (examFilter !== 'all') {
      filtered = filtered.filter(lead => lead.exam_category === examFilter);
    }

    setFilteredLeads(filtered);
  }, [leads, searchTerm, statusFilter, examFilter]);

  // Get unique exam categories for filter dropdown
  const examCategories = Array.from(new Set(leads.map(lead => lead.exam_category).filter(Boolean)));

  // Get stats
  const stats = {
    total: leads.length,
    trial: leads.filter(lead => lead.subscription_plan === 'Trial' || lead.trial_status === 'Active').length,
    paid: leads.filter(lead => lead.subscription_plan === 'Paid' || lead.current_subscription_type === 'Paid').length,
    active: leads.filter(lead => lead.is_active).length
  };

  return {
    leads: filteredLeads,
    allLeads: leads,
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
  };
}; 