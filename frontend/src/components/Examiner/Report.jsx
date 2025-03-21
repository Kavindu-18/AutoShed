import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf"; // Import jsPDF

export default function GenerateReport() {
  const [examiners, setExaminers] = useState([]);

  // Fetch examiners from API
  useEffect(() => {
    fetch("http://localhost:5001/api/examiners")
      .then((response) => response.json())
      .then((data) => {
        setExaminers(data);
      })
      .catch((error) => console.error("Error fetching examiners:", error));
  }, []);

  // Function to generate and download the report as a PDF
  const generateReport = () => {
    const doc = new jsPDF();

    // Set Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Examiners Report", 14, 20);

    // Add a line after the title
    doc.setLineWidth(0.5);
    doc.line(14, 25, 195, 25);

    // Set Table Headers
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("ID", 14, 35);
    doc.text("Full Name", 40, 35);
    doc.text("Status", 100, 35);
    doc.text("Email", 140, 35);
    doc.text("Position", 160, 35);
    doc.text("Phone", 180, 35);

    let y = 45; // Initial Y position for rows

    // Add examiner data to the PDF
    examiners.forEach((examiner) => {
      doc.text(examiner.id.toString(), 14, y);
      doc.text(`${examiner.fname} ${examiner.lname}`, 40, y);
      doc.text(examiner.availability === "true" ? "Available" : "Not Available", 100, y);
      doc.text(examiner.email, 140, y);
      doc.text(examiner.position, 160, y);
      doc.text(examiner.phone, 180, y);

      y += 10; // Move to next row
    });

    // Save PDF
    doc.save("examiners-report.pdf");
  };

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <div className="flex-1 flex">
        <div className="p-6 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Generate Examiner Report</h1>

          {/* Button to generate PDF */}
          <div className="mb-4">
            <button
              onClick={generateReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Download PDF Report
            </button>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-700">Examiner Details</h2>
            <table className="min-w-full mt-4 border-collapse table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Full Name</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Position</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Phone</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examiners.map((examiner) => (
                  <tr key={examiner.id} className="hover:bg-gray-100 transition">
                    <td className="px-6 py-4">{examiner.id}</td>
                    <td className="px-6 py-4">{examiner.fname} {examiner.lname}</td>
                    <td className={`px-6 py-4 font-semibold ${examiner.availability === "true" ? "text-green-600" : "text-red-600"}`}>
                      {examiner.availability === "true" ? "Available" : "Not Available"}
                    </td>
                    <td className="px-6 py-4">{examiner.email}</td>
                    <td className="px-6 py-4">{examiner.position}</td>
                    <td className="px-6 py-4">{examiner.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
