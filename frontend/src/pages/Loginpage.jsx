import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // For redirection after login


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Used for redirection in v6

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear any previous errors before making a new request
    setError('');

    const response = await fetch('http://localhost:5001/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.Message === 'Login successful') {
      // Save token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user)); // Store user details if needed

      // Redirect user to a dashboard or home page
      navigate('/dashboard'); // Replace '/dashboard' with the route you want
    } else {
      // Set error if login failed or if any other issues
      setError(data.Message || 'Login failed, please try again.');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-400 to-purple-600">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src={ExaminerLogo} alt="Examiner Logo" className="h-16" />
        </div>
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <button
          type="submit"
          className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300"
        >
          Login
        </button>

        {/* Sign Up Link */}
        <div className="mt-4 text-center">
          <p className="text-gray-600">
            Not a member?{' '}
            <span
              onClick={() => navigate('/Support')}
              className="text-blue-500 hover:underline cursor-pointer"
            >
              Support
            </span>
          </p>
        </div>
      </form>
    </div>
  );
}
