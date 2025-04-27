import { Layout, Menu } from "antd";
import { UserOutlined, DashboardOutlined,CalendarOutlined ,SolutionOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Sider } = Layout;

function Sidebar() {
  return (
    <Sider className="min-h-screen bg-gray-900 text-white">
      <h2 className="text-white text-lg font-bold p-4">AutoShed</h2>
      <Menu theme="dark" mode="inline" defaultSelectedKeys={["dashboard"]}>
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="calendar" icon={<CalendarOutlined />}>
          <Link to="/calendar">Examiner Calendar</Link>
        </Menu.Item>
        <Menu.Item key="examiner" icon={<SolutionOutlined />}> 
          <Link to="/examiner">Examiner Management</Link>
        </Menu.Item>
        <Menu.Item key="student" icon={<SolutionOutlined />}> 
          <Link to="/add-student">Student Management</Link>
        </Menu.Item>
        <Menu.Item key="notify" icon={<SolutionOutlined />}> 
          <Link to="/Notify">Notify Management</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default Sidebar;
