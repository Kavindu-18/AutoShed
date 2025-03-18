import { useState } from "react";
import { Layout, Menu } from "antd";
import { UserOutlined, DashboardOutlined } from "@ant-design/icons";
import Sidebar from "../components/Sidebar";
import Calendar from "../components/Calendar";



const { Header, Content } = Layout;

function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout className="h-screen">
      {/* Sidebar */}
      <Sidebar collapsed={collapsed} />

      <Layout>
        {/* Header */}
        <Header className="bg-white shadow-md px-6 text-xl font-semibold">Dashboard</Header>
        

        {/* <Calendar/> */}

        {/* Content */}
        <Content className="p-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-700">Welcome to AutoShed Dashboard</h2>
            <p className="text-gray-600 mt-2">Manage your application settings and view analytics here.</p>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Dashboard;
