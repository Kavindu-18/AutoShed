import { useState, useEffect } from "react";
import { jsPDF } from "jspdf"; // Import jsPDF
import Sidebar from "../Sidebar"; // Import Sidebar

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
    const doc = new jsPDF("landscape"); // Set orientation to landscape
  
    // Title and Heading
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);  // Larger title font size
    doc.text("Examiners Report", 14, 20);
  
    // Subheading with Date
    const currentDate = new Date().toLocaleDateString();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text(`Generated on: ${currentDate}`, 14, 30);
  
    // Add a Line Divider
    doc.setLineWidth(0.5);
    doc.line(14, 35, 280, 35);  // Adjust line to fit landscape
  
    // Space before table
    let y = 45;
  
    // Table Header
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);  // White text for header
    doc.setFillColor(0, 123, 255);  // Vibrant blue background for headers
    doc.rect(14, y, 270, 12, 'F'); // Background for headers
  
    // Headers with more space between them
    doc.setFont("helvetica", "bold");
    doc.text("ID", 14, y + 8);
    doc.text("Full Name", 50, y + 8);
    doc.text("Email", 120, y + 8);
    doc.text("Position", 170, y + 8);
    doc.text("Department", 210, y + 8);
  
    y += 15; // Move to the next row after headers
  
    // Table rows
    doc.setFont("helvetica", "normal");
    examiners.forEach((examiner, index) => {
      // Alternate row colors
      doc.setFillColor(index % 2 === 0 ? 240 : 230, 240, 255); // Light blue background
      doc.rect(14, y, 270, 12, 'F'); // Add background color to row
  
      doc.setTextColor(0, 0, 0); // Black color for text
  
      // Wrap text if it's too long (ID, Full Name, Email, Position, Department)
      const idText = doc.splitTextToSize(examiner.id.toString(), 20);
      const nameText = doc.splitTextToSize(`${examiner.fname} ${examiner.lname}`, 50);
      const emailText = doc.splitTextToSize(examiner.email, 50);
      const positionText = doc.splitTextToSize(examiner.position, 40);
      const departmentText = doc.splitTextToSize(examiner.department, 40);
  
      // Draw text with wrapping
      doc.text(idText, 14, y + 7);
      doc.text(nameText, 50, y + 7);
      doc.text(emailText, 120, y + 7);
      doc.text(positionText, 170, y + 7);
      doc.text(departmentText, 210, y + 7);
  
      y += 20; // Adjust row height for better readability
  
      // If y exceeds the bottom of the page, create a new page
      if (y > 200) {
        doc.addPage();
        y = 20; // Reset y position for new page
      }
    });
  
    // Add Footer
    const footerText = "Confidential - For Internal Use Only";
    doc.setFontSize(10);
    doc.setTextColor(150); // Light gray text for footer
    doc.text(footerText, 14, 290); // Footer position
  
    // Add page number
    const pageCount = doc.internal.getNumberOfPages();
    doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${pageCount}`, 250, 290);
  
    // Save the document
    doc.save("examiners-report.pdf");
  };
  
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
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

        {/* Examiner Details Table */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">Examiner Details</h2>
          <table className="min-w-full mt-4 border-collapse table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Position</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase">Department</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {examiners.map((examiner) => (
                <tr key={examiner.id} className="hover:bg-gray-100 transition">
                  <td className="px-6 py-4">{examiner.id}</td>
                  <td className="px-6 py-4">{examiner.fname} {examiner.lname}</td>
                  <td className="px-6 py-4">{examiner.email}</td>
                  <td className="px-6 py-4">{examiner.position}</td>
                  <td className="px-6 py-4">{examiner.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
