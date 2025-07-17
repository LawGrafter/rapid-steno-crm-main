import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Mail,
  PenTool,
  BarChart3,
  CreditCard,
  Globe,
  Settings,
  Zap,
  List,
  Activity,
  Lock
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', locked: false },
    { path: '/leads', icon: Users, label: 'Leads', locked: false },
    { path: '/user-activity', icon: Activity, label: 'User Activity', locked: false },
    { path: '/lists', icon: List, label: 'Lists', locked: true },
    { path: '/campaigns', icon: Mail, label: 'Campaigns', locked: true },
    { path: '/workflows', icon: Zap, label: 'Workflows', locked: true },
    { path: '/templates', icon: PenTool, label: 'Templates', locked: true },
    { path: '/analytics', icon: BarChart3, label: 'Analytics', locked: true },
    { path: '/payments', icon: CreditCard, label: 'Payments', locked: true },
    { path: '/domains', icon: Globe, label: 'Domains', locked: true },
    { path: '/settings', icon: Settings, label: 'Settings', locked: true }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 w-64 h-screen bg-primary text-white flex flex-col shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
      <div className="p-6 border-b border-primary-light">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Rapid Steno</h1>
            <p className="text-sm text-gray-300">CRM Dashboard</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.locked) {
            return (
              <div
                key={item.path}
                className="flex items-center space-x-3 px-6 py-3 text-sm font-medium text-gray-500 cursor-not-allowed opacity-60"
                title="This feature is locked"
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-6 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-light text-white border-r-4 border-accent'
                  : 'text-gray-300 hover:bg-primary-light hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      </div>
    </>
  );
};

export default Sidebar;