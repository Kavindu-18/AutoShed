import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, LogIn, ArrowRight } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast'; // Import react-hot-toast

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.Message === 'Login successful') {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        toast.success('AdminLogin successfully'); // Show success toast

        setTimeout(() => {
          navigate('/dashboard');
        }, 2000); // Wait for 2 seconds before navigating
      } else {
        toast.error(data.Message || 'Login failed, please try again.'); // Show error toast
      }
    } catch (err) {
      toast.error('An error occurred. Please check your connection.'); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Cover Image and Welcome Text */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1554189097-ffe88e998a2b?auto=format&fit=crop&q=80"
          alt="Office Interior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-indigo-900/90"></div>
        <div className="relative w-full flex flex-col justify-center px-12">
          <h2 className="text-5xl font-bold text-white mb-6">Welcome to<br />AutoShed Presentation Sheduling System</h2>
          <p className="text-lg text-purple-100 mb-8">Manage your business operations efficiently with our powerful admin tools and intuitive interface.</p>
          <div className="flex gap-4">
            <div className="w-12 h-1 bg-purple-400 rounded-full"></div>
            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
            <div className="w-12 h-1 bg-white/20 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-purple-50">
        <div className="w-full max-w-md space-y-8 relative">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-20 animate-blob animation-delay-2000"></div>
          
          <div className="relative">
            {/* Logo and Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-[2px] mb-4 shadow-xl">
                <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
                  <LogIn className="w-8 h-8 text-purple-600" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">WELCOME</h2>
              <p className="mt-2 text-gray-600">Sign in to access your administrative account and manage your platform efficiently.</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="email">
                  <Mail className="w-4 h-4" />
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2" htmlFor="password">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white/50 backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group w-full py-3 px-4 rounded-xl text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="font-semibold">Sign in</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
              </div>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm text-gray-600">
              Autoshed?{' '}
              <button className="font-semibold text-purple-600 hover:text-purple-500 transition-colors duration-200">
                Support
              </button>
            </p>
          </div>
        </div>
      </div>

      <Toaster position="top-right" /> {/* Toaster component to show the toast notifications at top-right */}
    </div>
  );
}
