import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  MoreHorizontal, 
  Edit, 
  Download, 
  Upload,
  Filter,
  Calendar,
  Tag,
  Eye,
  UserPlus,
  Settings
} from 'lucide-react';

interface EmailList {
  id: string;
  name: string;
  description: string;
  subscribers: number;
  activeSubscribers: number;
  tags: string[];
  createdAt: Date;
  lastUpdated: Date;
  status: 'active' | 'archived';
  type: 'static' | 'dynamic';
}

const Lists = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateList, setShowCreateList] = useState(false);
  const [newList, setNewList] = useState({
    name: '',
    description: '',
    type: 'static' as 'static' | 'dynamic'
  });

  // Mock data for email lists
  const [emailLists] = useState<EmailList[]>([
    {
      id: '1',
      name: 'Premium Subscribers',
      description: 'Users interested in premium shorthand features',
      subscribers: 1250,
      activeSubscribers: 1180,
      tags: ['premium', 'high-value'],
      createdAt: new Date('2024-01-10'),
      lastUpdated: new Date('2024-01-25'),
      status: 'active',
      type: 'dynamic'
    },
    {
      id: '2',
      name: 'Newsletter Subscribers',
      description: 'General newsletter and updates list',
      subscribers: 3420,
      activeSubscribers: 3200,
      tags: ['newsletter', 'general'],
      createdAt: new Date('2024-01-05'),
      lastUpdated: new Date('2024-01-24'),
      status: 'active',
      type: 'static'
    },
    {
      id: '3',
      name: 'Trial Users',
      description: 'Users currently on free trial',
      subscribers: 890,
      activeSubscribers: 820,
      tags: ['trial', 'conversion'],
      createdAt: new Date('2024-01-15'),
      lastUpdated: new Date('2024-01-25'),
      status: 'active',
      type: 'dynamic'
    },
    {
      id: '4',
      name: 'Inactive Users',
      description: 'Users who haven\'t engaged in 30+ days',
      subscribers: 450,
      activeSubscribers: 0,
      tags: ['inactive', 'reengagement'],
      createdAt: new Date('2024-01-08'),
      lastUpdated: new Date('2024-01-20'),
      status: 'archived',
      type: 'dynamic'
    }
  ]);

  const filteredLists = emailLists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || list.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'dynamic': return 'bg-blue-100 text-blue-800';
      case 'static': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateList = () => {
    // Add list creation logic here
    console.log('Creating list:', newList);
    setShowCreateList(false);
    setNewList({ name: '', description: '', type: 'static' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Lists</h1>
          <p className="text-gray-600">Manage your subscriber lists and segments</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowCreateList(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create List</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Lists</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{emailLists.length}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {emailLists.reduce((sum, list) => sum + list.subscribers, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Subscribers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {emailLists.reduce((sum, list) => sum + list.activeSubscribers, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Avg. Engagement</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">87.2%</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
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
                placeholder="Search lists..."
                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <button className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
            <button className="border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lists Grid */}
      <div className="space-y-4">
        {filteredLists.map((list) => (
          <div key={list.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(list.status)}`}>
                    {list.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(list.type)}`}>
                    {list.type}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{list.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {list.createdAt.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated: {list.lastUpdated.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="text-gray-400 hover:text-gray-600">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <Settings className="w-4 h-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Total Subscribers</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{list.subscribers.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <UserPlus className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Active</span>
                </div>
                <p className="text-xl font-bold text-green-600">{list.activeSubscribers.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Eye className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Engagement</span>
                </div>
                <p className="text-xl font-bold text-gray-900">
                  {list.subscribers > 0 ? ((list.activeSubscribers / list.subscribers) * 100).toFixed(1) : '0.0'}%
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Last Campaign</span>
                </div>
                <p className="text-sm font-medium text-gray-900">3 days ago</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {list.tags.map((tag, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors text-sm">
                  View Subscribers
                </button>
                <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Create Campaign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLists.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No lists found</h3>
          <p className="text-gray-600 mb-4">Create your first email list to get started</p>
          <button
            onClick={() => setShowCreateList(true)}
            className="bg-accent text-white px-6 py-2 rounded-lg hover:bg-accent-hover transition-colors"
          >
            Create List
          </button>
        </div>
      )}

      {/* Create List Modal */}
      {showCreateList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New List</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Enter list name"
                  value={newList.name}
                  onChange={(e) => setNewList({...newList, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={3}
                  placeholder="Describe this list"
                  value={newList.description}
                  onChange={(e) => setNewList({...newList, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">List Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  value={newList.type}
                  onChange={(e) => setNewList({...newList, type: e.target.value as 'static' | 'dynamic'})}
                >
                  <option value="static">Static - Manual subscriber management</option>
                  <option value="dynamic">Dynamic - Auto-updated based on criteria</option>
                </select>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Static lists</strong> require manual subscriber management, while <strong>dynamic lists</strong> automatically update based on subscriber behavior and criteria.
                </p>
              </div>
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                onClick={() => {
                  setShowCreateList(false);
                  setNewList({ name: '', description: '', type: 'static' });
                }}
                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateList}
                className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lists;