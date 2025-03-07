import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/DashboardPage";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
    </>
  )
}

export default App
