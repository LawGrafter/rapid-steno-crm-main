import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Zap, 
  ArrowRight, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [otpData, setOtpData] = useState({
    otp: ['', '', '', '', '', ''],
    timeLeft: 300 // 5 minutes
  });

  // Mock admin credentials
  const adminCredentials = {
    email: 'admin@rapidsteno.com',
    password: 'admin123'
  };

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && otpData.timeLeft > 0) {
      timer = setTimeout(() => {
        setOtpData(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [step, otpData.timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (loginData.email === adminCredentials.email && loginData.password === adminCredentials.password) {
      setSuccess('Login successful! Sending OTP...');
      setTimeout(() => {
        setStep('otp');
        setIsLoading(false);
        setSuccess('OTP sent to your email address');
      }, 1000);
    } else {
      setError('Invalid email or password');
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otpData.otp];
    newOtp[index] = value;
    setOtpData(prev => ({ ...prev, otp: newOtp }));

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpData.otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const enteredOtp = otpData.otp.join('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock OTP verification (accept 123456 or any 6 digits for demo)
    if (enteredOtp.length === 6) {
      setSuccess('OTP verified successfully! Redirecting...');
      setTimeout(() => {
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/');
      }, 1500);
    } else {
      setError('Please enter a valid 6-digit OTP');
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setOtpData(prev => ({ ...prev, timeLeft: 300, otp: ['', '', '', '', '', ''] }));
    setSuccess('New OTP sent to your email');
    setIsLoading(false);
  };

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-light to-primary-hover flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent rounded-2xl mb-4 shadow-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Rapid Steno</h1>
            <p className="text-gray-200">CRM Dashboard Login</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to access your dashboard</p>
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

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({...loginData, email: e.target.value})}
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
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({...loginData, password: e.target.value})}
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

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-accent border-gray-300 rounded focus:ring-accent" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-accent hover:text-accent-hover">
                  Forgot password?
                </button>
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
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Demo Credentials:</p>
              <p className="text-sm text-blue-700">Email: admin@rapidsteno.com</p>
              <p className="text-sm text-blue-700">Password: admin123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-200 text-sm">
              © 2024 Rapid Steno. All rights reserved.
            </p>
          </div>
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
          <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
          <p className="text-gray-200">Enter the OTP sent to your email</p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">We've sent a 6-digit code to</p>
            <p className="text-accent font-medium">{loginData.email}</p>
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

          <form onSubmit={handleOtpVerification} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otpData.otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Time remaining: <span className="font-medium text-accent">{formatTime(otpData.timeLeft)}</span>
              </p>
              {otpData.timeLeft === 0 ? (
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={isLoading}
                  className="text-accent hover:text-accent-hover font-medium text-sm"
                >
                  Resend OTP
                </button>
              ) : (
                <button
                  type="button"
                  onClick={resendOtp}
                  disabled={isLoading || otpData.timeLeft > 240}
                  className="text-gray-400 text-sm cursor-not-allowed"
                >
                  Resend OTP in {formatTime(otpData.timeLeft)}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otpData.otp.some(digit => !digit)}
              className="w-full bg-accent text-white py-3 rounded-lg hover:bg-accent-hover transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Verify OTP</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setStep('login')}
              className="text-gray-600 hover:text-gray-800 text-sm flex items-center justify-center space-x-1 mx-auto"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to login</span>
            </button>
          </div>

          {/* Demo OTP Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">Demo Mode:</p>
            <p className="text-sm text-blue-700">Enter any 6 digits to proceed</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-200 text-sm">
            © 2024 Rapid Steno. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;