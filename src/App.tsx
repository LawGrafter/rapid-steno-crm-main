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
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <UserActivity />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/lists" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Lists />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/campaigns" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Campaigns />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/workflows" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Workflows />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/templates" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Templates />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Analytics />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Payments />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/domains" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Domains />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <Settings />
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/test-integration" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 font-lexend">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <div className="lg:ml-64 flex flex-col min-h-screen">
                  <Header onMenuClick={() => setSidebarOpen(true)} />
                  <main className="flex-1 overflow-auto">
                    <TestIntegration />
                  </main>
                </div>
              </div>
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