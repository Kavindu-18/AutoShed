import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { FaUserTie, FaUsers, FaFileAlt, FaChartBar } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { format, parseISO } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Examiner() {
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [totalExaminers, setTotalExaminers] = useState(0);
  const [activeExaminers, setActiveExaminers] = useState(0);
  const [inactiveExaminers, setInactiveExaminers] = useState(0);
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExaminers = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5001/api/examiners");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();

        const total = data.length;
        const active = data.filter(e => e.availability === "true").length;
        const inactive = data.filter(e => e.availability === "false").length;

        setTotalExaminers(total);
        setActiveExaminers(active);
        setInactiveExaminers(inactive);

        const grouped = groupByTimeFrame(data, timeFrame);

        setChartData({
          labels: Object.keys(grouped),
          datasets: [
            {
              label: "Total Examiners",
              data: Object.values(grouped).map(g => g.length),
              borderColor: "#9333ea",
              tension: 0.4,
              fill: false,
            },
            {
              label: "Active Examiners",
              data: Object.values(grouped).map(g => g.filter(e => e.availability === "true").length),
              borderColor: "#6d28d9",
              tension: 0.4,
              fill: false,
            },
            {
              label: "Inactive Examiners",
              data: Object.values(grouped).map(g => g.filter(e => e.availability === "false").length),
              borderColor: "#e53e3e",
              tension: 0.4,
              fill: false,
            },
          ],
        });

      } catch (error) {
        console.error("Error fetching examiners:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const groupByTimeFrame = (data, frame) => {
      const grouped = {};

      data.forEach((examiner) => {
        const date = parseISO(examiner.registeredDate || examiner.createdAt || new Date().toISOString());
        let key = "";

        switch (frame) {
          case "daily":
            key = format(date, "yyyy-MM-dd");
            break;
          case "weekly":
            key = format(date, "yyyy-'W'II");
            break;
          case "monthly":
            key = format(date, "MMMM");
            break;
          case "yearly":
            key = format(date, "yyyy");
            break;
          default:
            key = "Unknown";
        }

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(examiner);
      });

      return grouped;
    };

    fetchExaminers();
  }, [timeFrame]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
      title: { display: true, text: "Examiner Statistics" },
    },
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">Examiner Dashboard</h1>
        <h2 className="text-xl font-semibold text-gray-700">Welcome to Examiner Dashboard</h2>
        <p className="text-gray-600 mt-2">Manage your Examiner settings and view analytics here.</p>

        {loading ? (
          <p className="text-gray-600 mt-4">Loading data...</p>
        ) : error ? (
          <p className="text-red-500 mt-4">Error: {error}</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatCard icon={<FaUserTie className="text-blue-500 text-3xl mr-4" />} title="Total Examiners" value={totalExaminers} />
              <StatCard icon={<FaUsers className="text-green-500 text-3xl mr-4" />} title="Active Examiners" value={activeExaminers} />
              <StatCard icon={<FaUsers className="text-red-500 text-3xl mr-4" />} title="Inactive Examiners" value={inactiveExaminers} />
              <StatCard icon={<FaFileAlt className="text-yellow-500 text-3xl mr-4" />} title="Pending Reports" value={totalExaminers} />
            </div>

            <div className="mb-6">
              <label htmlFor="timeFrame" className="text-gray-700 mr-4">Select Time Frame:</label>
              <select
                id="timeFrame"
                className="border border-gray-300 p-2 rounded-md"
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <FaChartBar className="text-indigo-500 text-3xl mr-2" /> Examiner Statistics
              </h3>
              <div style={{ height: "300px" }}>
                <Line data={chartData} options={options} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="mt-4 space-y-2">
                <Link to="/generate-report" className="block text-blue-600 hover:underline">Generate Report</Link>
                <Link to="/viewexaminers" className="block text-blue-600 hover:underline">View Examiners</Link>
                <Link to="/addexaminer" className="block text-blue-600 hover:underline">Add Examiner</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
      {icon}
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
