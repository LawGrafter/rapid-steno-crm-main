import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  Calendar,
  Plus,
  Eye,
  Clock,
  Activity
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    leads, 
    campaigns, 
    emailLists, 
    templates, 
    refreshData,
    user 
  } = useCRM();

  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    totalCampaigns: 0,
    totalTemplates: 0
  });

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    // Calculate stats
    const totalLeads = leads.length;
    const activeLeads = leads.filter(lead => lead.status === 'Active').length;
    const totalCampaigns = campaigns.length;
    const totalTemplates = templates.length;

    setStats({
      totalLeads,
      activeLeads,
      totalCampaigns,
      totalTemplates
    });

    // Get recent leads (last 5)
    setRecentLeads(leads.slice(0, 5));
  }, [leads, campaigns, templates]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.fullName || 'User'}! Here's what's happening with your CRM.
          </p>
        </div>
        <Link
          to="/leads"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {stats.activeLeads} active leads
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Leads</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeLeads}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {stats.totalLeads > 0 ? Math.round((stats.activeLeads / stats.totalLeads) * 100) : 0}% of total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campaigns</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalCampaigns}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Email campaigns created
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Templates</p>
              <p className="text-3xl font-bold text-orange-600">{stats.totalTemplates}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Email templates available
            </span>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent Leads</h2>
            <Link
              to="/leads"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all leads
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentLeads.length > 0 ? (
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold">
                        {lead.first_name?.[0] || lead.name?.[0] || '?'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {lead.first_name && lead.last_name 
                          ? `${lead.first_name} ${lead.last_name}`
                          : lead.name || lead.email
                        }
                      </h3>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                      {lead.status || 'Unknown'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
              <p className="text-gray-500 mb-4">
                Start building your lead database by adding your first lead.
              </p>
              <Link
                to="/leads"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Lead
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/leads"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Leads</h3>
              <p className="text-sm text-gray-500">View and edit your leads</p>
            </div>
          </div>
        </Link>

        <Link
          to="/user-activity"
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">User Activity</h3>
              <p className="text-sm text-gray-500">Track user engagement</p>
            </div>
          </div>
        </Link>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email Campaigns</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;