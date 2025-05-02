import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Lock, X, Briefcase } from 'lucide-react';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';

function LoginExaminer() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5001/api/examiners/login', {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userEmail', email);
        navigate('/profile/:id');
      }
    } catch (error) {
      console.error("Error during login:", error);
      console.log("Full error object:", error);

      if (error.response) {
        console.log("Error response data:", error.response.data);
        const errorMessage = error.response.data.message || 'Invalid credentials. Please try again.';
        toast.error(errorMessage);
      } else if (error.request) {
        console.log("Error request:", error.request);
        toast.error('Network error. Please try again later.');
      } else {
        console.log("Unexpected error:", error);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-1">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800">
          <div className="w-full h-full flex flex-col items-center justify-center text-white p-12">
            <Briefcase className="w-32 h-32 mb-8" />
            <h2 className="text-4xl font-bold mb-4">AutoShed Presentation Scheduling System</h2>
            <p className="text-xl text-center opacity-90">
              Securely access your dashboard and manage your business operations efficiently.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md space-y-8 relative">
            <button
              onClick={() => navigate('/')}
              className="absolute top-0 right-0 p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <UserCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Email address"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 bg-gray-100 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          &copy; {new Date().getFullYear()} AutoShed Presentation Scheduling System. All rights reserved.
        </p>
      </footer>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}

export default LoginExaminer;
