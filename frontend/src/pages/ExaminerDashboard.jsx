import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Link } from "react-router-dom";
import { FaUserTie, FaUsers, FaFileAlt, FaChartBar } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Examiner() {
  const [timeFrame, setTimeFrame] = useState("monthly");

  const monthlyData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: "Total Examiners",
        data: [10, 25, 30, 40, 80, 20, 60, 70, 50, 60, 70, 75],
        fill: false,
        borderColor: "#9333ea", // Purple color
        tension: 0.4,
      },
      {
        label: "Active Examiners",
        data: [15, 50, 50, 60, 50, 10, 90, 60, 50, 60, 80, 65],
        fill: false,
        borderColor: "#6d28d9", // Darker purple color
        tension: 0.4,
      },
    ],
  };

  const weeklyData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Total Examiners",
        data: [5, 20, 15, 30],
        fill: false,
        borderColor: "#9333ea", // Purple color
        tension: 0.4,
      },
      {
        label: "Active Examiners",
        data: [10, 30, 25, 20],
        fill: false,
        borderColor: "#6d28d9", // Darker purple color
        tension: 0.4,
      },
    ],
  };

  const yearlyData = {
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [
      {
        label: "Total Examiners",
        data: [100, 150, 200, 250, 300],
        fill: false,
        borderColor: "#9333ea", // Purple color
        tension: 0.4,
      },
      {
        label: "Active Examiners",
        data: [50, 100, 120, 180, 220],
        fill: false,
        borderColor: "#6d28d9", // Darker purple color
        tension: 0.4,
      },
    ],
  };

  const handleTimeFrameChange = (e) => {
    setTimeFrame(e.target.value);
  };

  const data = timeFrame === "monthly" ? monthlyData : timeFrame === "weekly" ? weeklyData : yearlyData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Examiner Statistics',
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            return context[0].label;
          },
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y;
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'nearest',
    },
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">Examiner Dashboard</h1>
        <h2 className="text-xl font-semibold text-gray-700">Welcome to Examiner Dashboard</h2>
        <p className="text-gray-600 mt-2">Manage your Examiner settings and view analytics here.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaUserTie className="text-blue-500 text-3xl mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Total Examiners</h3>
              <p className="text-2xl font-bold text-gray-900">120</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaUsers className="text-green-500 text-3xl mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Active Examiners</h3>
              <p className="text-2xl font-bold text-gray-900">85</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
            <FaFileAlt className="text-red-500 text-3xl mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Pending Reports</h3>
              <p className="text-2xl font-bold text-gray-900">15</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="timeFrame" className="text-gray-700 mr-4">Select Time Frame:</label>
          <select
            id="timeFrame"
            className="border border-gray-300 p-2 rounded-md"
            value={timeFrame}
            onChange={handleTimeFrameChange}
          >
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
            <FaChartBar className="text-indigo-500 text-3xl mr-2" /> Examiner Statistics ({timeFrame.charAt(0).toUpperCase() + timeFrame.slice(1)})
          </h3>
          <div style={{ height: '300px' }}>
            <Line data={data} options={options} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mt-4 space-y-2">
            <Link to="/generate-report" className="block text-blue-600 hover:underline">Generate Report</Link>
            <Link to="/view-examiners" className="block text-blue-600 hover:underline">View Examiners</Link>
            <Link to="/addexaminer" className="block text-blue-600 hover:underline">Add Examiner</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
