import { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import {
  Mail,
  Eye,
  MousePointer,
  DollarSign,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Analytics = () => {
  const { leads, campaigns } = useCRM();
  const [dateRange, setDateRange] = useState('30d');

  const performanceData = [
    { date: '2024-01-01', sent: 1200, opens: 300, clicks: 45, revenue: 2500 },
    { date: '2024-01-02', sent: 1500, opens: 420, clicks: 78, revenue: 3200 },
    { date: '2024-01-03', sent: 1800, opens: 540, clicks: 95, revenue: 4100 },
    { date: '2024-01-04', sent: 2100, opens: 630, clicks: 120, revenue: 5200 },
    { date: '2024-01-05', sent: 1900, opens: 570, clicks: 102, revenue: 4800 },
    { date: '2024-01-06', sent: 2200, opens: 660, clicks: 135, revenue: 5800 },
    { date: '2024-01-07', sent: 2500, opens: 750, clicks: 165, revenue: 6900 }
  ];

  const campaignTypes = [
    { name: 'Welcome Series', value: 35, color: '#002E2C' },
    { name: 'Product Updates', value: 25, color: '#f97316' },
    { name: 'Newsletters', value: 20, color: '#10b981' },
    { name: 'Promotions', value: 15, color: '#8b5cf6' },
    { name: 'Others', value: 5, color: '#64748b' }
  ];

  const deviceData = [
    { device: 'Desktop', opens: 1200, clicks: 180 },
    { device: 'Mobile', opens: 800, clicks: 95 },
    { device: 'Tablet', opens: 300, clicks: 35 }
  ];

  const keyMetrics = [
    {
      title: 'Total Emails Sent',
      value: '125,430',
      change: '+12.5%',
      icon: Mail,
      color: 'bg-blue-500'
    },
    {
      title: 'Overall Open Rate',
      value: '28.4%',
      change: '+2.1%',
      icon: Eye,
      color: 'bg-green-500'
    },
    {
      title: 'Click-through Rate',
      value: '4.2%',
      change: '+0.8%',
      icon: MousePointer,
      color: 'bg-purple-500'
    },
    {
      title: 'Revenue Generated',
      value: '$45,230',
      change: '+18.3%',
      icon: DollarSign,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Track your email campaign performance</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <p className="text-sm text-green-600 mt-1">{metric.change} vs last period</p>
              </div>
              <div className={`${metric.color} p-3 rounded-lg`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sent" stroke="#002E2C" strokeWidth={2} name="Sent" />
              <Line type="monotone" dataKey="opens" stroke="#f97316" strokeWidth={2} name="Opens" />
              <Line type="monotone" dataKey="clicks" stroke="#10b981" strokeWidth={2} name="Clicks" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Types Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={campaignTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {campaignTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#002E2C" fill="#002E2C" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deviceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="device" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="opens" fill="#002E2C" name="Opens" />
              <Bar dataKey="clicks" fill="#f97316" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Performance Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Open Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Click Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {state.campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.recipients.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.recipients > 0 ? ((campaign.opens / campaign.recipients) * 100).toFixed(1) : '0.0'}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {campaign.recipients > 0 ? ((campaign.clicks / campaign.recipients) * 100).toFixed(1) : '0.0'}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(Math.random() * 10000).toFixed(0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;