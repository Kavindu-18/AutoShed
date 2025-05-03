import { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/Loginpage";
import AdminLoginPage from "./pages/adminlogin";
import Dashboard from "./pages/DashboardPage";
import Calendar from "./components/Calendar";
import Examiner from "./pages/ExaminerDashboard";
import AddExaminer from "./components/Examiner/addexaminer";
import ViewExaminers from "./components/Examiner/viewexaminers";
import ExaminerProfile from "./components/Examiner/ExaminerProfile";
import UpdateExaminer from "./components/Examiner/updateexaminer";
import GenerateReport from "./components/Examiner/Report";
import HomePageExaminer from "./pages/HomePageExaminer";
import StudentForm from "./components/StudentForm";
import StudentList from "./components/StudentList";
import StudentHomePage from './pages/StudentHomePage';
import Notify from "./pages/NotifyAdminPage";
import Users from "./pages/users";
import AddUser from "./components/AddUser";
import { Toaster } from "react-hot-toast";
import Fogetpassword from './pages/fogetpassword';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      {/* Global Toaster */}
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile/:id" element={<HomePageExaminer />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/users" element={<Users />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/Examiner" element={<Examiner />} />
          <Route path="/addexaminer" element={<AddExaminer />} />
          <Route path="/viewexaminers" element={<ViewExaminers />} />
          <Route path="/examiners/view/:id" element={<ExaminerProfile />} />
          <Route path="/examiners/edit/:id" element={<UpdateExaminer />} />
          <Route path="/generate-report" element={<GenerateReport />} />
          <Route path="/notify" element={<Notify />} />
          <Route path="/StudentView" element={<StudentHomePage />} />
          <Route path="/add-student" element={<StudentForm />} />
          <Route path="/students" element={<StudentList />} />
          <Route path="/fogetpassword" element={<Fogetpassword />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
