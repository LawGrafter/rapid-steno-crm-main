import React from 'react';
import { Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { ActivityData, ActivityLogData } from '../hooks/useUserActivityV2';

interface UserActivityGraphsProps {
  activityLogs: ActivityLogData[];
  userName: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const UserActivityGraphs: React.FC<UserActivityGraphsProps> = ({ activityLogs, userName }) => {
  // Check if we have data
  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">No activity data available</p>
        <p className="text-sm text-gray-400">This user has no recorded activity yet</p>
      </div>
    );
  }

  // Prepare data for daily activity trend
  const dailyTrendData = activityLogs.map(log => ({
    date: log.date,
    timeSpent: log.dailyTimeSpent,
    pagesViewed: log.activities.length,
    uniquePages: new Set(log.activities.map(a => a.type)).size
  })).reverse(); // Show oldest to newest

  // Prepare data for page usage breakdown
  const pageUsageData = activityLogs.reduce((acc, log) => {
    log.activities.forEach(activity => {
      const existing = acc.find(item => item.page === activity.type);
      if (existing) {
        existing.timeSpent += activity.timeSpent;
        existing.views += activity.views;
      } else {
        acc.push({
          page: activity.type,
          timeSpent: activity.timeSpent,
          views: activity.views
        });
      }
    });
    return acc;
  }, [] as Array<{ page: string; timeSpent: number; views: number }>);

  // Sort by time spent
  pageUsageData.sort((a, b) => b.timeSpent - a.timeSpent);

  // Prepare data for pie chart (top 6 pages)
  const pieData = pageUsageData.slice(0, 6).map(item => ({
    name: item.page,
    value: item.timeSpent,
    views: item.views
  }));

  // Calculate total time for percentage
  const totalTime = pageUsageData.reduce((sum, item) => sum + item.timeSpent, 0);

  // Format time for display
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalTime) * 100).toFixed(1);
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">Time: {formatTime(data.value)}</p>
          <p className="text-sm text-gray-600">Views: {data.views}</p>
          <p className="text-sm text-blue-600">{percentage}% of total time</p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for line chart
  const CustomLineTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const timeSpent = payload[0]?.value || 0;
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">Date: {label}</p>
          <p className="text-sm text-blue-600">Time: {formatTime(timeSpent)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Activity Analytics for {userName}
        </h3>
        <p className="text-sm text-gray-600">
          {activityLogs.length} days of activity data
        </p>
      </div>

      {/* Daily Activity Trend */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Daily Activity Trend</h4>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomLineTooltip />} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="timeSpent" 
              stroke="#8884d8" 
              fill="#8884d8" 
              fillOpacity={0.6}
              name="Time Spent (s)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Page Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Time per Page */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Time Spent per Page</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pageUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="page" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value: number) => [formatTime(value), 'Time Spent']}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="timeSpent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Page Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Page Usage Distribution</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{formatTime(totalTime)}</div>
          <div className="text-sm opacity-90">Total Time Spent</div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">{pageUsageData.length}</div>
          <div className="text-sm opacity-90">Unique Pages Visited</div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg text-white">
          <div className="text-2xl font-bold">
            {pageUsageData.reduce((sum, item) => sum + item.views, 0)}
          </div>
          <div className="text-sm opacity-90">Total Page Views</div>
        </div>
      </div>

      {/* Most Active Pages Table */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Most Active Pages</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">Page</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Time Spent</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">Views</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {pageUsageData.slice(0, 8).map((item, index) => (
                <tr key={item.page} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.page}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{formatTime(item.timeSpent)}</td>
                  <td className="py-3 px-4 text-right text-gray-600">{item.views}</td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {((item.timeSpent / totalTime) * 100).toFixed(1)}%
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