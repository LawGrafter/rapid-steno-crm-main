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
  XCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const { leads, campaigns, user } = useCRM();



  // Mock payment data for dashboard
  const paymentStats = {
    totalRevenue: 125000,
    monthlyRevenue: 45230,
    totalUsers: 1547,
    trialUsers: 234,
    paidUsers: 892,
    basicUsers: 567,
    advancedUsers: 325,
    pendingPayments: 23,
    failedPayments: 8
  };

  const campaignPerformance = [
    { month: 'Jan', opens: 2400, clicks: 240 },
    { month: 'Feb', opens: 1398, clicks: 180 },
    { month: 'Mar', opens: 9800, clicks: 520 },
    { month: 'Apr', opens: 3908, clicks: 390 },
    { month: 'May', opens: 4800, clicks: 480 },
    { month: 'Jun', opens: 3800, clicks: 410 }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 85000 },
    { month: 'Feb', revenue: 92000 },
    { month: 'Mar', revenue: 108000 },
    { month: 'Apr', revenue: 115000 },
    { month: 'May', revenue: 125000 }
  ];

  const stats = [
    {
      title: 'Total Leads',
      value: leads.length.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Campaigns',
      value: campaigns.filter(c => c.status === 'active').length.toString(),
      icon: Mail,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Open Rate',
      value: '28.4%',
      icon: Eye,
      color: 'bg-purple-500',
      change: '+2.4%'
    },
    {
      title: 'Revenue',
      value: `₹${(paymentStats.totalRevenue / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: 'bg-orange-500',
      change: '+15%'
    }
  ];

  return (
    <div className="p-6 space-y-6">

      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your CRM.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
            Create Campaign
          </button>
          <button className="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Monthly Revenue</p>
              <p className="text-2xl font-bold text-green-600 mt-1">₹{paymentStats.monthlyRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1">+18% vs last month</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Paid Users</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{paymentStats.paidUsers}</p>
              <p className="text-sm text-green-600 mt-1">+12% vs last month</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Trial Users</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{paymentStats.trialUsers}</p>
              <p className="text-sm text-orange-600 mt-1">Convert to paid</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Payments</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{paymentStats.pendingPayments}</p>
              <p className="text-sm text-red-600 mt-1">Needs attention</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} vs last month</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Plan Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Basic Monthly</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{paymentStats.basicUsers}</p>
              <p className="text-xs text-gray-500 mt-1">₹197/month</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Advanced Quarterly</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{paymentStats.advancedUsers}</p>
              <p className="text-xs text-gray-500 mt-1">₹497/3 months</p>
            </div>
            <div className="bg-indigo-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {((paymentStats.paidUsers / paymentStats.totalUsers) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Trial to Paid</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg. Revenue Per User</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                ₹{Math.round(paymentStats.totalRevenue / paymentStats.paidUsers)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Monthly ARPU</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={campaignPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="opens" stroke="#002E2C" strokeWidth={2} />
              <Line type="monotone" dataKey="clicks" stroke="#f97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#002E2C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Users Recent Activities</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            {
              id: '1',
              type: 'user_login',
              userName: 'Rajesh Kumar',
              userEmail: 'rajesh.kumar@lawfirm.in',
              description: 'User logged in and started Court Dictation session',
              timestamp: new Date('2024-01-25T10:30:00'),
              activityType: 'Court Dictation'
            },
            {
              id: '2',
              type: 'user_activity',
              userName: 'Priya Sharma',
              userEmail: 'priya.sharma@newstoday.com',
              description: 'Completed 25 minutes of MyGrowth exercises',
              timestamp: new Date('2024-01-25T09:15:00'),
              activityType: 'MyGrowth'
            },
            {
              id: '3',
              type: 'user_activity',
              userName: 'Amit Patel',
              userEmail: 'amit.patel@freelance.com',
              description: 'Practiced SpeedBoosterDictations for 15 minutes',
              timestamp: new Date('2024-01-25T08:45:00'),
              activityType: 'SpeedBoosterDictations'
            },
            {
              id: '4',
              type: 'user_login',
              userName: 'Dr. Sunita Verma',
              userEmail: 'sunita.verma@university.edu',
              description: 'User logged in and accessed Settings',
              timestamp: new Date('2024-01-25T08:20:00'),
              activityType: 'Settings'
            },
            {
              id: '5',
              type: 'user_activity',
              userName: 'Arjun Reddy',
              userEmail: 'arjun.reddy@student.ac.in',
              description: 'Started trial and completed first MyGrowth session',
              timestamp: new Date('2024-01-25T07:50:00'),
              activityType: 'MyGrowth'
            }
          ].map((activity) => (
            <div key={activity.id} className="p-6 flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                {activity.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900">{activity.userName}</p>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">{activity.userEmail}</span>
                </div>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {activity.activityType}
                  </span>
                  <span className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;