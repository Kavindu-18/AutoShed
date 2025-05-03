import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStudents, deleteStudent } from "../api/studentApi";
import Sidebar from "../components/Sidebar";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const StudentList = ({ refresh }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, [refresh]);

  const fetchStudents = async () => {
    const data = await getStudents();
    setStudents(data);
    setFilteredStudents(data);
  };

  const handleDelete = async (id) => {
    await deleteStudent(id);
    fetchStudents();
    setSelectedStudent(null);
  };

  const handleEdit = (student) => {
    navigate("/add-student", { state: { student } });
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilters(query, selectedSpecialization);
  };

  const handleSpecializationFilter = (e) => {
    const specialization = e.target.value;
    setSelectedSpecialization(specialization);
    applyFilters(searchQuery, specialization);
  };

  const applyFilters = (searchQuery, specialization) => {
    let filtered = students.filter((student) =>
      student.name.toLowerCase().includes(searchQuery) ||
      student.studentId.toLowerCase().includes(searchQuery) ||
      student.faculty.toLowerCase().includes(searchQuery) ||
      student.specialization.toLowerCase().includes(searchQuery) ||
      student.year.toString().includes(searchQuery)
    );

    if (specialization) {
      filtered = filtered.filter((student) =>
        student.specialization === specialization
      );
    }

    setFilteredStudents(filtered);
  };

  const getUniqueSpecializations = () => {
    const specializations = students.map((s) => s.specialization);
    return [...new Set(specializations)];
  };

  const groupStudentsByFaculty = (students) => {
    return students.reduce((acc, student) => {
      const { faculty } = student;
      if (!acc[faculty]) acc[faculty] = [];
      acc[faculty].push(student);
      return acc;
    }, {});
  };

  const handleGenerateReport = () => {
    const doc = new jsPDF();
    doc.text("Student Report", 14, 15);

    const tableColumn = ["Name", "Student ID", "Faculty", "Specialization", "Year"];
    const tableRows = filteredStudents.map((student) => [
      student.name,
      student.studentId,
      student.faculty,
      student.specialization,
      student.year.toString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [52, 152, 219] },
    });

    doc.save("Student_Report.pdf");
  };

  const groupedStudents = groupStudentsByFaculty(filteredStudents);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gradient-to-r from-blue-200 via-purple-150 to-pink-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Student List</h2>

          <button
            onClick={() => navigate("/add-student")}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition mb-4"
          >
            Back to Add Student
          </button>

          <div className="flex space-x-4 mb-6">
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-80 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={selectedSpecialization}
              onChange={handleSpecializationFilter}
              className="w-80 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Specializations</option>
              {getUniqueSpecializations().map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>

            <button
              onClick={handleGenerateReport}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Generate Report
            </button>
          </div>

          {Object.keys(groupedStudents).map((faculty) => (
            <div key={faculty} className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{faculty}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedStudents[faculty].map((student) => (
                  <div
                    key={student._id}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl cursor-pointer"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{student.name}</h3>
                    <p className="text-sm text-gray-600 mb-1"><strong>Student ID:</strong> {student.studentId}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Faculty:</strong> {student.faculty}</p>
                    <p className="text-sm text-gray-600 mb-1"><strong>Specialization:</strong> {student.specialization}</p>
                    <p className="text-sm text-gray-600"><strong>Year:</strong> {student.year}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {selectedStudent && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedStudent.name}</h2>
                <div className="space-y-3">
                  <p><strong>Student ID:</strong> {selectedStudent.studentId}</p>
                  <p><strong>Age:</strong> {selectedStudent.age}</p>
                  <p><strong>Address:</strong> {selectedStudent.address}</p>
                  <p><strong>Email:</strong> {selectedStudent.email}</p>
                  <p><strong>Contact No:</strong> {selectedStudent.contactNo}</p>
                  <p><strong>Faculty:</strong> {selectedStudent.faculty}</p>
                  <p><strong>Specialization:</strong> {selectedStudent.specialization}</p>
                  <p><strong>Year:</strong> {selectedStudent.year}</p>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => handleEdit(selectedStudent)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(selectedStudent._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentList;
