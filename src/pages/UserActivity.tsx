import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  BarChart3, 
  TrendingUp, 
  Search, 
  BarChart, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useUserActivityV2 } from '../hooks/useUserActivityV2';

const UserActivity = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const { userActivities, loading, error, refetch } = useUserActivityV2();

  // Filter users based on search term
  const filteredUsers = userActivities.filter(user => {
    const matchesSearch = user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatTime = (seconds: number) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  const getActivityTag = (totalTime: number, totalSessions: number) => {
    // Calculate activity score (time + sessions weighted)
    const timeScore = totalTime / 3600; // Convert to hours
    const sessionScore = totalSessions * 0.5; // Weight sessions
    const activityScore = timeScore + sessionScore;

    if (activityScore >= 10) return { text: 'Most Active', color: 'bg-green-100 text-green-800' };
    if (activityScore >= 5) return { text: 'High Activity', color: 'bg-blue-100 text-blue-800' };
    if (activityScore >= 2) return { text: 'Moderate Activity', color: 'bg-yellow-100 text-yellow-800' };
    if (activityScore >= 0.5) return { text: 'Low Activity', color: 'bg-gray-100 text-gray-800' };
    return { text: 'Inactive', color: 'bg-red-100 text-red-800' };
  };

  const totalActiveUsers = userActivities.length;
  const totalTimeSpent = userActivities.reduce((sum, user) => sum + user.totalTimeAllTime, 0);
  const totalSessions = userActivities.reduce((sum, user) => sum + user.totalSessions, 0);
  const averageSessionTime = totalSessions > 0 ? Math.round(totalTimeSpent / totalSessions) : 0;
  const mostActiveUser = userActivities.length > 0 
    ? userActivities.reduce((prev, current) => 
        prev.totalTimeAllTime > current.totalTimeAllTime ? prev : current
      )
    : null;

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="text-gray-600">Loading user activity data from Supabase...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={refetch}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (userActivities.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No User Activity Data</h3>
          <p className="text-gray-600">No user activity data has been synced from Supabase yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Activity</h1>
          <p className="text-gray-600">Monitor user engagement and learning progress from Supabase</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
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
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
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
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
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
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Most Active User</p>
              <p className="text-lg font-bold text-gray-900 mt-1">
                {mostActiveUser ? mostActiveUser.userName : 'No data'}
              </p>
              <p className="text-xs text-gray-500">
                {mostActiveUser ? formatTime(mostActiveUser.totalTimeAllTime) : '0 min'}
              </p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              User Activities ({filteredUsers.length} of {userActivities.length} users)
            </h2>
          </div>
        </div>
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* User Activity List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.userId} className="bg-white rounded-xl shadow-md border border-gray-200 p-6 h-52 flex flex-col">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {user.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="text-base font-semibold text-gray-900">{user.userName}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTag(user.totalTimeAllTime, user.totalSessions).color}`}>
                    {getActivityTag(user.totalTimeAllTime, user.totalSessions).text}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{user.userEmail}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Time</p>
                <p className="text-sm font-semibold text-gray-900">{formatTime(user.totalTimeAllTime)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Sessions</p>
                <p className="text-sm font-semibold text-gray-900">{user.totalSessions}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Last Active</p>
                <p className="text-xs font-medium text-gray-900">
                  {user.lastActiveDate.toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Analytics Button */}
            <button
              onClick={() => navigate(`/user-detail/${user.userId}`)}
              className="w-full flex items-center justify-center space-x-2 px-3 py-3 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-colors shadow-sm mt-auto"
              style={{ backgroundColor: '#002E2C' }}
            >
              <BarChart className="w-4 h-4" />
              <span>Detailed Analytics</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserActivity;
