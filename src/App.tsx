import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import ProtectedRoute from './components/ProtectedRoute';
import LockedRoute from './components/LockedRoute';
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
import TestIntegration from './pages/TestIntegration';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <CRMProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Dashboard />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/leads" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Leads />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/user-activity" element={
            <ProtectedRoute>
              <LockedRoute featureName="User Activity">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <UserActivity />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/lists" element={
            <ProtectedRoute>
              <LockedRoute featureName="Lists">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Lists />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/campaigns" element={
            <ProtectedRoute>
              <LockedRoute featureName="Campaigns">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Campaigns />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/workflows" element={
            <ProtectedRoute>
              <LockedRoute featureName="Workflows">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Workflows />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute>
              <LockedRoute featureName="Templates">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Templates />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <LockedRoute featureName="Analytics">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Analytics />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <LockedRoute featureName="Payments">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Payments />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/domains" element={
            <ProtectedRoute>
              <LockedRoute featureName="Domains">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Domains />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <LockedRoute featureName="Settings">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <Settings />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/test-integration" element={
            <ProtectedRoute>
              <LockedRoute featureName="Test Integration">
                <div className="min-h-screen bg-gray-50 font-lexend">
                  <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <div className="lg:ml-64 flex flex-col min-h-screen">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <main className="flex-1 overflow-auto">
                      <TestIntegration />
                    </main>
                  </div>
                </div>
              </LockedRoute>
            </ProtectedRoute>
          } />
          <Route path="/" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Dashboard />
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