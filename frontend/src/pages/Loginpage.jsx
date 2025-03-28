import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import HomePage from "./HomePage";

const LoginExaminer = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post("http://localhost:5001/api/examiners/login", { email, password });

      // Check if the token exists and then inspect req.user and role
      if (response.data.token) {
        localStorage.setItem("examinerToken", response.data.token);

        // Check if req.user is 'examiner' and role is 'admin'
        if (response.data.examiner.role === "admin") {
          navigate("/dashboard");  // Redirect to the dashboard if the user is an admin
        } else {
          navigate("/");  // Otherwise, navigate to the home page
        }

        alert("Login Successful");
        onClose();
      } else {
        setMessage("Invalid credentials, please try again.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    navigate("/");
    onClose();
  };

  return (
    <div className="relative">
      <HomePage />
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60" onClick={handleClose}>
        <div className="bg-white p-8 rounded-2xl shadow-xl w-96 relative" onClick={(e) => e.stopPropagation()}>
          <button onClick={handleClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Login AutoShed</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2 font-semibold text-gray-700">Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white py-3 rounded-lg text-lg font-semibold hover:from-blue-600 hover:to-blue-800 transition disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
          {message && <p className="mt-4 text-center text-red-500 font-medium">{message}</p>}
        </div>
      </div>
    </div>
  );
};

export default LoginExaminer;
