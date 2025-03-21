import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Loginpage";
import Dashboard from "./pages/DashboardPage";
import Calendar from "./components/Calendar";
import Examiner from "./pages/ExaminerDashboard";
import AddExaminer from "./components/Examiner/addexaminer";
import ViewExaminers from "./components/Examiner/viewexaminers";
import ExaminerProfile from "./components/Examiner/ExaminerProfile";
import UpdateExaminer from "./components/Examiner/updateexaminer";
import GenerateReport from "./components/Examiner/Report";




function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path ="/calendar" element={<Calendar />} />
        <Route path ="/Examiner" element={<Examiner />} />
        <Route path ="/addexaminer" element={<AddExaminer />} />
        <Route path ="/viewexaminers" element={<ViewExaminers />} />
        <Route path="/examiners/view/:id" element={<ExaminerProfile />} />
        <Route path="/examiners/edit/:id" element={<UpdateExaminer />} />
        <Route path="/generate-report" element={<GenerateReport />} />
        
    
      </Routes>
    </div>
    </>
  )
}

export default App
