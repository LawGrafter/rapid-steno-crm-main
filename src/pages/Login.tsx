import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCRM } from '../context/CRMContext';
import { supabase } from '../integrations/supabase/client';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle,
  AlertCircle,
  Loader,
  Shield,
  Key,
  Clock,
  Send
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated, loading } = useCRM();
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: ''
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('Redirecting authenticated user to dashboard');
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  // OTP Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // First verify credentials
      const { error } = await signIn(formData.email, formData.password);
      if (error) {
        setError(error.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // If login successful, send OTP
      console.log('Calling send-otp function...');
      const { data, error: otpError } = await supabase.functions.invoke('send-otp', {
        body: { email: formData.email },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('OTP function response:', { data, otpError });

      if (otpError) {
        console.error('OTP function error:', otpError);
        setError(`Failed to send OTP: ${otpError.message}`);
        setIsLoading(false);
        return;
      }

      if (!data?.success) {
        console.error('OTP send failed:', data);
        setError(data?.error || 'Failed to send OTP. Please try again.');
        setIsLoading(false);
        return;
      }

      setSuccess('OTP sent to info@rapidsteno.com. Please check your email.');
      setStep('otp');
      setOtpTimer(600); // 10 minutes
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('Calling verify-otp function...');
      const { data, error: otpError } = await supabase.functions.invoke('verify-otp', {
        body: { 
          email: formData.email,
          otp: formData.otp 
        },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Verify OTP response:', { data, otpError });

      if (otpError) {
        console.error('Verify OTP function error:', otpError);
        setError(`Failed to verify OTP: ${otpError.message}`);
        setIsLoading(false);
        return;
      }

      if (!data?.success) {
        console.error('OTP verification failed:', data);
        setError(data?.error || 'Invalid OTP. Please check and try again.');
        setIsLoading(false);
        return;
      }

      setSuccess('OTP verified! Redirecting to dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Calling resend OTP function...');
      const { data, error: otpError } = await supabase.functions.invoke('send-otp', {
        body: { email: formData.email },
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Resend OTP response:', { data, otpError });

      if (otpError) {
        console.error('Resend OTP function error:', otpError);
        setError(`Failed to resend OTP: ${otpError.message}`);
        return;
      }

      if (!data?.success) {
        console.error('Resend OTP failed:', data);
        setError(data?.error || 'Failed to resend OTP. Please try again.');
        return;
      }

      setSuccess('New OTP sent to info@rapidsteno.com');
      setOtpTimer(600); // Reset timer
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-hover flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-hover flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Rapid Steno CRM</h1>
          <p className="text-gray-200">
            {step === 'login' ? 'Admin Access Portal' : 'OTP Verification'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {step === 'login' ? 'Admin Login' : 'Enter OTP'}
            </h2>
            <p className="text-gray-600">
              {step === 'login' 
                ? 'Sign in to access the internal CRM system'
                : 'Check info@rapidsteno.com for your OTP'
              }
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700 text-sm">{success}</span>
            </div>
          )}

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Email</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                    placeholder="admin@rapidsteno.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-hover transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send OTP</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOTPVerification} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors text-center text-2xl tracking-widest"
                    placeholder="000000"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Enter the 6-digit code sent to info@rapidsteno.com
                </p>
              </div>

              {otpTimer > 0 && (
                <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 text-blue-700">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">OTP expires in: {formatTime(otpTimer)}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || formData.otp.length !== 6}
                className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-hover transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Verify & Access CRM</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  ← Back to Login
                </button>
                <br />
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading || otpTimer > 540} // Allow resend after 1 minute
                  className="text-sm text-accent hover:text-accent-hover underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Admin Notice */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <p className="text-sm text-blue-800 font-medium">
                {step === 'login' ? 'Internal System Access' : 'Secure OTP Verification'}
              </p>
            </div>
            <p className="text-sm text-blue-700">
              {step === 'login' 
                ? 'This is an internal CRM system. Access is restricted to authorized administrators only.'
                : 'OTP has been sent to info@rapidsteno.com for security verification.'
              }
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-200 text-sm">
            © 2024 Rapid Steno. Internal CRM System.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;