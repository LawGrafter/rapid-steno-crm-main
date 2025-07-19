import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Lead, Campaign, EmailList, Template } from '../types';

// Simple user type for local auth
interface LocalUser {
  id: string;
  email: string;
  fullName: string;
}

interface CRMContextType {
  // User state
  user: LocalUser | null;
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
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [emailLists, setEmailLists] = useState<EmailList[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedEmailList, setSelectedEmailList] = useState<EmailList | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const isAuthenticated = !!user;

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('crm_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('crm_user');
      }
    }
    setLoading(false);
  }, []);

  // Load initial data
  useEffect(() => {
    refreshData();
  }, []);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    // Simple local authentication
    if (email === 'info@rapidsteno.com' && password === 'Aquib@7754') {
      const user = {
        id: '1',
        email: email,
        fullName: 'Admin User'
      };
      setUser(user);
      localStorage.setItem('crm_user', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
      return { error: null };
    }
    return { error: { message: 'Invalid credentials' } };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    // Simple local registration
    const user = {
      id: Date.now().toString(),
      email: email,
      fullName: fullName || email
    };
    setUser(user);
    localStorage.setItem('crm_user', JSON.stringify(user));
    localStorage.setItem('isAuthenticated', 'true');
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setLeads([]);
    setCampaigns([]);
    setEmailLists([]);
    setTemplates([]);
    setSelectedLead(null);
    setSelectedCampaign(null);
    setSelectedEmailList(null);
    setSelectedTemplate(null);
    localStorage.removeItem('crm_user');
    localStorage.removeItem('isAuthenticated');
    return { error: null };
  };

  // Data loading
  const refreshData = async () => {
    // Load data from localStorage
    try {
      const savedLeads = localStorage.getItem('crm_leads');
      const savedCampaigns = localStorage.getItem('crm_campaigns');
      const savedEmailLists = localStorage.getItem('crm_email_lists');
      const savedTemplates = localStorage.getItem('crm_templates');

      if (savedLeads) setLeads(JSON.parse(savedLeads));
      if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
      if (savedEmailLists) setEmailLists(JSON.parse(savedEmailLists));
      if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  };

  // Lead methods
  const addLead = async (leadData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Date.now().toString(),
      user_id: user?.id || '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedLeads = [...leads, newLead];
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
  };

  const addLeadsBulk = async (leadsData: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]) => {
    const newLeads: Lead[] = leadsData.map(lead => ({
      ...lead,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      user_id: user?.id || '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const updatedLeads = [...leads, ...newLeads];
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
    return { data: newLeads, error: null };
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    const updatedLeads = leads.map(lead => 
      lead.id === id 
        ? { ...lead, ...updates, updated_at: new Date().toISOString() }
        : lead
    );
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
  };

  const deleteLead = async (id: string) => {
    const updatedLeads = leads.filter(lead => lead.id !== id);
    setLeads(updatedLeads);
    localStorage.setItem('crm_leads', JSON.stringify(updatedLeads));
  };

  // Campaign methods
  const addCampaign = async (campaignData: Omit<Campaign, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      user_id: user?.id || '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedCampaigns = [...campaigns, newCampaign];
    setCampaigns(updatedCampaigns);
    localStorage.setItem('crm_campaigns', JSON.stringify(updatedCampaigns));
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    const updatedCampaigns = campaigns.map(campaign => 
      campaign.id === id 
        ? { ...campaign, ...updates, updated_at: new Date().toISOString() }
        : campaign
    );
    setCampaigns(updatedCampaigns);
    localStorage.setItem('crm_campaigns', JSON.stringify(updatedCampaigns));
  };

  const deleteCampaign = async (id: string) => {
    const updatedCampaigns = campaigns.filter(campaign => campaign.id !== id);
    setCampaigns(updatedCampaigns);
    localStorage.setItem('crm_campaigns', JSON.stringify(updatedCampaigns));
  };

  // Email List methods
  const addEmailList = async (listData: Omit<EmailList, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newList: EmailList = {
      ...listData,
      id: Date.now().toString(),
      user_id: user?.id || '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedLists = [...emailLists, newList];
    setEmailLists(updatedLists);
    localStorage.setItem('crm_email_lists', JSON.stringify(updatedLists));
  };

  const updateEmailList = async (id: string, updates: Partial<EmailList>) => {
    const updatedLists = emailLists.map(list => 
      list.id === id 
        ? { ...list, ...updates, updated_at: new Date().toISOString() }
        : list
    );
    setEmailLists(updatedLists);
    localStorage.setItem('crm_email_lists', JSON.stringify(updatedLists));
  };

  const deleteEmailList = async (id: string) => {
    const updatedLists = emailLists.filter(list => list.id !== id);
    setEmailLists(updatedLists);
    localStorage.setItem('crm_email_lists', JSON.stringify(updatedLists));
  };

  // Template methods
  const addTemplate = async (templateData: Omit<Template, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newTemplate: Template = {
      ...templateData,
      id: Date.now().toString(),
      user_id: user?.id || '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem('crm_templates', JSON.stringify(updatedTemplates));
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    const updatedTemplates = templates.map(template => 
      template.id === id 
        ? { ...template, ...updates, updated_at: new Date().toISOString() }
        : template
    );
    setTemplates(updatedTemplates);
    localStorage.setItem('crm_templates', JSON.stringify(updatedTemplates));
  };

  const deleteTemplate = async (id: string) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    setTemplates(updatedTemplates);
    localStorage.setItem('crm_templates', JSON.stringify(updatedTemplates));
  };

  const value: CRMContextType = {
    user,
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