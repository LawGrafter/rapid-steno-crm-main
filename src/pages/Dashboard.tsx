import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Users,
  Mail,
  TrendingUp,
  DollarSign,
  Eye,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Download,
  Filter,
  Calendar,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const Dashboard = () => {
  const { leads, campaigns, user } = useCRM();
  const [trialStatusFilter, setTrialStatusFilter] = useState<string>('all');
  const [chartPeriod, setChartPeriod] = useState<string>('30'); // 7, 30, 90 days

  // Real data from CRM context
  const totalLeads = leads.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const trialLeads = leads.filter(l => l.user_type === 'Trial User').length;
  const paidLeads = leads.filter(l => l.is_subscription_active).length;

  // Process data for the line chart
  const processChartData = () => {
    const days = parseInt(chartPeriod);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Create date range
    const dateRange = [];
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dateRange.push({
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        users: 0,
        cumulative: 0
      });
    }

    // Count users by trial start date
    const userCounts: { [key: string]: number } = {};
    leads.forEach(lead => {
      const trialStartDate = lead.trial_start_date || lead.created_at;
      if (trialStartDate) {
        const dateKey = new Date(trialStartDate).toISOString().split('T')[0];
        if (dateKey >= startDate.toISOString().split('T')[0] && 
            dateKey <= endDate.toISOString().split('T')[0]) {
          userCounts[dateKey] = (userCounts[dateKey] || 0) + 1;
        }
      }
    });

    // Fill in the data
    let cumulative = 0;
    dateRange.forEach((item, index) => {
      const count = userCounts[item.date] || 0;
      cumulative += count;
      dateRange[index] = {
        ...item,
        users: count,
        cumulative: cumulative
      };
    });

    return dateRange;
  };

  const chartData = processChartData();

  const stats = [
    {
      title: 'Total Leads',
      value: totalLeads.toLocaleString(),
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      change: totalLeads > 0 ? `+${totalLeads}` : '0'
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns.toString(),
      icon: Mail,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      change: activeCampaigns > 0 ? `+${activeCampaigns}` : '0'
    },
    {
      title: 'Trial Users',
      value: trialLeads.toString(),
      icon: Clock,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      change: trialLeads > 0 ? `+${trialLeads}` : '0'
    },
    {
      title: 'Paid Users',
      value: paidLeads.toString(),
      icon: DollarSign,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      change: paidLeads > 0 ? `+${paidLeads}` : '0'
    }
  ];

  const getStatusText = (daysLeft: number) => {
    if (daysLeft < 0) return 'Expired';
    if (daysLeft <= 3) return 'Critical';
    if (daysLeft <= 7) return 'Warning';
    return 'Active';
  };

  const getStatusColor = (daysLeft: number) => {
    if (daysLeft < 0) return 'bg-red-100 text-red-800';
    if (daysLeft <= 3) return 'bg-orange-100 text-orange-800';
    if (daysLeft <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getDaysText = (daysLeft: number) => {
    if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1 day left';
    return `${daysLeft}d left`;
  };

  return (
    <div className="p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">Welcome back! Here's what's happening with your CRM.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-accent text-white px-3 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm flex items-center space-x-1">
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
          <button className="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center space-x-1">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs text-gray-600 font-medium uppercase tracking-wide">{stat.title}</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change} vs last month</p>
              </div>
              <div className={`${stat.color} p-2 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Growth Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
              <p className="text-xs text-gray-600 mt-1">Number of users added over time based on trial start dates</p>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-gray-500" />
              <select
                value={chartPeriod}
                onChange={(e) => setChartPeriod(e.target.value)}
                className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-4">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="displayDate" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toString()}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
                formatter={(value: any, name: any) => [
                  name === 'users' ? `${value} new users` : `${value} total users`,
                  name === 'users' ? 'New Users' : 'Total Users'
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="#3B82F6" 
                strokeWidth={2}
                fill="url(#colorUsers)"
                name="cumulative"
              />
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
                name="users"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center space-x-6 mt-4 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>New Users (Daily)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Total Users (Cumulative)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trial Status Table - Takes 2/3 of the space */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
                <h3 className="text-lg font-semibold text-gray-900">Trial Status</h3>
                <p className="text-xs text-gray-600 mt-1">Track users approaching or past trial end dates</p>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={trialStatusFilter}
                  onChange={(e) => setTrialStatusFilter(e.target.value)}
                  className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Warning">Warning</option>
                  <option value="Critical">Critical</option>
                  <option value="Expired">Expired</option>
                </select>
            </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trial End</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Left</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {leads
                  .filter(lead => lead.trial_end_date && (lead.is_trial_active || lead.user_type === 'Trial User'))
                  .map(lead => {
                    const trialEndDate = new Date(lead.trial_end_date || '');
                    const today = new Date();
                    const daysLeft = Math.ceil((trialEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                    const status = getStatusText(daysLeft);
                    return { ...lead, daysLeft, status };
                  })
                  .filter(lead => trialStatusFilter === 'all' || lead.status === trialStatusFilter)
                  .sort((a, b) => a.daysLeft - b.daysLeft)
                  .slice(0, 8)
                  .map((lead) => {
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                              {(lead.name || `${lead.first_name} ${lead.last_name}`).charAt(0)}
        </div>
            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-32">
                                {lead.name || `${lead.first_name} ${lead.last_name}`}
            </div>
                              <div className="text-xs text-gray-500 truncate max-w-32">{lead.email}</div>
            </div>
          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{lead.plan || 'Trial'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(lead.trial_end_date || '').toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getDaysText(lead.daysLeft)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.daysLeft)}`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                {leads.filter(lead => lead.trial_end_date && (lead.is_trial_active || lead.user_type === 'Trial User')).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Clock className="w-8 h-8 text-gray-400" />
                        <h3 className="text-sm font-medium text-gray-900">No trial users found</h3>
                        <p className="text-xs text-gray-500">When you have users on trial, they will appear here.</p>
        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Leads - Takes 1/3 of the space */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
            <p className="text-xs text-gray-600 mt-1">Latest user registrations</p>
          </div>
          <div className="divide-y divide-gray-100">
            {leads.slice(0, 6).map((lead) => (
              <div key={lead.id} className="p-3 flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {(lead.name || `${lead.first_name} ${lead.last_name}`).charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1 mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lead.name || `${lead.first_name} ${lead.last_name}`}
                    </p>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{lead.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {lead.source || 'Direct'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                  </span>
                  </div>
                </div>
              </div>
            ))}
            {leads.length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <p className="text-sm">No leads found.</p>
                <p className="text-xs">Start by creating your first lead.</p>
              </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;