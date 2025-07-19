import { useState, useEffect } from 'react';
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
  BarChart3,
  UserCheck,
  UserX,
  Activity,
  Monitor,
  Target
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';

interface UserActivity {
  id: string;
  user_id: string;
  page_name: string;
  time_spent: number;
  view_count: number;
  visit_date: string;
  leads?: {
    id: string;
    name: string;
    email: string;
  };
}

interface PageStats {
  [key: string]: {
    name: string;
    time: number;
    views: number;
    users: Set<string>;
  };
}

interface ActivityStats {
  totalTime: number;
  totalViews: number;
  pageData: Array<{
    name: string;
    time: number;
    views: number;
    users: number;
    percentage: string;
  }>;
  averageTimePerPage: number;
}

const Dashboard = () => {
  const { leads, campaigns, user, refreshData } = useCRM();
  const [trialStatusFilter, setTrialStatusFilter] = useState<string>('all');
  const [chartPeriod, setChartPeriod] = useState<string>('30'); // 7, 30, 90 days
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data when component mounts
  useEffect(() => {
    refreshData();
  }, [refreshData]);


  // Fetch user activities
  const fetchUserActivities = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-activities');
      const data = await response.json();
      setUserActivities(data);
    } catch (error) {
      console.error('Error fetching user activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate activity statistics
  const calculateActivityStats = (): ActivityStats | null => {
    if (!userActivities.length) return null;

    const pageStats: PageStats = {};
    let totalTime = 0;
    let totalViews = 0;

    userActivities.forEach((activity: UserActivity) => {
      const pageName = activity.page_name;
      if (!pageStats[pageName]) {
        pageStats[pageName] = {
          name: pageName,
          time: 0,
          views: 0,
          users: new Set()
        };
      }
      pageStats[pageName].time += activity.time_spent || 0;
      pageStats[pageName].views += activity.view_count || 1;
      pageStats[pageName].users.add(activity.user_id);
      totalTime += activity.time_spent || 0;
      totalViews += activity.view_count || 1;
    });

    const pageData = Object.values(pageStats).map(page => ({
      name: page.name,
      time: page.time,
      views: page.views,
      users: page.users.size,
      percentage: ((page.time / totalTime) * 100).toFixed(1)
    }));

    return {
      totalTime,
      totalViews,
      pageData: pageData.sort((a, b) => b.time - a.time),
      averageTimePerPage: totalTime / userActivities.length
    };
  };

  const activityStats = calculateActivityStats();

  // Calculate user statistics
  const totalUsers = leads.length;
  const activeUsers = leads.filter(l => {
    if (l.trial_end_date) {
      const trialEndDate = new Date(l.trial_end_date);
      const today = new Date();
      return trialEndDate > today;
    }
    // Check if subscription is active
    return l.is_subscription_active || l.user_type === 'Paid User';
  }).length;
  const inactiveUsers = totalUsers - activeUsers;
  const paidUsers = leads.filter(l => l.is_subscription_active || l.user_type === 'Paid User').length;

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
      title: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: Users,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      change: totalUsers > 0 ? `+${totalUsers}` : '0'
    },
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString(),
      icon: UserCheck,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      change: activeUsers > 0 ? `+${activeUsers}` : '0'
    },
    {
      title: 'Paid Users',
      value: paidUsers.toLocaleString(),
      icon: CreditCard,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      change: paidUsers > 0 ? `+${paidUsers}` : '0'
    },
    {
      title: 'Inactive Users',
      value: inactiveUsers.toLocaleString(),
      icon: UserX,
      color: 'bg-gradient-to-r from-red-500 to-red-600',
      change: inactiveUsers > 0 ? `+${inactiveUsers}` : '0'
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
    if (daysLeft <= 3) return 'bg-red-100 text-red-800';
    if (daysLeft <= 7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getDaysText = (daysLeft: number) => {
    if (daysLeft < 0) return `${Math.abs(daysLeft)}d expired`;
    if (daysLeft === 0) return 'Expires today';
    if (daysLeft === 1) return '1d left';
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

      {/* User Activity Analytics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">User Activity Analytics</h3>
              <p className="text-xs text-gray-600 mt-1">Track user engagement and page performance</p>
            </div>
            <button 
              onClick={fetchUserActivities}
              disabled={loading}
              className="bg-accent text-white px-3 py-1 rounded-lg hover:bg-accent-hover transition-colors text-sm flex items-center space-x-1 disabled:opacity-50"
            >
              <Activity className="w-4 h-4" />
              <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
        
        {activityStats ? (
          <div className="p-4">
            {/* Activity Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Total Time</p>
                    <p className="text-lg font-bold text-blue-900">{activityStats.totalTime} min</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-xs text-green-600 font-medium">Total Views</p>
                    <p className="text-lg font-bold text-green-900">{activityStats.totalViews}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Monitor className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-purple-600 font-medium">Avg Time/Page</p>
                    <p className="text-lg font-bold text-purple-900">{activityStats.averageTimePerPage.toFixed(1)} min</p>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-orange-600 font-medium">Active Pages</p>
                    <p className="text-lg font-bold text-orange-900">{activityStats.pageData.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Performance Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Page Performance</h4>
                <div className="space-y-3">
                  {activityStats.pageData.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{page.name}</span>
                          <span className="text-xs text-gray-500">{page.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${page.percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                          <span>{page.time} min</span>
                          <span>{page.views} views</span>
                          <span>{page.users} users</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Time Distribution</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activityStats.pageData.slice(0, 5)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="time"
                      >
                        {activityStats.pageData.slice(0, 5).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any, name: any) => [`${value} min`, name]}
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-sm font-medium text-gray-900 mb-2">No Activity Data</h3>
            <p className="text-xs text-gray-500 mb-4">Click "Refresh Data" to load user activity analytics</p>
            <button 
              onClick={fetchUserActivities}
              disabled={loading}
              className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load Activity Data'}
            </button>
          </div>
        )}
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