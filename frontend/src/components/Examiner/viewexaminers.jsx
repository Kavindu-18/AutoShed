import { useState, useEffect } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import Sidebar from "../Sidebar";
import { useNavigate } from "react-router-dom";

export default function ViewExaminers() {
  const [examiners, setExaminers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExaminers, setFilteredExaminers] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const navigate = useNavigate();

  // Fetch data from API
  useEffect(() => {
    fetch("http://localhost:5001/api/examiners")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        return response.json();
      })
      .then((data) => {
        setExaminers(data);
        setFilteredExaminers(data);
      })
      .catch((error) => console.error("Error fetching examiners:", error));
  }, []);

  // Handle search & filtering
  useEffect(() => {
    let results = examiners.filter((examiner) => {
      const fullName = `${examiner.fname} ${examiner.lname}`.toLowerCase();
      const email = examiner.email?.toLowerCase() || "";
      const position = examiner.position?.toLowerCase() || "";
      const department = examiner.department?.toLowerCase() || "";

      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        email.includes(searchTerm.toLowerCase()) ||
        position.includes(searchTerm.toLowerCase()) ||
        department.includes(searchTerm.toLowerCase())
      );
    });

    if (departmentFilter) {
      results = results.filter((examiner) => examiner.department === departmentFilter);
    }

    if (positionFilter) {
      results = results.filter((examiner) => examiner.position === positionFilter);
    }

    setFilteredExaminers(results);
  }, [searchTerm, examiners, departmentFilter, positionFilter]);

  // Delete Function
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this examiner?")) {
      fetch(`http://localhost:5001/api/examiners/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
          setExaminers(examiners.filter((examiner) => examiner.id !== id));
        })
        .catch((error) => console.error("Error deleting examiner:", error));
    }
  };

  // Unique dropdown values
  const uniqueDepartments = [...new Set(examiners.map((examiner) => examiner.department))];
  const uniquePositions = [...new Set(examiners.map((examiner) => examiner.position))];

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <div className="flex-1 flex">
        <Sidebar />
        <div className="p-6 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Examiner List</h1>

          {/* Search & Filters */}
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search examiners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg w-1/3"
            />

            {/* Department Dropdown */}
            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {uniqueDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Position Dropdown */}
            <select
              className="p-2 border border-gray-300 rounded-lg"
              value={positionFilter}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <option value="">All Positions</option>
              {uniquePositions.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Examiner Table */}
          <div className="overflow-hidden bg-white shadow-lg rounded-xl">
            <div className="overflow-x-auto">
              {filteredExaminers.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">Full Name</th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">Position</th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-base font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExaminers.map((examiner) => (
                      <tr key={examiner.id} className="hover:bg-gray-100 transition">
                        <td className="px-6 py-4">{examiner.id}</td>
                        <td className="px-6 py-4">{examiner.fname} {examiner.lname}</td>
                        <td className={`px-6 py-4 font-semibold ${examiner.availability === "true" ? "text-green-600" : "text-red-600"}`}>
                          {examiner.availability === "true" ? "Available" : "Not Available"}
                        </td>
                        <td className="px-6 py-4">{examiner.email}</td>
                        <td className="px-6 py-4">{examiner.position}</td>
                        <td className="px-6 py-4">{examiner.phone}</td>
                        <td className="px-6 py-4">{examiner.department}</td>

                        {/* Action Buttons */}
                        <td className="px-6 py-4 flex gap-3">
                          {/* View Button */}
                          <button
                            onClick={() => navigate(`/examiners/view/${examiner.id}`)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <Eye size={20} />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => navigate(`/examiners/edit/${examiner.id}`)}
                            className="text-purple-600 hover:text-purple-800"
                          >
                            <Edit size={20} />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(examiner.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="p-4 text-center text-gray-500">No examiners found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
