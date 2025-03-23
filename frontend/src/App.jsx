import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/DashboardPage";
import Calendar from "./components/Calendar";
import StudentForm from './components/StudentForm';
import StudentList from './components/StudentList';

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
        <Route path="/add-student" element={<StudentForm />} />
        <Route path="/students" element={<StudentList />} />
      </Routes>
    </div>
    </>
  )
}

export default App
