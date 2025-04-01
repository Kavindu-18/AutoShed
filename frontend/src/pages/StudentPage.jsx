import { Link, useLocation } from "react-router-dom";
import StudentList from "../components/StudentList";

const StudentPage = () => {
  const location = useLocation();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Management</h1>
      <Link to="/add-student" className="bg-blue-500 text-white p-2 rounded mb-4 inline-block">
        Add Student
      </Link>
      <StudentList />
    </div>
  );
};

export default StudentPage;