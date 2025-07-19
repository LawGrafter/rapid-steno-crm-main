import React, { useState, useEffect } from 'react';
import { useCRM } from '../context/CRMContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { useUserActivityV2 } from '../hooks/useUserActivityV2';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { Link } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Mail, 
  Calendar,
  Plus,
  Eye,
  Clock,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';

const Dashboard: React.FC = () => {
  const { 
    campaigns, 
    emailLists, 
    templates, 
    refreshData,
    user 
  } = useCRM();

  // Use Supabase data for dashboard stats
  const { stats, loading: statsLoading } = useDashboardData();
  const { userActivities, loading: activityLoading } = useUserActivityV2();
  const { users } = useSupabaseData();
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  // Calculate real user growth data from all users
  const getRealUserGrowthData = () => {
    const userCounts: { [key: string]: number } = {};
    
    users.forEach(user => {
      const date = new Date(user.created_at).toLocaleDateString();
      userCounts[date] = (userCounts[date] || 0) + 1;
    });

    return Object.entries(userCounts)
      .map(([date, count]) => ({ date, users: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    // Set recent leads from Supabase data
    if (stats.recentUsers) {
      setRecentLeads(stats.recentUsers);
    }
  }, [stats.recentUsers]);

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

  // Use data from enhanced dashboard stats
  const trendingPagesData = stats.trendingPagesData;
  const userGrowthData = stats.userGrowthData;
  
  // Calculate real trending pages data from user activities
  const getRealTrendingPagesData = () => {
    const pageStats: { [key: string]: { timeSpent: number; views: number } } = {};
    
    userActivities.forEach(user => {
      user.activityLogs.forEach(log => {
        log.activities.forEach(activity => {
          if (!pageStats[activity.type]) {
            pageStats[activity.type] = { timeSpent: 0, views: 0 };
          }
          pageStats[activity.type].timeSpent += activity.timeSpent;
          pageStats[activity.type].views += activity.views;
        });
      });
    });

    return Object.entries(pageStats)
      .map(([page, stats]) => ({
        page,
        timeSpent: Math.round(stats.timeSpent / 60), // Convert to minutes
        views: stats.views
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  };

  const realTrendingPagesData = getRealTrendingPagesData();
  
  const realUserGrowthData = getRealUserGrowthData();
  
  // Calculate expired and active users with proper trial logic
  const expired = users.filter(user => {
    // For trial users, calculate trial end date (created date + 15 days)
    if (user.subscription_plan === 'Trial' || user.trial_status === 'Active') {
      const createdDate = new Date(user.created_at);
      const trialEndDate = new Date(createdDate.getTime() + (15 * 24 * 60 * 60 * 1000)); // 15 days
      return trialEndDate < new Date();
    }
    
    // For paid users, check their subscription end date
    if (user.current_subscription_end) {
      const endDate = new Date(user.current_subscription_end);
      return endDate < new Date();
    }
    
    return false;
  });
  
  const active = users.filter(user => {
    // For trial users, calculate trial end date (created date + 15 days)
    if (user.subscription_plan === 'Trial' || user.trial_status === 'Active') {
      const createdDate = new Date(user.created_at);
      const trialEndDate = new Date(createdDate.getTime() + (15 * 24 * 60 * 60 * 1000)); // 15 days
      return trialEndDate >= new Date();
    }
    
    // For paid users, check their subscription end date
    if (user.current_subscription_end) {
      const endDate = new Date(user.current_subscription_end);
      return endDate >= new Date();
    }
    
    // If no end date, consider as active
    return true;
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
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
              {stats.paidUsers} paid users
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Trial Users</p>
              <p className="text-3xl font-bold text-blue-600">{stats.trialUsers}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              {stats.totalLeads > 0 ? Math.round((stats.trialUsers / stats.totalLeads) * 100) : 0}% of total
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Users</p>
              <p className="text-3xl font-bold text-green-600">{stats.paidUsers}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Active subscriptions
            </span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-purple-600">₹{stats.revenue}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">
              Monthly estimate
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Trending Pages */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Most Trending Pages</h2>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          {realTrendingPagesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={realTrendingPagesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="page" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="views" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No activity data available</p>
            </div>
          )}
        </div>

        {/* User Growth by Date */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">User Growth (Last 7 Days)</h2>
            <LineChart className="w-5 h-5 text-gray-500" />
          </div>
          {realUserGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={realUserGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} />
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No user growth data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Expired/Active Contacts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contacts */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Active Contacts</h2>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-600 font-medium">{active.length}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {active.length > 0 ? (
              <div className="space-y-3">
                {active.slice(0, 5).map((user) => {
                  // Calculate days left for this user
                  let daysLeft = 'N/A';
                  let daysLeftColor = 'text-gray-500';
                  
                  if (user.subscription_plan === 'Trial' || user.trial_status === 'Active') {
                    const createdDate = new Date(user.created_at);
                    const trialEndDate = new Date(createdDate.getTime() + (15 * 24 * 60 * 60 * 1000)); // 15 days
                    const today = new Date();
                    const diffTime = trialEndDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) {
                      daysLeft = `${Math.abs(diffDays)} days expired`;
                      daysLeftColor = 'text-red-600';
                    } else {
                      daysLeft = `${diffDays} days left`;
                      daysLeftColor = diffDays <= 3 ? 'text-yellow-600' : 'text-green-600';
                    }
                  } else if (user.current_subscription_end) {
                    const endDate = new Date(user.current_subscription_end);
                    const today = new Date();
                    const diffTime = endDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) {
                      daysLeft = `${Math.abs(diffDays)} days expired`;
                      daysLeftColor = 'text-red-600';
                    } else {
                      daysLeft = `${diffDays} days left`;
                      daysLeftColor = diffDays <= 3 ? 'text-yellow-600' : 'text-green-600';
                    }
                  }
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-semibold text-sm">
                            {user.first_name?.[0] || user.email?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.email
                            }
                          </h3>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`text-xs font-medium ${daysLeftColor}`}>
                          {daysLeft}
                        </span>
                        <span className="text-xs text-green-600 font-medium">Active</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active contacts</p>
              </div>
            )}
          </div>
        </div>

        {/* Expired Contacts */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Expired Contacts</h2>
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm text-red-600 font-medium">{expired.length}</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            {expired.length > 0 ? (
              <div className="space-y-3">
                {expired.slice(0, 5).map((user) => {
                  // Calculate days expired for this user
                  let daysExpired = 'N/A';
                  
                  if (user.subscription_plan === 'Trial' || user.trial_status === 'Active') {
                    const createdDate = new Date(user.created_at);
                    const trialEndDate = new Date(createdDate.getTime() + (15 * 24 * 60 * 60 * 1000)); // 15 days
                    const today = new Date();
                    const diffTime = trialEndDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) {
                      daysExpired = `${Math.abs(diffDays)} days expired`;
                    }
                  } else if (user.current_subscription_end) {
                    const endDate = new Date(user.current_subscription_end);
                    const today = new Date();
                    const diffTime = endDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    
                    if (diffDays < 0) {
                      daysExpired = `${Math.abs(diffDays)} days expired`;
                    }
                  }
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold text-sm">
                            {user.first_name?.[0] || user.email?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}`
                              : user.email
                            }
                          </h3>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-red-600 font-medium">
                          {daysExpired}
                        </span>
                        <span className="text-xs text-red-600 font-medium">Expired</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No expired contacts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Recent User Activity</h2>
            <Link
              to="/user-activity"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View all activity
            </Link>
          </div>
        </div>
        <div className="p-6">
          {userActivities.length > 0 ? (
            <div className="space-y-4">
              {(() => {
                // Collect all activities and limit to 10
                const allActivities: Array<{
                  userActivity: any;
                  log: any;
                  activity: any;
                }> = [];
                
                userActivities.forEach((userActivity) => {
                  userActivity.activityLogs.forEach((log) => {
                    log.activities.forEach((activity) => {
                      allActivities.push({ userActivity, log, activity });
                    });
                  });
                });
                
                // Sort by timestamp (most recent first) and take first 10
                return allActivities
                  .sort((a, b) => new Date(b.activity.timestamp).getTime() - new Date(a.activity.timestamp).getTime())
                  .slice(0, 10)
                  .map(({ userActivity, log, activity }) => (
                    <div
                      key={`${userActivity.userId}-${log.id}-${activity.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {userActivity.userName?.[0] || userActivity.userEmail?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {userActivity.userName || userActivity.userEmail}
                          </h3>
                          <p className="text-sm text-gray-500">
                            visited {activity.type} {activity.views} time{activity.views !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.timeSpent < 60 
                              ? `${activity.timeSpent}s` 
                              : `${Math.round(activity.timeSpent / 60)}m`
                            }
                          </p>
                          <p className="text-xs text-gray-500">Time spent</p>
                        </div>
                        <span className="text-sm text-gray-500">
                          {activity.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ));
              })()}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
              <p className="text-gray-600">No user activity has been recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;