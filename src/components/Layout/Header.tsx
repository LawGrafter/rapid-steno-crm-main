import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronDown, Menu, Clock, RefreshCw, X, Terminal } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useState, useEffect } from 'react';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const navigate = useNavigate();
  const { signOut } = useCRM();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSyncLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    setShowSyncModal(true);
    setSyncLogs([]);
    setSyncStatus('Starting sync process...');
    
    addLog('🚀 Starting MongoDB to Supabase sync...');
    addLog('📡 Connecting to sync server...');
    
    try {
      // Live Render deployment URL
      const response = await fetch('https://sync-crm-data.onrender.com/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      addLog('✅ Connected to sync server');
      addLog('📊 Fetching data from MongoDB...');
      
      const result = await response.json();
      
      if (result.success) {
        addLog(`✅ MongoDB connection successful`);
        addLog(`📊 Found ${result.summary.totalUsers} users in MongoDB`);
        addLog(`📊 Found ${result.summary.totalUsersWithActivities} users with activities`);
        addLog(`✅ Synced ${result.summary.usersSynced} new users`);
        addLog(`✅ Synced ${result.summary.activitiesSynced} activities`);
        addLog(`⏭️ Skipped ${result.summary.usersSkipped} existing users`);
        addLog(`⏭️ Skipped ${result.summary.activitiesSkipped} existing activities`);
        addLog('🎉 Sync completed successfully!');
        
        setSyncStatus(`✅ Sync successful! ${result.summary.activitiesSynced} activities synced`);
        
        // Refresh the page after 3 seconds to show updated data
        setTimeout(() => {
          addLog('🔄 Refreshing CRM to show new data...');
          window.location.reload();
        }, 3000);
      } else {
        addLog(`❌ Sync failed: ${result.error}`);
        setSyncStatus(`❌ Sync failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Connection error: ${errorMessage}`);
      setSyncStatus(`❌ Connection error: ${errorMessage}`);
    } finally {
      setIsSyncing(false);
      // Keep modal open for 8 seconds to show logs
      setTimeout(() => {
        setShowSyncModal(false);
        setSyncLogs([]);
      }, 8000);
      // Clear status after 5 seconds
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads, campaigns, or domains..."
              className="pl-10 pr-4 py-2 w-full sm:w-64 lg:w-96 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Sync Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {showSyncModal ? (
              <Terminal className="w-4 h-4" />
            ) : (
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            )}
            <span className="hidden sm:inline">
              {showSyncModal ? 'View Progress' : (isSyncing ? 'Syncing...' : 'Sync Data')}
            </span>
          </button>
          
          {/* Sync Status */}
          {syncStatus && (
            <div className="text-sm text-gray-600 max-w-xs truncate">
              {syncStatus}
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{currentDateTime.toLocaleDateString()}</span>
            <span>•</span>
            <span>{currentDateTime.toLocaleTimeString()}</span>
          </div>

          <div className="relative group">
            <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-colors">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                <img 
                  src="/netlify/functions/aquib.png" 
                  alt="Mohammad Aquib" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback to user icon if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <User className="w-4 h-4 text-white hidden" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-700">Mohammad Aquib</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </div>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">Mohammad Aquib</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Email:</p>
                  <p className="text-sm text-gray-700">info@rapidsteno.com</p>
                  <p className="text-xs text-gray-500 mb-1 mt-2">Mobile:</p>
                  <p className="text-sm text-gray-700">+91 6387128121</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout System
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Progress Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Sync Progress</h3>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Terminal-like Log Display */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-lg p-4 h-96 overflow-y-auto">
                {syncLogs.length === 0 ? (
                  <div className="text-gray-500">Waiting for sync to start...</div>
                ) : (
                  syncLogs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                )}
                {isSyncing && (
                  <div className="text-yellow-400 animate-pulse">
                    ⏳ Processing...
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {isSyncing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      <span>Sync in progress...</span>
                    </div>
                  ) : (
                    <span>Sync completed</span>
                  )}
                </div>
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;