import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/DashboardPage";
import Calendar from "./components/Calendar";
<<<<<<< HEAD
import Notices from "./pages/NoticePage";
=======
import Examiner from "./pages/ExaminerDashboard";
import AddExaminer from "./components/Examiner/addexaminer";
import ViewExaminers from "./components/Examiner/viewexaminers";
import ExaminerProfile from "./components/Examiner/ExaminerProfile";
import UpdateExaminer from "./components/Examiner/updateexaminer";
import GenerateReport from "./components/Examiner/Report";
import HomePageExaminer from "./pages/HomePage Examiner";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";



>>>>>>> parent of 0b1f3947 (Merge pull request #9 from Kavindu-18/Kavinga_NoticeManagement)

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
<<<<<<< HEAD
        <Route path ="/notify" element={<Notices />} />
=======
        <Route path ="/Examiner" element={<Examiner />} />
        <Route path ="/addexaminer" element={<AddExaminer />} />
        <Route path ="/viewexaminers" element={<ViewExaminers />} />
        <Route path="/examiners/view/:id" element={<ExaminerProfile />} />
        <Route path="/examiners/edit/:id" element={<UpdateExaminer />} />
        <Route path="/generate-report" element={<GenerateReport />} />

        

        <Route path="/add-student" element={<StudentForm />} />
        <Route path="/students" element={<StudentList />} />
       
    
>>>>>>> parent of 0b1f3947 (Merge pull request #9 from Kavindu-18/Kavinga_NoticeManagement)
      </Routes>
    </div>
    </>
  )
}

export default App
