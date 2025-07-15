import { useNavigate } from 'react-router-dom';
import { Search, User, ChevronDown, Menu, Clock } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { useState, useEffect } from 'react';

const Header = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const navigate = useNavigate();
  const { signOut } = useCRM();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

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
    </header>
  );
};

export default Header;