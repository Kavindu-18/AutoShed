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

        // Validate response
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        // Parse the JSON data
        const data = await response.json();
        console.log("API Response:", data); // Debugging line

        // Counting total, active, and inactive examiners
        const total = data.length;
        
        // Use string comparison
        const active = data.filter((examiner) => examiner.availability === "true").length; // Active examiners
        const inactive = data.filter((examiner) => examiner.availability === "false").length; // Inactive examiners

        // Debugging logs for checking counts
        console.log(`Total examiners: ${total}`);
        console.log(`Active examiners: ${active}`);
        console.log(`Inactive examiners: ${inactive}`);

        // Update state with counts
        setTotalExaminers(total);
        setActiveExaminers(active);
        setInactiveExaminers(inactive);

        // Update chart data
        updateChartData(total, active, inactive);
      } catch (error) {
        console.error("Error fetching examiners:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    const updateChartData = (total, active, inactive) => {
      const labels = getLabelsByTimeFrame(timeFrame);
      const totalData = Array(labels.length).fill(0).map(() => Math.floor(Math.random() * total));
      const activeData = Array(labels.length).fill(1).map(() => Math.floor(Math.random() * active)); // Fixed data representation
      const inactiveData = Array(labels.length).fill(1).map(() => Math.floor(Math.random() * inactive)); // Fixed data representation

      setChartData({
        labels,
        datasets: [
          { label: "Total Examiners", data: totalData, borderColor: "#9333ea", tension: 0.4, fill: false },
          { label: "Active Examiners", data: activeData, borderColor: "#6d28d9", tension: 0.4, fill: false },
          { label: "Inactive Examiners", data: inactiveData, borderColor: "#e53e3e", tension: 0.4, fill: false },
        ],
      });
    };

    const getLabelsByTimeFrame = (timeFrame) => {
      switch (timeFrame) {
        case 'daily':
          return ['Feb 1', 'Feb 2', 'Feb 3', 'Feb 4', 'Feb 5', 'Feb 6', 'Feb 7', 'Feb 8', 'Feb 9', 'Feb 10', 'Feb 11', 'Feb 12', 'Feb 13', 'Feb 14', 'Feb 15', 'Feb 16', 'Feb 17', 'Feb 18', 'Feb 19', 'Feb 20', 'Feb 21', 'Feb 22', 'Feb 23', 'Feb 24', 'Feb 25', 'Feb 26', 'Feb 27', 'Feb 28', 'Feb 29']; // Considering leap year 2025
        case 'weekly':
          return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
        case 'monthly':
          return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        case 'yearly':
          return ['2023', '2024', '2025'];
        default:
          return [];
      }
    };

    fetchExaminers();
  }, [timeFrame]); // Adding timeFrame as a dependency to update chart data on change

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
              <StatCard icon={<FaFileAlt className="text-red-500 text-3xl mr-4" />} title="Pending Reports" value={15} />
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