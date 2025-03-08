import { Layout, Menu } from "antd";
import { UserOutlined, DashboardOutlined } from "@ant-design/icons";
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
        <Menu.Item key="users" icon={<UserOutlined />}>
          <Link to="/users">Users</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
}

export default Sidebar;
