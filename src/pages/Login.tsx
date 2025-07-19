import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { Eye, EyeOff, Mail, Lock, User, Calendar } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useCRM();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBirthdayVerification, setShowBirthdayVerification] = useState(false);
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [birthdayError, setBirthdayError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (result.error) {
        setError(result.error.message || 'An error occurred');
      } else {
        // Show birthday verification instead of navigating directly
        setShowBirthdayVerification(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleBirthdayVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setBirthdayError('');

    // Check if birthday matches (30 October)
    if (day === '30' && month === '10') {
      navigate('/dashboard');
    } else {
      setBirthdayError('Incorrect birthday. Please try again.');
    }
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));

  if (showBirthdayVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#002E2C]/10 to-[#002E2C]/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-[#002E2C]/10 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-[#002E2C]" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">
                Extra Verification
              </h2>
              <p className="text-gray-600 mt-2">
                Please enter your birthday for additional security
              </p>
            </div>

            {/* Birthday Form */}
            <form onSubmit={handleBirthdayVerification} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                    Day
                  </label>
                  <select
                    id="day"
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002E2C] focus:border-transparent"
                    required
                  >
                    <option value="">Select Day</option>
                    {days.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    id="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002E2C] focus:border-transparent"
                    required
                  >
                    <option value="">Select Month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {birthdayError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{birthdayError}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#002E2C] text-white py-3 px-4 rounded-lg hover:bg-[#002E2C]/90 focus:ring-2 focus:ring-[#002E2C] focus:ring-offset-2 transition-colors font-medium"
              >
                Verify & Continue
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowBirthdayVerification(false);
                  setEmail('');
                  setPassword('');
                  setError('');
                  setDay('');
                  setMonth('');
                  setBirthdayError('');
                }}
                className="text-[#002E2C] hover:text-[#002E2C]/80 font-medium text-sm"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002E2C]/10 to-[#002E2C]/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-[#002E2C]/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-[#002E2C]" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>
            <p className="text-gray-600 mt-2">
              Sign in to your Rapid Steno CRM account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002E2C] focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#002E2C] focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#002E2C] text-white py-3 px-4 rounded-lg hover:bg-[#002E2C]/90 focus:ring-2 focus:ring-[#002E2C] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;