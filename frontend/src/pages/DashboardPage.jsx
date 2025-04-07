import { useState } from "react";
import { Layout } from "antd";
import { 
  UserOutlined, 
  DashboardOutlined, 
  CalendarOutlined, 
  BarChartOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  CarOutlined,
  ToolOutlined
} from "@ant-design/icons";
import Sidebar from "../components/Sidebar";

const { Header, Content } = Layout;

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  
  // Sample data for dashboard widgets
  const recentAppointments = [
    { id: 1, customer: "John Doe", service: "Oil Change", date: "Apr 5, 2025", time: "10:00 AM", status: "Confirmed" },
    { id: 2, customer: "Sarah Smith", service: "Tire Rotation", date: "Apr 6, 2025", time: "2:30 PM", status: "Pending" },
    { id: 3, customer: "Mike Johnson", service: "Brake Inspection", date: "Apr 7, 2025", time: "11:15 AM", status: "Confirmed" },
    { id: 4, customer: "Lisa Garcia", service: "Engine Diagnostics", date: "Apr 7, 2025", time: "3:00 PM", status: "Confirmed" },
    { id: 5, customer: "David Chen", service: "AC Service", date: "Apr 8, 2025", time: "9:30 AM", status: "Pending" }
  ];

  // Sample data for performance analytics
  const monthlyStats = {
    appointments: 124,
    growth: "+12%",
    revenue: "$28,450",
    revenueGrowth: "+8.5%",
    satisfaction: "4.8/5",
    satisfactionGrowth: "+0.3"
  };
  
  return (
    <Layout className="h-screen">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />
      
      <Layout>
        {/* Header */}
        <Header className="bg-white shadow-md px-6 flex justify-between items-center">
          <div className="text-xl font-semibold text-gray-800">AutoShed Dashboard</div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-gray-100 px-4 py-2 rounded-full text-sm w-64 pl-10" 
              />
              <SearchOutlined className="absolute left-3 top-3 text-gray-500" />
            </div>
            <div className="relative cursor-pointer">
              <BellOutlined className="text-xl text-gray-600" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                3
              </span>
            </div>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center">
                <UserOutlined />
              </div>
              <span className="text-gray-700">Admin</span>
            </div>
          </div>
        </Header>
        
        {/* Content */}
        <Content className="p-6 bg-gray-50">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white mb-6">
            <h1 className="text-2xl font-bold">Welcome to AutoShed Dashboard</h1>
            <p className="mt-2 opacity-90">Here's your auto repair shop management overview for today, April 4, 2025</p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-500">Today's Appointments</h3>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <CalendarOutlined className="text-blue-500" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">8</p>
              <p className="text-sm text-green-500 mt-1">+2 from yesterday</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-500">Pending Services</h3>
                <div className="bg-orange-100 p-2 rounded-lg">
                  <DashboardOutlined className="text-orange-500" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">12</p>
              <p className="text-sm text-orange-500 mt-1">4 require attention</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-500">Completed Today</h3>
                <div className="bg-green-100 p-2 rounded-lg">
                  <BarChartOutlined className="text-green-500" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">5</p>
              <p className="text-sm text-green-500 mt-1">On track with schedule</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-500">Available Mechanics</h3>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <UserOutlined className="text-purple-500" />
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">4/6</p>
              <p className="text-sm text-gray-500 mt-1">2 on leave today</p>
            </div>
          </div>
          
          {/* Two-column layout replacing the calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Monthly Performance */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Monthly Performance</h2>
                <select className="bg-gray-100 border-none rounded px-3 py-1 text-sm">
                  <option>April 2025</option>
                  <option>March 2025</option>
                  <option>February 2025</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border-r border-gray-100 pr-4 last:border-0">
                  <h3 className="text-gray-500 text-sm">Total Appointments</h3>
                  <p className="text-2xl font-bold mt-1">{monthlyStats.appointments}</p>
                  <p className="text-sm text-green-500">{monthlyStats.growth} vs last month</p>
                </div>
                
                <div className="border-r border-gray-100 pr-4 last:border-0">
                  <h3 className="text-gray-500 text-sm">Total Revenue</h3>
                  <p className="text-2xl font-bold mt-1">{monthlyStats.revenue}</p>
                  <p className="text-sm text-green-500">{monthlyStats.revenueGrowth} vs last month</p>
                </div>
                
                <div>
                  <h3 className="text-gray-500 text-sm">Customer Satisfaction</h3>
                  <p className="text-2xl font-bold mt-1">{monthlyStats.satisfaction}</p>
                  <p className="text-sm text-green-500">{monthlyStats.satisfactionGrowth} vs last month</p>
                </div>
              </div>
              
              {/* Service Distribution */}
              <div className="mt-8">
                <h3 className="text-gray-700 font-medium mb-3">Service Distribution</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Oil Change & Maintenance</span>
                      <span>42%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: "42%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tire Services</span>
                      <span>28%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: "28%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Engine & Electrical</span>
                      <span>18%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: "18%"}}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Body Work & Detailing</span>
                      <span>12%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: "12%"}}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Upcoming Appointments */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
                <button className="text-blue-500 text-sm">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentAppointments.map(appointment => (
                  <div key={appointment.id} className="border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex justify-between">
                      <span className="font-medium">{appointment.customer}</span>
                      <span className={`text-sm ${
                        appointment.status === "Confirmed" ? "text-green-500" : "text-orange-500"
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">{appointment.service}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {appointment.date} at {appointment.time}
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-4 bg-blue-50 text-blue-500 py-2 rounded-lg text-sm font-medium">
                + Add New Appointment
              </button>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <button className="bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg flex flex-col items-center transition-colors">
                <CalendarOutlined className="text-2xl mb-2" />
                <span>Schedule</span>
              </button>
              <button className="bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg flex flex-col items-center transition-colors">
                <UserOutlined className="text-2xl mb-2" />
                <span>Customers</span>
              </button>
              <button className="bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg flex flex-col items-center transition-colors">
                <BarChartOutlined className="text-2xl mb-2" />
                <span>Reports</span>
              </button>
              <button className="bg-orange-50 hover:bg-orange-100 text-orange-700 p-4 rounded-lg flex flex-col items-center transition-colors">
                <ToolOutlined className="text-2xl mb-2" />
                <span>Inventory</span>
              </button>
              <button className="bg-red-50 hover:bg-red-100 text-red-700 p-4 rounded-lg flex flex-col items-center transition-colors">
                <CarOutlined className="text-2xl mb-2" />
                <span>Services</span>
              </button>
              <button className="bg-gray-50 hover:bg-gray-100 text-gray-700 p-4 rounded-lg flex flex-col items-center transition-colors">
                <SettingOutlined className="text-2xl mb-2" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard;