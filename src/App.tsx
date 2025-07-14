import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Lists from './pages/Lists';
import Campaigns from './pages/Campaigns';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';
import Payments from './pages/Payments';
import Domains from './pages/Domains';
import Settings from './pages/Settings';
import UserActivity from './pages/UserActivity';
import Workflows from './pages/Workflows';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <CRMProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route path="/user-activity" element={<UserActivity />} />
                      <Route path="/lists" element={<Lists />} />
                      <Route path="/campaigns" element={<Campaigns />} />
                      <Route path="/workflows" element={<Workflows />} />
                      <Route path="/templates" element={<Templates />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/domains" element={<Domains />} />
                      <Route path="/settings" element={<Settings />} />
                    </Routes>
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </CRMProvider>
  );
}

export default App;