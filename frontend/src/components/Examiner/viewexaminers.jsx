import { useState, useEffect } from "react";
import { Eye, Edit, Trash2, Plus, Search, Filter, FileSpreadsheet } from "lucide-react";
import Sidebar from "../Sidebar";
import { useNavigate } from "react-router-dom";

export default function ViewExaminers() {
  const [examiners, setExaminers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredExaminers, setFilteredExaminers] = useState([]);
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  const navigate = useNavigate();

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

  const uniqueDepartments = [...new Set(examiners.map((examiner) => examiner.department))];
  const uniquePositions = [...new Set(examiners.map((examiner) => examiner.position))];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="flex-1 flex">
        <Sidebar />
        <div className="p-8 w-full max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Examiner Management</h1>
              <p className="text-gray-600">Manage and oversee all examiners in the system</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/addexaminer")}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-lg shadow-purple-200 transition-all duration-200"
              >
                <Plus size={20} />
                Add Examiner
              </button>
              <button
                onClick={() => navigate("/generate-report")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all duration-200"
              >
                <FileSpreadsheet size={20} />
                Generate Report
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-[300px] relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search examiners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                />
              </div>
              <div className="flex gap-4 items-center">
                <Filter size={20} className="text-gray-400" />
                <select
                  className="py-2.5 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="">All Departments</option>
                  {uniqueDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <select
                  className="py-2.5 px-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 transition-all duration-200"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="">All Positions</option>
                  {uniquePositions.map((pos) => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {filteredExaminers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ID</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Full Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Position</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Phone</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Department</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredExaminers.map((examiner) => (
                      <tr key={examiner.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 text-sm text-gray-600">{examiner.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{examiner.fname} {examiner.lname}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            examiner.availability === "true"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {examiner.availability === "true" ? "Available" : "Not Available"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{examiner.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{examiner.position}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{examiner.phone}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                            {examiner.department}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/examiners/view/${examiner.id}`)}
                              className="text-gray-600 hover:text-purple-600 transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => navigate(`/examiners/edit/${examiner.id}`)}
                              className="text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(examiner.id)}
                              className="text-gray-600 hover:text-red-600 transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search size={48} />
                </div>
                <p className="text-gray-600 text-lg">No examiners found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}