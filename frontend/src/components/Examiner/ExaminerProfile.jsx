import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhone, FaBuilding, FaBook, FaDollarSign } from "react-icons/fa";
import Sidebar from "../Sidebar";

export default function ExaminerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examiner, setExaminer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [basicSalary, setBasicSalary] = useState(0);
  const [bonusPercentage, setBonusPercentage] = useState(0);
  const [salaryAssigned, setSalaryAssigned] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:5001/api/examiners/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch examiner details");
        }
        return response.json();
      })
      .then((data) => {
        setExaminer(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching examiner details:", error);
        setLoading(false);
      });
  }, [id]);

  const handleAssignSalary = (e) => {
    e.preventDefault(); // Prevent page refresh on button click
    
    const newSalary = basicSalary + (basicSalary * (bonusPercentage / 100));

    // Update examiner salary without refreshing the page
    fetch(`http://localhost:5001/api/examiners/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...examiner, salary: newSalary }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update salary");
        }
        return response.json();
      })
      .then((data) => {
        // Directly update the examiner state with the new salary
        setExaminer((prevExaminer) => ({
          ...prevExaminer,
          salary: newSalary,
        }));
        setShowModal(false);  // Close the modal
        setSalaryAssigned(true); // Set the flag to show the success message
        setTimeout(() => setSalaryAssigned(false), 3000); // Hide success message after 3 seconds
      })
      .catch((error) => console.error("Error updating salary:", error));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (!examiner) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-red-500 text-2xl font-semibold">Examiner Not Found</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-gray-100">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg p-10 border border-gray-200">
          <div className="flex items-center space-x-8 border-b pb-6">
            <div className="w-24 h-24 bg-blue-600 text-white flex items-center justify-center rounded-full text-4xl font-bold shadow-md">
              {examiner.fname.charAt(0)}{examiner.lname.charAt(0)}
            </div>
            <div>
              <h1 className="text-4xl font-semibold text-gray-900">{examiner.fname} {examiner.lname}</h1>
              <p className="text-gray-600 text-2xl">{examiner.position}</p>
              <span className={`text-lg font-medium px-4 py-2 rounded-full ${examiner.availability === "true" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                {examiner.availability === "true" ? "Available" : "Not Available"}
              </span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-xl">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Personal Info</h2>
              <p className="flex items-center text-gray-700 mb-4"><FaEnvelope className="mr-3 text-blue-500" /> {examiner.email}</p>
              <p className="flex items-center text-gray-700 mb-4"><FaPhone className="mr-3 text-green-500" /> {examiner.phone}</p>
              <p className="flex items-center text-gray-700"><FaDollarSign className="mr-3 text-yellow-500" /> Salary: Rs {examiner.salary}</p>
              <button onClick={() => setShowModal(true)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition">Assign Salary</button>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md text-xl">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Academic Details</h2>
              <p className="flex items-center text-gray-700 mb-4"><FaBuilding className="mr-3 text-purple-500" /> {examiner.department}</p>
              <p className="flex items-center text-gray-700 mb-4"><FaBook className="mr-3 text-red-500" /> Courses: {examiner.courses.length > 0 ? examiner.courses.join(", ") : "None"}</p>
              <p className="flex items-center text-gray-700"><FaBook className="mr-3 text-blue-500" /> Modules: {examiner.modules.length > 0 ? examiner.modules.join(", ") : "None"}</p>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-2xl font-semibold mb-4">Assign Salary</h2>
              <input type="number" placeholder="Basic Salary" className="w-full mb-3 p-2 border rounded" onChange={(e) => setBasicSalary(parseFloat(e.target.value))} />
              <input type="number" placeholder="Bonus %" className="w-full mb-3 p-2 border rounded" onChange={(e) => setBonusPercentage(parseFloat(e.target.value))} />
              <div className="flex justify-end space-x-2">
                <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleAssignSalary}>Assign</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {salaryAssigned && (
          <div className="fixed bottom-10 right-10 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg">
            <div className="flex items-center">
              <img src="https://via.placeholder.com/30" alt="Success" className="mr-3" />
              <span>Salary Assigned Successfully!</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
