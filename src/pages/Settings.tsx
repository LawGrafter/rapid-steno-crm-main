import { useState } from 'react';
import { User, Bell, Shield, Users, Mail } from 'lucide-react';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email Settings', icon: Mail },
    { id: 'team', label: 'Team', icon: Users },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Profile Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  defaultValue="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  defaultValue="Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  defaultValue="john@rapidsteno.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  defaultValue="+1234567890"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                defaultValue="Rapid Steno"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                rows={4}
                defaultValue="CRM Administrator for Rapid Steno shorthand software platform."
              />
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Get notified about campaign results and new leads</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Push Notifications</h4>
                  <p className="text-sm text-gray-500">Receive browser notifications for important updates</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Campaign Alerts</h4>
                  <p className="text-sm text-gray-500">Get alerts when campaigns are sent or completed</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Lead Alerts</h4>
                  <p className="text-sm text-gray-500">Notify when new high-value leads are captured</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Change Password</h4>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
                  Enable
                </button>
              </div>
            </div>
          </div>
        );
      case 'email':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Email Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default From Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  defaultValue="Rapid Steno Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default From Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  defaultValue="hello@rapidsteno.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reply-To Email</label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  defaultValue="support@rapidsteno.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Signature</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  rows={4}
                  defaultValue="Best regards,&#10;The Rapid Steno Team&#10;&#10;Visit us at: https://rapidsteno.com"
                />
              </div>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
              <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
                Invite Member
              </button>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="divide-y divide-gray-200">
                {[
                  { name: 'John Smith', email: 'john@rapidsteno.com', role: 'Admin' },
                  { name: 'Sarah Johnson', email: 'sarah@rapidsteno.com', role: 'Manager' },
                  { name: 'Mike Davis', email: 'mike@rapidsteno.com', role: 'User' }
                ].map((member, index) => (
                  <div key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                        {member.role}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <User className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account and application preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white rounded-xl shadow-sm border border-gray-200">
          <nav className="p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
          
          <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end space-x-2">
            <button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;