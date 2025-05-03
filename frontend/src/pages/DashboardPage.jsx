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
            <p className="mt-2 opacity-90">Here's your Presentation sheduling system</p>
          </div>

          {/* Overview Cards */}
         
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
