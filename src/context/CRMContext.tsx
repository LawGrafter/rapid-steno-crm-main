import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Lead, Campaign, EmailList, Template } from '../types';

interface CRMContextType {
  // User state
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  
  // Leads
  leads: Lead[];
  selectedLead: Lead | null;
  addLead: (lead: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  addLeadsBulk: (leads: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => Promise<{ data?: any; error?: any }>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  setSelectedLead: (lead: Lead | null) => void;
  
  // Campaigns
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateCampaign: (id: string, updates: Partial<Campaign>) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  setSelectedCampaign: (campaign: Campaign | null) => void;
  
  // Email Lists
  emailLists: EmailList[];
  selectedEmailList: EmailList | null;
  addEmailList: (list: Omit<EmailList, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateEmailList: (id: string, updates: Partial<EmailList>) => Promise<void>;
  deleteEmailList: (id: string) => Promise<void>;
  setSelectedEmailList: (list: EmailList | null) => void;
  
  // Templates
  templates: Template[];
  selectedTemplate: Template | null;
  addTemplate: (template: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  setSelectedTemplate: (template: Template | null) => void;
  
  // Data refresh
  refreshData: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | null>(null);

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedEmailList, setSelectedEmailList] = useState<EmailList | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const isAuthenticated = !!session?.user;

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      console.log('Initial session check:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state change:', event, !!session);
        
        // Update state and localStorage
        setSession(session);
        setUser(session?.user ?? null);
        
        // Sync with localStorage
        if (session?.user) {
          localStorage.setItem('isAuthenticated', 'true');
        } else {
          localStorage.removeItem('isAuthenticated');
        }
        
        // Don't set loading false on initial session since we handle that above
        if (event !== 'INITIAL_SESSION') {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      // Clear data when not authenticated
      setLeads([]);
      setCampaigns([]);
      setEmailLists([]);
      setTemplates([]);
    }
  }, [isAuthenticated]);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (!error) {
      localStorage.setItem('isAuthenticated', 'true');
    }
    
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName || '',
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Clear state immediately regardless of Supabase response
      setUser(null);
      setSession(null);
      setLeads([]);
      setCampaigns([]);
      setEmailLists([]);
      setTemplates([]);
      setSelectedLead(null);
      setSelectedCampaign(null);
      setSelectedEmailList(null);
      setSelectedTemplate(null);
      localStorage.removeItem('isAuthenticated');
      
      // Try to sign out from Supabase (but don't let it block the logout)
      await supabase.auth.signOut({ scope: 'local' });
      
      return { error: null };
    } catch (error) {
      console.warn('Supabase signout error (proceeding anyway):', error);
      return { error: null }; // Return success anyway since we cleared local state
    }
  };

  // Data loading
  const refreshData = async () => {
    if (!user) return;

    try {
      // Load leads - filter by current user's ID
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (leadsData) setLeads(leadsData);

      // Load campaigns - filter by current user's ID
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (campaignsData) setCampaigns(campaignsData);

      // Load email lists - filter by current user's ID
      const { data: emailListsData } = await supabase
        .from('email_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (emailListsData) setEmailLists(emailListsData);

      // Load templates - filter by current user's ID
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (templatesData) setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // Lead operations
  const addLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...leadData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding lead:', error);
      return;
    }

    if (data) {
      setLeads(prev => [data, ...prev]);
    }
  };

  const addLeadsBulk = async (leadsData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    if (!user) return { error: 'User not authenticated' };

    try {
      // For large datasets, use the Edge Function
      if (leadsData.length > 50) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bulk-import-leads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            leads: leadsData,
            userId: user.id
          })
        });

        const result = await response.json();
        
        if (result.success) {
          // Refresh data to get the new leads
          await refreshData();
          return { data: result, error: null };
        } else {
          return { error: result.error || 'Bulk import failed' };
        }
      } else {
        // For smaller datasets, use direct Supabase insert
        const { data, error } = await supabase
          .from('leads')
          .insert(leadsData.map(lead => ({ ...lead, user_id: user.id })))
          .select();

        if (error) {
          console.error('Error adding leads in bulk:', error);
          return { error };
        }

        if (data) {
          setLeads(prev => [...data, ...prev]);
          return { data, error: null };
        }

        return { error: 'No data returned' };
      }
    } catch (error) {
      console.error('Error in bulk import:', error);
      return { error };
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lead:', error);
      return;
    }

    if (data) {
      setLeads(prev => prev.map(lead => lead.id === id ? data : lead));
      if (selectedLead?.id === id) {
        setSelectedLead(data);
      }
    }
  };

  const deleteLead = async (id: string) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting lead:', error);
      return;
    }

    setLeads(prev => prev.filter(lead => lead.id !== id));
    if (selectedLead?.id === id) {
      setSelectedLead(null);
    }
  };

  // Campaign operations
  const addCampaign = async (campaignData: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('campaigns')
      .insert([{ ...campaignData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding campaign:', error);
      return;
    }

    if (data) {
      setCampaigns(prev => [data, ...prev]);
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const { data, error } = await supabase
      .from('campaigns')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating campaign:', error);
      return;
    }

    if (data) {
      setCampaigns(prev => prev.map(campaign => campaign.id === id ? data : campaign));
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(data);
      }
    }
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting campaign:', error);
      return;
    }

    setCampaigns(prev => prev.filter(campaign => campaign.id !== id));
    if (selectedCampaign?.id === id) {
      setSelectedCampaign(null);
    }
  };

  // Email List operations
  const addEmailList = async (listData: Omit<EmailList, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('email_lists')
      .insert([{ ...listData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding email list:', error);
      return;
    }

    if (data) {
      setEmailLists(prev => [data, ...prev]);
    }
  };

  const updateEmailList = async (id: string, updates: Partial<EmailList>) => {
    const { data, error } = await supabase
      .from('email_lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email list:', error);
      return;
    }

    if (data) {
      setEmailLists(prev => prev.map(list => list.id === id ? data : list));
      if (selectedEmailList?.id === id) {
        setSelectedEmailList(data);
      }
    }
  };

  const deleteEmailList = async (id: string) => {
    const { error } = await supabase
      .from('email_lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting email list:', error);
      return;
    }

    setEmailLists(prev => prev.filter(list => list.id !== id));
    if (selectedEmailList?.id === id) {
      setSelectedEmailList(null);
    }
  };

  // Template operations
  const addTemplate = async (templateData: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('email_templates')
      .insert([{ ...templateData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error('Error adding template:', error);
      return;
    }

    if (data) {
      setTemplates(prev => [data, ...prev]);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating template:', error);
      return;
    }

    if (data) {
      setTemplates(prev => prev.map(template => template.id === id ? data : template));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(data);
      }
    }
  };

  const deleteTemplate = async (id: string) => {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting template:', error);
      return;
    }

    setTemplates(prev => prev.filter(template => template.id !== id));
    if (selectedTemplate?.id === id) {
      setSelectedTemplate(null);
    }
  };

  const value: CRMContextType = {
    user,
    session,
    isAuthenticated,
    loading,
    signIn,
    signUp,
    signOut,
    leads,
    selectedLead,
    addLead,
    addLeadsBulk,
    updateLead,
    deleteLead,
    setSelectedLead,
    campaigns,
    selectedCampaign,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    setSelectedCampaign,
    emailLists,
    selectedEmailList,
    addEmailList,
    updateEmailList,
    deleteEmailList,
    setSelectedEmailList,
    templates,
    selectedTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setSelectedTemplate,
    refreshData
  };

  return (
    <CRMContext.Provider value={value}>
      {children}
    </CRMContext.Provider>
  );
};

export default CRMProvider;