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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Clear local storage on sign out
        if (event === 'SIGNED_OUT') {
          localStorage.removeItem('isAuthenticated');
        } else if (event === 'SIGNED_IN') {
          localStorage.setItem('isAuthenticated', 'true');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session) {
        localStorage.setItem('isAuthenticated', 'true');
      }
    });

    return () => subscription.unsubscribe();
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
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Data loading
  const refreshData = async () => {
    if (!user) return;

    try {
      // Load leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (leadsData) setLeads(leadsData);

      // Load campaigns
      const { data: campaignsData } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (campaignsData) setCampaigns(campaignsData);

      // Load email lists
      const { data: emailListsData } = await supabase
        .from('email_lists')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (emailListsData) setEmailLists(emailListsData);

      // Load templates
      const { data: templatesData } = await supabase
        .from('email_templates')
        .select('*')
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