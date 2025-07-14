import { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  Activity, 
  Search, 
  Download, 
  Eye, 
  TrendingUp,
  BarChart3,
  Users,
  BookOpen,
  Zap,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { UserActivity as UserActivityType } from '../types';

const UserActivity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('7d');
  const [activityFilter, setActivityFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<UserActivityType | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  // Mock user activity data based on your image
  const [userActivities] = useState<UserActivityType[]>([
    {
      userId: '1',
      userName: 'Rajesh Kumar',
      userEmail: 'rajesh.kumar@lawfirm.in',
      totalTimeAllTime: 1247, // minutes
      lastActiveDate: new Date('2025-06-29'),
      averageDailyTime: 12,
      totalSessions: 45,
      favoriteActivity: 'Court Dictation',
      loginCount: 127,
      activityLogs: [
        {
          id: 'log1',
          date: '2025-06-26',
          dailyTimeSpent: 0,
          totalTimeSpent: 7,
          activities: [
            { id: 'a1', type: 'Settings', timeSpent: 2, views: 6, timestamp: new Date('2025-06-26T09:00:00') },
            { id: 'a2', type: 'Court Dictation', timeSpent: 2, views: 1, timestamp: new Date('2025-06-26T10:00:00') },
            { id: 'a3', type: 'MyGrowth', timeSpent: 3, views: 6, timestamp: new Date('2025-06-26T11:00:00') }
          ]
        },
        {
          id: 'log2',
          date: '2025-06-27',
          dailyTimeSpent: 0,
          totalTimeSpent: 16,
          activities: [
            { id: 'a4', type: 'Settings', timeSpent: 3, views: 5, timestamp: new Date('2025-06-27T09:00:00') },
            { id: 'a5', type: 'SpeedBoosterDictations', timeSpent: 5, views: 6, timestamp: new Date('2025-06-27T10:00:00') },
            { id: 'a6', type: 'MyGrowth', timeSpent: 9, views: 6, timestamp: new Date('2025-06-27T11:00:00') },
            { id: 'a7', type: 'Court Dictation', timeSpent: 1, views: 5, timestamp: new Date('2025-06-27T14:00:00') }
          ]
        },
        {
          id: 'log3',
          date: '2025-06-28',
          dailyTimeSpent: 0,
          totalTimeSpent: 0,
          activities: [
            { id: 'a8', type: 'MyGrowth', timeSpent: 0, views: 1, timestamp: new Date('2025-06-28T09:00:00') }
          ]
        },
        {
          id: 'log4',
          date: '2025-06-29',
          dailyTimeSpent: 0,
          totalTimeSpent: 18,
          activities: [
            { id: 'a9', type: 'Settings', timeSpent: 0, views: 2, timestamp: new Date('2025-06-29T09:00:00') },
            { id: 'a10', type: 'MyGrowth', timeSpent: 17, views: 18, timestamp: new Date('2025-06-29T10:00:00') },
            { id: 'a11', type: 'SpeedBoosterDictations', timeSpent: 0, views: 2, timestamp: new Date('2025-06-29T15:00:00') },
            { id: 'a12', type: 'Court Dictation', timeSpent: 0, views: 1, timestamp: new Date('2025-06-29T16:00:00') }
          ]
        }
      ]
    },
    {
      userId: '2',
      userName: 'Priya Sharma',
      userEmail: 'priya.sharma@newstoday.com',
      totalTimeAllTime: 2156,
      lastActiveDate: new Date('2025-06-29'),
      averageDailyTime: 25,
      totalSessions: 78,
      favoriteActivity: 'MyGrowth',
      loginCount: 89,
      activityLogs: [
        {
          id: 'log5',
          date: '2025-06-29',
          dailyTimeSpent: 0,
          totalTimeSpent: 32,
          activities: [
            { id: 'a13', type: 'MyGrowth', timeSpent: 25, views: 12, timestamp: new Date('2025-06-29T09:00:00') },
            { id: 'a14', type: 'Settings', timeSpent: 4, views: 3, timestamp: new Date('2025-06-29T11:00:00') },
            { id: 'a15', type: 'Court Dictation', timeSpent: 3, views: 2, timestamp: new Date('2025-06-29T14:00:00') }
          ]
        }
      ]
    },
    {
      userId: '3',
      userName: 'Amit Patel',
      userEmail: 'amit.patel@freelance.com',
      totalTimeAllTime: 892,
      lastActiveDate: new Date('2025-06-28'),
      averageDailyTime: 15,
      totalSessions: 32,
      favoriteActivity: 'SpeedBoosterDictations',
      loginCount: 45,
      activityLogs: [
        {
          id: 'log6',
          date: '2025-06-28',
          dailyTimeSpent: 0,
          totalTimeSpent: 22,
          activities: [
            { id: 'a16', type: 'SpeedBoosterDictations', timeSpent: 15, views: 8, timestamp: new Date('2025-06-28T10:00:00') },
            { id: 'a17', type: 'MyGrowth', timeSpent: 7, views: 4, timestamp: new Date('2025-06-28T12:00:00') }
          ]
        }
      ]
    }
  ]);

  const filteredUsers = userActivities.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'Settings': return <Eye className="w-4 h-4 text-gray-600" />;
      case 'Court Dictation': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'MyGrowth': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'SpeedBoosterDictations': return <Zap className="w-4 h-4 text-orange-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'Settings': return 'bg-gray-100 text-gray-800';
      case 'Court Dictation': return 'bg-blue-100 text-blue-800';
      case 'MyGrowth': return 'bg-green-100 text-green-800';
      case 'SpeedBoosterDictations': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (minutes: number) => {
    if (minutes === 0) return '0 min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
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

  const totalActiveUsers = userActivities.length;
  const totalTimeSpent = userActivities.reduce((sum, user) => sum + user.totalTimeAllTime, 0);
  const averageSessionTime = Math.round(totalTimeSpent / userActivities.reduce((sum, user) => sum + user.totalSessions, 0));
  const mostActiveUser = userActivities.reduce((prev, current) => 
    prev.totalTimeAllTime > current.totalTimeAllTime ? prev : current
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
          <p className="text-gray-600">Monitor user engagement and learning progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalActiveUsers}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Time Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatTime(totalTimeSpent)}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg Session Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatTime(averageSessionTime)}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Most Active User</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{mostActiveUser.userName}</p>
              <p className="text-xs text-gray-500">{formatTime(mostActiveUser.totalTimeAllTime)}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value)}
            >
              <option value="all">All Activities</option>
              <option value="Settings">Settings</option>
              <option value="Court Dictation">Court Dictation</option>
              <option value="MyGrowth">MyGrowth</option>
              <option value="SpeedBoosterDictations">Speed Booster</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Activity List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <div key={user.userId} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                    {user.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{user.userName}</h3>
                    <p className="text-sm text-gray-600">{user.userEmail}</p>
                    <p className="text-xs text-gray-500">Last active: {user.lastActiveDate.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total Time</p>
                    <p className="text-lg font-bold text-gray-900">{formatTime(user.totalTimeAllTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Avg Daily</p>
                    <p className="text-lg font-bold text-gray-900">{formatTime(user.averageDailyTime)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Sessions</p>
                    <p className="text-lg font-bold text-gray-900">{user.totalSessions}</p>
                  </div>
                  <button
                    onClick={() => setSelectedUser(selectedUser?.userId === user.userId ? null : user)}
                    className="text-primary hover:text-primary-hover"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Favorite Activity</p>
                  <div className="flex items-center space-x-2">
                    {getActivityIcon(user.favoriteActivity)}
                    <span className="font-medium text-gray-900">{user.favoriteActivity}</span>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Recent Activity</p>
                  <p className="font-medium text-gray-900">
                    {user.activityLogs.length > 0 ? user.activityLogs[user.activityLogs.length - 1].date : 'No activity'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Engagement Level</p>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${user.averageDailyTime > 20 ? 'bg-green-500' : user.averageDailyTime > 10 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                    <span className="font-medium text-gray-900">
                      {user.averageDailyTime > 20 ? 'High' : user.averageDailyTime > 10 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Logs */}
              {selectedUser?.userId === user.userId && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-900 mb-4">Activity Logs</h4>
                  <div className="space-y-3">
                    {user.activityLogs.map((log) => (
                      <div key={log.id} className="border border-gray-200 rounded-lg">
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleLogExpansion(log.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                {expandedLogs.has(log.id) ? 
                                  <ChevronDown className="w-4 h-4 text-gray-500" /> : 
                                  <ChevronRight className="w-4 h-4 text-gray-500" />
                                }
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-900">{log.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-6">
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Daily Time</p>
                                <p className="font-medium text-gray-900">{formatTime(log.dailyTimeSpent)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Total Time</p>
                                <p className="font-medium text-gray-900">{formatTime(log.totalTimeSpent)}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-gray-500">Activities</p>
                                <p className="font-medium text-gray-900">{log.activities.length}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {expandedLogs.has(log.id) && (
                          <div className="border-t border-gray-200 p-4 bg-gray-50">
                            <div className="space-y-3">
                              {log.activities.map((activity) => (
                                <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                  <div className="flex items-center space-x-3">
                                    {getActivityIcon(activity.type)}
                                    <div>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.type)}`}>
                                        {activity.type}
                                      </span>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {activity.timestamp.toLocaleTimeString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <div className="text-center">
                                      <p className="text-gray-500">Time</p>
                                      <p className="font-medium">{formatTime(activity.timeSpent)}</p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-gray-500">Views</p>
                                      <p className="font-medium">{activity.views}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-blue-800">
                                <strong>Total:</strong> {formatTime(log.totalTimeSpent)} | 
                                <strong> Pages Viewed:</strong> {log.activities.reduce((sum, a) => sum + a.views, 0)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No user activity found</h3>
          <p className="text-gray-600">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default UserActivity;
