import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CRMProvider } from './context/CRMContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import UserActivity from './pages/UserActivity';

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