import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';
import { UserActivityGraphs } from '../components/UserActivityGraphs';
import { useUserActivityV2 } from '../hooks/useUserActivityV2';
import { ActivityLogData } from '../hooks/useUserActivityV2';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'analytics' | 'logs'>('analytics');

  const { userActivities, loading, error } = useUserActivityV2();

  // Debug logging
  console.log('🔍 UserDetail Debug:');
  console.log('URL id:', id);
  console.log('Available users:', userActivities.map(u => ({ id: u.userId, name: u.userName })));

  // Find the specific user
  const user = userActivities.find(u => u.userId === id);

  const formatTime = (seconds: number) => {
    if (seconds === 0) return '0s';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Settings': return <Activity className="w-4 h-4 text-gray-600" />;
      case 'Court Dictation': return <BarChart3 className="w-4 h-4 text-blue-600" />;
      case 'MyGrowth': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'SpeedBoosterDictations': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading user data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/user-activity')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to User Activity
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">User Not Found</h3>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <button 
            onClick={() => navigate('/user-activity')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to User Activity
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/user-activity')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to User Activity</span>
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-xl">
              {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{user.userName}</h1>
            <p className="text-gray-600">{user.userEmail}</p>
            <div className="flex items-center space-x-6 mt-2">
              <div className="text-center">
                <p className="text-sm text-gray-500">Total Time</p>
                <p className="text-lg font-semibold text-gray-900">{formatTime(user.totalTimeAllTime)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Sessions</p>
                <p className="text-lg font-semibold text-gray-900">{user.totalSessions}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Last Active</p>
                <p className="text-sm font-medium text-gray-900">
                  {user.lastActiveDate.toLocaleDateString()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Favorite Activity</p>
                <p className="text-sm font-medium text-gray-900">{user.favoriteActivity}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics & Graphs
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Activity Logs
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'analytics' && (
            <UserActivityGraphs 
              activityLogs={user.activityLogs}
              userName={user.userName}
            />
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Detailed Activity Logs</h3>
                <div className="text-sm text-gray-500">
                  {user.activityLogs.length} days of activity
                </div>
              </div>

              {user.activityLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No activity logs available</p>
                  <p className="text-sm text-gray-400">This user has no recorded activity yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {user.activityLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleLogExpansion(log.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{log.date}</p>
                            <p className="text-sm text-gray-500">
                              {formatTime(log.dailyTimeSpent)} • {new Set(log.activities.map(a => a.type)).size} unique pages
                            </p>
                          </div>
                        </div>
                        {expandedLogs.has(log.id) ? (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        )}
                      </button>

                      {expandedLogs.has(log.id) && (
                        <div className="px-4 pb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {log.activities.map((activity) => (
                              <div
                                key={activity.id}
                                className="p-3 bg-gray-50 rounded-lg flex items-center space-x-3"
                              >
                                {getActivityIcon(activity.type)}
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">{activity.type}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatTime(activity.timeSpent)} • {activity.views} views
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail; 