import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, Loader2, Users } from "lucide-react";
import Sidebar from "../Sidebar";

export default function GenerateReport() {
  const [examiners, setExaminers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5001/api/examiners")
      .then((response) => response.json())
      .then((data) => {
        // Filter examiners by role == "examiner"
        const filteredExaminers = data.filter(examiner => examiner.role === "examiner");
        setExaminers(filteredExaminers);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching examiners:", error);
        setLoading(false);
      });
  }, []);

  const generateReport = () => {
    setGenerating(true);
    const doc = new jsPDF("landscape");

    doc.setFillColor(24, 71, 128);
    doc.rect(0, 0, 297, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("Examiners Report", 15, 17);

    doc.setFontSize(12);
    const date = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    doc.text(date, 230, 17);

    doc.setTextColor(90, 90, 90);
    doc.setFontSize(12);
    doc.text("Comprehensive Overview of Examination Personnel", 15, 35);

    const tableData = examiners.map((examiner) => [
      examiner.id,
      `${examiner.fname} ${examiner.lname}`,
      examiner.email,
      examiner.position,
      examiner.department,
    ]);

    autoTable(doc, {
      startY: 45,
      head: [["ID", "Full Name", "Email", "Position", "Department"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [45, 120, 244],
        textColor: 255,
        fontSize: 12,
        fontStyle: "bold",
        halign: "left",
      },
      bodyStyles: {
        fontSize: 11,
        textColor: 50,
        lineWidth: 0.5,
        lineColor: [220, 220, 220],
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
      margin: { top: 45, right: 15, bottom: 40, left: 15 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { cellWidth: 75 },
        3: { cellWidth: 50 },
        4: { cellWidth: 60 },
      },
    });

    doc.save("examiners-report.pdf");
    setGenerating(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Examiner Report</h1>
              <p className="mt-2 text-gray-600">Generate and download comprehensive examiner reports</p>
            </div>
          </div>

          {/* Table to display examiners */}
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto shadow-xl rounded-lg bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">ID</th>
                    <th className="px-6 py-4 text-left">Full Name</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Position</th>
                    <th className="px-6 py-4 text-left">Department</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800">
                  {examiners.map((examiner) => (
                    <tr key={examiner.id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">{examiner.id}</td>
                      <td className="px-6 py-4">{`${examiner.fname} ${examiner.lname}`}</td>
                      <td className="px-6 py-4">{examiner.email}</td>
                      <td className="px-6 py-4">{examiner.position}</td>
                      <td className="px-6 py-4">{examiner.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Download button */}
          <div className="mt-8">
            <button
              onClick={generateReport}
              disabled={generating || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300 ${generating || loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 active:scale-95"}`}
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
              {generating ? "Generating PDF..." : "Download Report"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
