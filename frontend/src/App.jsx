import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/DashboardPage";
import Calendar from "./components/Calendar";
import Notices from "./pages/NoticePage";

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path ="/calendar" element={<Calendar />} />
        <Route path ="/notices" element={<Notices />} />
      </Routes>
    </div>
    </>
  )
}

export default App
