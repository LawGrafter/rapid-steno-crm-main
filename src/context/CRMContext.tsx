import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Lead, Campaign, Domain, Analytics } from '../types';

interface CRMState {
  leads: Lead[];
  campaigns: Campaign[];
  domains: Domain[];
  analytics: Analytics;
  selectedLead: Lead | null;
  selectedCampaign: Campaign | null;
}

interface CRMAction {
  type: string;
  payload?: any;
}

const initialState: CRMState = {
  leads: [
    {
      id: '1',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@lawfirm.in',
      phone: '+1234567890',
      gender: 'male',
      state: 'Maharashtra',
      hearAboutUs: 'google',
      examCategory: 'court-exams',
      referralCode: 'REF123',
      status: 'trial',
      plan: 'basic',
      userType: 'trial',
      createdAt: new Date('2024-01-15'),
      tags: ['legal', 'court-reporting'],
      notes: 'Interested in shorthand for court proceedings. Currently on 7-day trial.',
      trialStartDate: new Date('2024-01-20'),
      trialEndDate: new Date('2024-01-27'),
      lastActivity: new Date('2024-01-24'),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    },
    {
      id: '2',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@newstoday.com',
      phone: '+1987654321',
      gender: 'female',
      state: 'Delhi',
      hearAboutUs: 'friend',
      examCategory: 'ssc-other-exams',
      status: 'converted',
      plan: 'advanced',
      userType: 'paid',
      createdAt: new Date('2024-01-20'),
      tags: ['journalism', 'media', 'advanced-user'],
      notes: 'Converted to Advanced plan. Uses shorthand for live reporting and interviews.',
      lastActivity: new Date('2024-01-25'),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    },
    {
      id: '3',
      firstName: 'Amit',
      lastName: 'Patel',
      email: 'amit.patel@freelance.com',
      phone: '+1555123456',
      gender: 'male',
      state: 'Gujarat',
      hearAboutUs: 'youtube',
      examCategory: 'ssc-other-exams',
      status: 'new',
      plan: 'none',
      userType: 'unpaid',
      createdAt: new Date('2024-01-22'),
      tags: ['freelancer', 'stenography', 'potential-basic'],
      notes: 'Freelance stenographer looking to improve speed. Considering Basic plan.',
      lastActivity: new Date('2024-01-23'),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    },
    {
      id: '4',
      firstName: 'Sunita',
      lastName: 'Verma',
      email: 'sunita.verma@university.edu',
      phone: '+1444987654',
      gender: 'female',
      state: 'Delhi',
      hearAboutUs: 'banner',
      examCategory: 'ssc-other-exams',
      status: 'new',
      plan: 'none',
      userType: 'unpaid',
      createdAt: new Date('2024-01-18'),
      tags: ['education', 'bulk-license', 'institutional'],
      notes: 'Professor interested in teaching shorthand to journalism students. Needs bulk licensing.',
      lastActivity: new Date('2024-01-19'),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    },
    {
      id: '5',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.singh@corporatelaw.in',
      phone: '+1333456789',
      gender: 'male',
      state: 'Rajasthan',
      hearAboutUs: 'facebook',
      examCategory: 'court-exams',
      status: 'new',
      plan: 'none',
      userType: 'unpaid',
      createdAt: new Date('2024-01-12'),
      tags: ['legal', 'unresponsive'],
      notes: 'Showed initial interest but hasn\'t responded to follow-ups. Trial expired unused.',
      trialStartDate: new Date('2024-01-13'),
      trialEndDate: new Date('2024-01-20'),
      lastActivity: new Date('2024-01-13'),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    },
    {
      id: '6',
      firstName: 'Meera',
      lastName: 'Joshi',
      email: 'meera.joshi@secretary.com',
      phone: '+1222345678',
      gender: 'female',
      state: 'Karnataka',
      hearAboutUs: 'instagram',
      examCategory: 'ssc-other-exams',
      status: 'new',
      plan: 'none',
      userType: 'unpaid',
      createdAt: new Date('2024-01-25'),
      tags: ['secretary', 'business', 'new-lead'],
      notes: 'Executive secretary looking to improve note-taking speed for meetings.',
      lastActivity: new Date('2024-01-25'),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    },
    {
      id: '7',
      firstName: 'Arjun',
      lastName: 'Reddy',
      email: 'arjun.reddy@student.ac.in',
      phone: '+1111234567',
      gender: 'male',
      state: 'Telangana',
      hearAboutUs: 'whatsapp',
      examCategory: 'ssc-other-exams',
      status: 'trial',
      plan: 'none',
      userType: 'trial',
      createdAt: new Date('2024-01-28'),
      tags: ['student', 'journalism', 'social-media'],
      notes: 'Journalism student preparing for competitive exams. Started Basic plan trial.',
      trialStartDate: new Date('2024-01-28'),
      trialEndDate: new Date('2024-02-04'),
      lastActivity: new Date('2024-01-29'),
      get name() { return `${this.firstName} ${this.lastName}`; },
      get source() { return this.hearAboutUs; }
    }
  ],
  campaigns: [
    {
      id: '1',
      name: 'Welcome Series',
      type: 'automated',
      status: 'active',
      subject: 'Welcome to Rapid Steno',
      recipients: 1250,
      opens: 892,
      clicks: 234,
      createdAt: new Date('2024-01-10'),
      scheduledAt: new Date('2024-01-15'),
      template: 'welcome-template'
    },
    {
      id: '2',
      name: 'Product Launch',
      type: 'broadcast',
      status: 'scheduled',
      subject: 'New Features Available Now!',
      recipients: 2500,
      opens: 0,
      clicks: 0,
      createdAt: new Date('2024-01-25'),
      scheduledAt: new Date('2024-01-30'),
      template: 'product-launch-template'
    }
  ],
  domains: [
    {
      id: '1',
      domain: 'rapidsteno.com',
      status: 'verified',
      dkimStatus: 'valid',
      spfStatus: 'valid',
      dmarcStatus: 'valid',
      reputation: 98,
      createdAt: new Date('2024-01-01')
    }
  ],
  analytics: {
    totalLeads: 1547,
    totalCampaigns: 23,
    totalSent: 45230,
    avgOpenRate: 24.5,
    avgClickRate: 3.8,
    revenue: 125000,
    recentActivity: [
      {
        id: '1',
        type: 'lead_created',
        description: 'New lead: John Doe',
        timestamp: new Date('2024-01-25T10:30:00')
      },
      {
        id: '2',
        type: 'campaign_sent',
        description: 'Welcome Series sent to 150 recipients',
        timestamp: new Date('2024-01-25T09:15:00')
      }
    ]
  },
  selectedLead: null,
  selectedCampaign: null
};

const crmReducer = (state: CRMState, action: CRMAction): CRMState => {
  switch (action.type) {
    case 'SET_SELECTED_LEAD':
      return { ...state, selectedLead: action.payload };
    case 'SET_SELECTED_CAMPAIGN':
      return { ...state, selectedCampaign: action.payload };
    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.payload] };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead =>
          lead.id === action.payload.id ? action.payload : lead
        )
      };
    case 'DELETE_LEAD':
      return {
        ...state,
        leads: state.leads.filter(lead => lead.id !== action.payload)
      };
    case 'ADD_CAMPAIGN':
      return { ...state, campaigns: [...state.campaigns, action.payload] };
    case 'UPDATE_CAMPAIGN':
      return {
        ...state,
        campaigns: state.campaigns.map(campaign =>
          campaign.id === action.payload.id ? action.payload : campaign
        )
      };
    default:
      return state;
  }
};

const CRMContext = createContext<{
  state: CRMState;
  dispatch: React.Dispatch<CRMAction>;
} | null>(null);

export const CRMProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(crmReducer, initialState);

  return (
    <CRMContext.Provider value={{ state, dispatch }}>
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};