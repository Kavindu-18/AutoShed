import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../api/userApi";

function RegisterPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerUser(user);
    if (result.error) {
      setMessage(result.error);
    } else {
      setMessage("User registered successfully!");
      setTimeout(() => navigate("/dashboard"), 1500); // Redirect to dashboard
    }
  };

  return (
   <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-gray-800">Register</h2>
        {message && <p className="text-center text-red-500">{message}</p>}
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="email"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setUser({ ...user, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="password"
            className="w-full p-3 border border-gray-300 rounded-lg"
            onChange={(e) => setUser({ ...user, password: e.target.value })}
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
