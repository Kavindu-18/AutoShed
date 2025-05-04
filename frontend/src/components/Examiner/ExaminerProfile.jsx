import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Mail, Phone, Building2, BookOpen, DollarSign, Award, Calendar, CheckCircle, XCircle, Briefcase, MapPin, Users, FileDown, Clock } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
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

  // Mock data for schedule and groups (replace with actual API calls)
  const scheduleData = [
    { date: "2025-03-20", time: "10:00 AM", location: "Room 301", presentation: "Final Year Project" },
    { date: "2025-03-22", time: "02:00 PM", location: "Lab 205", presentation: "Research Proposal" },
    { date: "2025-03-25", time: "11:30 AM", location: "Conference Hall", presentation: "Thesis Defense" }
  ];

  const studentGroups = [
    { id: "G001", members: ["John Doe", "Jane Smith"], project: "AI in Healthcare" },
    { id: "G002", members: ["Alice Johnson", "Bob Wilson"], project: "Smart City Solutions" },
    { id: "G003", members: ["Carol Brown", "David Lee"], project: "Renewable Energy Systems" }
  ];

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
    e.preventDefault();
    const newSalary = basicSalary + (basicSalary * (bonusPercentage / 100));

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
        setExaminer((prevExaminer) => ({
          ...prevExaminer,
          salary: newSalary,
        }));
        setShowModal(false);
        setSalaryAssigned(true);
        setTimeout(() => setSalaryAssigned(false), 3000);
      })
      .catch((error) => console.error("Error updating salary:", error));
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Modern Design for PDF
    const primaryColor = "#3b82f6"; // Blue 600
    const secondaryColor = "#4f46e5"; // Indigo 600
    const textColor = "#374151"; // Gray 800

    // Header
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, "F");
    doc.setFontSize(18);
    doc.setTextColor("#ffffff");
    doc.text("Examiner Report", 20, 20);

    // Examiner Details
    doc.setFontSize(14);
    doc.setTextColor(textColor);
    doc.text(`Name: ${examiner.fname} ${examiner.lname}`, 20, 45);
    doc.text(`Position: ${examiner.position}`, 20, 55);
    doc.text(`Department: ${examiner.department}`, 20, 65);
    doc.text(`Email: ${examiner.email}`, 20, 75);
    doc.text(`Phone: ${examiner.phone}`, 20, 85);
    doc.text(`Salary: Rs ${examiner.salary}`, 20, 95);

    // Schedule Table
    doc.setFontSize(16);
    doc.text("Scheduled Presentations", 20, 115);
    autoTable(doc, {
      startY: 125,
      head: [["Date", "Time", "Location", "Presentation"]],
      body: scheduleData.map(item => [
        item.date,
        item.time,
        item.location,
        item.presentation
      ]),
      headStyles: { fillColor: secondaryColor, textColor: "#ffffff", fontStyle: "bold" },
      bodyStyles: { textColor: textColor },
      alternateRowStyles: { fillColor: "#f9fafb" }
    });

    // Student Groups Table
    const tableY = doc.lastAutoTable.finalY + 20;
    doc.addPage();
    doc.setFontSize(16);
    doc.text("Student Groups", 20, 20);
    autoTable(doc, {
      startY: 30,
      head: [["Group ID", "Members", "Project"]],
      body: studentGroups.map(group => [
        group.id,
        group.members.join(", "),
        group.project
      ]),
      headStyles: { fillColor: secondaryColor, textColor: "#ffffff", fontStyle: "bold" },
      bodyStyles: { textColor: textColor },
      alternateRowStyles: { fillColor: "#f9fafb" }
    });

    // Save the PDF
    doc.save(`examiner_report_${examiner.fname}_${examiner.lname}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!examiner) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-red-500 text-2xl font-semibold">Examiner Not Found</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center rounded-2xl text-4xl font-bold shadow-lg transform hover:scale-105 transition-transform">
                {examiner.fname.charAt(0)}{examiner.lname.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{examiner.fname} {examiner.lname}</h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <span className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    {examiner.position}
                  </span>
                  <span className={`flex items-center gap-2 px-4 py-1 rounded-full ${
                    examiner.availability === "true"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}>
                    {examiner.availability === "true" 
                      ? <CheckCircle className="w-5 h-5" />
                      : <XCircle className="w-5 h-5" />
                    }
                    {examiner.availability === "true" ? "Available" : "Not Available"}
                  </span>
                </div>
                <button
                  onClick={generatePDF}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl flex items-center gap-2 hover:from-green-700 hover:to-green-800 transition-all shadow-lg"
                >
                  <FileDown className="w-5 h-5" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Award className="w-6 h-6 text-blue-600" />
                Personal Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-lg text-gray-900">{examiner.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-lg text-gray-900">{examiner.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Current Salary</p>
                    <p className="text-lg text-gray-900">Rs {examiner.salary}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
                >
                  Assign Salary
                </button>
              </div>
            </div>

            {/* Academic Details */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
                Academic Details
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Department</p>
                    <p className="text-lg text-gray-900">{examiner.department}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <p className="text-sm text-gray-500">Courses</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examiner.courses.length > 0 ? (
                      examiner.courses.map((course, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {course}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No courses assigned</span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 mb-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <p className="text-sm text-gray-500">Modules</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {examiner.modules.length > 0 ? (
                      examiner.modules.map((module, index) => (
                        <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                          {module}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No modules assigned</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-blue-600" />
              Scheduled Presentations
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Time</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Location</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Presentation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {scheduleData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{item.date}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        {item.time}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        {item.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.presentation}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Groups Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-blue-600" />
              Student Groups
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {studentGroups.map((group) => (
                <div key={group.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-blue-600">{group.id}</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {group.members.length} members
                    </span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500">Members:</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {group.members.map((member, index) => (
                        <li key={index}>{member}</li>
                      ))}
                    </ul>
                    <p className="text-sm font-medium text-gray-500 mt-4">Project:</p>
                    <p className="text-gray-900">{group.project}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Salary Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full m-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Assign Salary</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                  <input
                    type="number"
                    placeholder="Enter basic salary"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onChange={(e) => setBasicSalary(parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bonus Percentage</label>
                  <input
                    type="number"
                    placeholder="Enter bonus percentage"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    onChange={(e) => setBonusPercentage(parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all"
                    onClick={handleAssignSalary}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Toast */}
        {salaryAssigned && (
          <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-500 ease-out animate-fade-in-up">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <span className="font-medium">Salary Assigned Successfully!</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}ew