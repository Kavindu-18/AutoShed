import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Layout, 
  Spin, 
  Carousel, 
  Statistic, 
  Card, 
  Row, 
  Col, 
  Button, 
  Empty, 
  Badge, 
  Input, 
  Tooltip, 
  List, 
  Typography,
  message,
  Divider,
  notification,
  Modal,
  Select,
  Image,
  Space,
  Tag,
  Checkbox
} from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  TeamOutlined, 
  BellOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  FileTextTwoTone,
  FilePdfTwoTone,
  FileImageTwoTone,
  FileExcelTwoTone,
  FileWordTwoTone,
  FileZipTwoTone,
  FileUnknownTwoTone
} from '@ant-design/icons';

const { Content, Footer } = Layout;
const { Meta } = Card;
const { Search } = Input;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Utility function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Enhanced search component with filters
const EnhancedSearch = ({ onSearch, searchValue, setSearchValue, notices }) => {
  const [advancedMode, setAdvancedMode] = useState(false);
  const [typeFilter, setTypeFilter] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState([]);
  
  const types = [...new Set(notices.map(notice => notice.type))].filter(Boolean);
  const priorities = [...new Set(notices.map(notice => notice.priority))].filter(Boolean);
  
  const handleSearch = (value) => {
    if (advancedMode) {
      const filtered = notices.filter(notice => {
        const matchesText = !value || (
          (notice.title && notice.title.toLowerCase().includes(value.toLowerCase())) ||
          (notice.body && notice.body.toLowerCase().includes(value.toLowerCase())) ||
          (notice.author && notice.author.toLowerCase().includes(value.toLowerCase()))
        );
        
        const matchesType = typeFilter.length === 0 || typeFilter.includes(notice.type);
        const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(notice.priority);
          
        return matchesText && matchesType && matchesPriority;
      });
      
      onSearch(filtered);
    } else {
      onSearch(value);
    }
  };

  const handleReset = () => {
    setSearchValue('');
    setTypeFilter([]);
    setPriorityFilter([]);
    onSearch('');
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-gray-700">Search Notices</span>
        <Button 
          type="link" 
          onClick={() => setAdvancedMode(!advancedMode)}
          className="p-0 h-auto"
        >
          {advancedMode ? 'Simple Search' : 'Advanced Search'}
        </Button>
      </div>
      
      {advancedMode ? (
        <div className="space-y-4">
          <Input
            placeholder="Search by title, content, or author..."
            allowClear
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            prefix={<SearchOutlined />}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-1 text-sm text-gray-600">Notice Type</div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Filter by type"
                value={typeFilter}
                onChange={setTypeFilter}
              >
                {types.map(type => (
                  <Option key={type} value={type}>{type}</Option>
                ))}
              </Select>
            </div>
            
            <div>
              <div className="mb-1 text-sm text-gray-600">Priority</div>
              <Select
                mode="multiple"
                allowClear
                style={{ width: '100%' }}
                placeholder="Filter by priority"
                value={priorityFilter}
                onChange={setPriorityFilter}
              >
                {priorities.map(priority => (
                  <Option key={priority} value={priority}>{priority}</Option>
                ))}
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button onClick={handleReset}>Reset</Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => handleSearch(searchValue)}>
              Search
            </Button>
          </div>
        </div>
      ) : (
        <Search
          placeholder="Search notices..."
          allowClear
          enterButton={<SearchOutlined />}
          size="large"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={handleSearch}
        />
      )}
    </div>
  );
};

// Component to display a single notice
const NoticeCard = ({ notice }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'Academic': return { color: '#1890ff', bg: '#e6f7ff' };
      case 'Administrative': return { color: '#722ed1', bg: '#f9f0ff' };
      case 'Event': return { color: '#52c41a', bg: '#f6ffed' };
      default: return { color: '#595959', bg: '#fafafa' };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return { color: '#f5222d', bg: '#fff1f0' };
      case 'Medium': return { color: '#fa8c16', bg: '#fff7e6' };
      case 'Low': return { color: '#52c41a', bg: '#f6ffed' };
      default: return { color: '#595959', bg: '#fafafa' };
    }
  };

  const typeStyle = getTypeColor(notice.type);
  const priorityStyle = getPriorityColor(notice.priority);

  return (
    <Card 
      hoverable 
      className="h-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0"
      styles={{ body: { padding: '20px' } }}
      style={{ 
        borderRadius: '12px',
        overflow: 'hidden'
      }}
      cover={
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <div className="flex flex-wrap gap-2">
            <Badge 
              count={notice.type} 
              style={{ backgroundColor: typeStyle.color, color: 'white' }} 
              className="site-badge-count-4"
            />
            <Badge 
              count={notice.priority} 
              style={{ backgroundColor: priorityStyle.color, color: 'white' }} 
              className="site-badge-count-4"
            />
            {notice.highlightNotice && (
              <Badge count="Important" style={{ backgroundColor: '#faad14', color: 'white' }} />
            )}
          </div>
        </div>
      }
    >
      <Meta
        title={<Text strong className="text-lg">{notice.title}</Text>}
        description={
          <div>
            <Paragraph className="text-gray-600 mb-3" ellipsis={{ rows: 3 }}>
              {notice.body}
            </Paragraph>
            
            <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 flex justify-between">
              <span>By: {notice.author || 'Admin'}</span>
              <Tooltip title={`Valid until: ${formatDate(notice.expirationDate)}`}>
                <span>{formatDate(notice.effectiveDate)}</span>
              </Tooltip>
            </div>
          </div>
        }
      />
    </Card>
  );
};

// Feature card component
const FeatureCard = ({ icon, title, description, linkTo, color }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'blue': return {
        border: 'border-blue-500',
        hover: 'hover:bg-blue-50',
        shadow: 'hover:shadow-blue-100',
        gradient: 'from-blue-50 to-indigo-50'
      };
      case 'emerald': return {
        border: 'border-emerald-500',
        hover: 'hover:bg-emerald-50',
        shadow: 'hover:shadow-emerald-100',
        gradient: 'from-emerald-50 to-green-50'
      };
      case 'purple': return {
        border: 'border-purple-500',
        hover: 'hover:bg-purple-50',
        shadow: 'hover:shadow-purple-100',
        gradient: 'from-purple-50 to-fuchsia-50'
      };
      case 'amber': return {
        border: 'border-amber-500',
        hover: 'hover:bg-amber-50',
        shadow: 'hover:shadow-amber-100',
        gradient: 'from-amber-50 to-yellow-50'
      };
      default: return {
        border: 'border-gray-300',
        hover: 'hover:bg-gray-50',
        shadow: 'hover:shadow-gray-100',
        gradient: 'from-gray-50 to-gray-100'
      };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <Link to={linkTo} className="block">
      <Card 
        hoverable 
        className={`h-full border-t-4 ${colorClasses.border} ${colorClasses.hover} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
        styles={{ body: { padding: '24px' } }}
        style={{ 
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        cover={
          <div className={`h-12 bg-gradient-to-r ${colorClasses.gradient}`}></div>
        }
      >
        <div className="text-5xl mb-6 text-center">{icon}</div>
        <Meta
          title={<Title level={4} className="text-center mb-4">{title}</Title>}
          description={<Paragraph className="text-gray-600 text-center">{description}</Paragraph>}
        />
      </Card>
    </Link>
  );
};

function HomePage() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExaminers: 0,
    scheduledPresentations: 0,
    completedPresentations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:5001';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        
        // Fetch all active common notifications from API
        const response = await fetch(`${API_BASE_URL}/api/notifications/active/common`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const commonNotifications = await response.json();
        // Note: The backend already filters for published & common notifications
        
        // Sort by priority and effective date
        commonNotifications.sort((a, b) => {
          // First sort by priority (High > Medium > Low)
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          
          if (priorityDiff !== 0) return priorityDiff;
          
          // Then by highlightNotice flag
          if (a.highlightNotice && !b.highlightNotice) return -1;
          if (!a.highlightNotice && b.highlightNotice) return 1;
          
          // Then sort by effective date (newest first)
          return new Date(b.effectiveDate) - new Date(a.effectiveDate);
        });
        
        setNotifications(commonNotifications);
        setFilteredNotifications(commonNotifications);
        
        // Show notification for highlighted notices
        commonNotifications.forEach(notice => {
          if (notice.highlightNotice) {
            notification.info({
              message: notice.title,
              description: notice.body,
              placement: 'topRight',
              duration: 5
            });
          }
        });
        
        // Request browser notification permission
        if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
          Notification.requestPermission();
        }
        
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications. Please refresh the page or try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Fetch stats (placeholder for now)

  }, []);

  // Enhanced search handler that supports both simple and advanced search
  const handleSearch = (valueOrFiltered) => {
    if (typeof valueOrFiltered === 'string') {
      const value = valueOrFiltered;
      setSearchValue(value);
      
      if (!value.trim()) {
        setFilteredNotifications(notifications);
        return;
      }
      
      const searchTermLower = value.toLowerCase();
      const filtered = notifications.filter(notice => 
        (notice.title && notice.title.toLowerCase().includes(searchTermLower)) ||
        (notice.body && notice.body.toLowerCase().includes(searchTermLower)) ||
        (notice.author && notice.author.toLowerCase().includes(searchTermLower)) ||
        (notice.type && notice.type.toLowerCase().includes(searchTermLower))
      );
      
      setFilteredNotifications(filtered);
    } else if (Array.isArray(valueOrFiltered)) {
      // Handle pre-filtered results from advanced search
      setFilteredNotifications(valueOrFiltered);
    }
  };
  
  const carouselItems = [
    {
      title: "Streamlined Exam Scheduling",
      description: "Easily schedule and manage examination presentations with our comprehensive platform.",
      icon: <CalendarOutlined style={{ fontSize: 48 }} />,
      color: "from-blue-500 to-indigo-700"
    },
    {
      title: "Student & Examiner Management",
      description: "Efficiently manage student profiles and examiner assignments in one place.",
      icon: <TeamOutlined style={{ fontSize: 48 }} />,
      color: "from-green-500 to-teal-700"
    },
    {
      title: "Smart Notifications",
      description: "Stay updated with important announcements and upcoming presentations.",
      icon: <BellOutlined style={{ fontSize: 48 }} />,
      color: "from-amber-500 to-orange-700"
    }
  ];

  return (
    <Layout className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Content className="pb-16">
        {/* Hero Carousel Section */}
        <section className="relative overflow-hidden">
          <Carousel 
            autoplay 
            effect="fade" 
            dots={{ className: "custom-dots" }} 
            className="h-screen max-h-[700px] bg-gradient-to-r from-blue-700 to-indigo-900"
          >
            {carouselItems.map((item, index) => (
              <div key={index} className="h-screen max-h-[700px] flex items-center">
                <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center">
                  <div className="lg:w-7/12 text-white">
                    <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight animate__animated animate__fadeIn">
                      {item.title}
                    </h1>
                    <p className="text-xl opacity-90 mb-8 animate__animated animate__fadeIn animate__delay-1s">
                      {item.description}
                    </p>
                    <div className="flex gap-4 animate__animated animate__fadeIn animate__delay-2s">
                      <Link to="/login">
                        <Button 
                          type="primary" 
                          size="large" 
                          className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 shadow-lg hover:shadow-xl border-0 transition-all"
                          style={{ height: '48px', padding: '0 24px', borderRadius: '8px' }}
                        >
                          Get Started
                        </Button>
                      </Link>
                      <Link to="/learn-more">
                        <Button 
                          ghost 
                          size="large"
                          style={{ height: '48px', padding: '0 24px', borderRadius: '8px' }}
                          className="border-2 hover:border-white hover:text-white transition-all"
                        >
                          Learn More
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:flex lg:w-5/12 justify-center animate__animated animate__fadeInRight">
                    <div className="bg-white/20 rounded-full p-12 backdrop-blur-sm shadow-2xl">
                      {item.icon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </section>
        
        {/* Main Features Section */}
        <section className="container mx-auto px-4 py-24">
          <Title level={2} className="text-center text-gray-800 mb-16 text-4xl font-bold">
            <Divider>Main Features</Divider>
          </Title>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<CalendarOutlined className="text-blue-600" />}
              title="Exam Scheduling"
              description="Schedule exams with automatic conflict detection and intuitive calendar interface."
              linkTo="/login"
              color="blue"
            />
            
            <FeatureCard 
              icon={<FileTextOutlined className="text-emerald-600" />}
              title="Presentations"
              description="Organize and track presentations with comprehensive management tools."
              linkTo="/login"
              color="emerald"
            />
            
            <FeatureCard 
              icon={<UserOutlined className="text-purple-600" />}
              title="Student Management"
              description="Track student progress, manage profiles, and monitor examination status."
              linkTo="/login"
              color="purple"
            />
            
            <FeatureCard 
              icon={<TeamOutlined className="text-amber-600" />}
              title="Examiner Management"
              description="Manage examiners, their availability, and specialization areas."
              linkTo="/login"
              color="amber"
            />
          </div>
        </section>
        
        {/* Notices Section - Shows common notifications before login */}
        <section className="py-20 bg-gradient-to-b from-gray-100 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <Title level={2} className="text-gray-800 mb-4 md:mb-0">Important Announcements</Title>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <EnhancedSearch 
                  onSearch={handleSearch}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  notices={notifications}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Spin size="large" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNotifications.slice(0, 6).map(notice => (
                  <NoticeCard key={notice._id} notice={notice} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-lg shadow-md border border-gray-100 text-center">
                <Empty 
                  description={
                    searchValue 
                      ? <Text className="text-gray-500">No announcements match your search</Text>
                      : <Text className="text-gray-500">{error || "No announcements available"}</Text>
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
          </div>
        </section>
        
        {/* Call-to-Action Section */}
        <section className="py-20 bg-gradient-to-r from-indigo-700 to-blue-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join our platform today and simplify your exam scheduling and presentation management
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
              <Link to="/login">
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 border-0 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  style={{ height: '50px', padding: '0 32px', borderRadius: '8px', fontSize: '16px' }}
                >
                  Welcome to AutoShed
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  ghost 
                  size="large"
                  style={{ height: '50px', padding: '0 32px', borderRadius: '8px', fontSize: '16px' }}
                  className="border-2 hover:border-white hover:text-white transition-all w-full sm:w-auto mt-4 sm:mt-0"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </Content>
      
      <Footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <Row gutter={24}>
            <Col xs={24} sm={24} md={8} lg={8}>
              <h3 className="text-2xl font-bold mb-6">AutoShed</h3>
              <p className="text-gray-400 mb-4 text-base">
                A comprehensive platform for managing exam scheduling and presentations.
                Streamline your academic workflow with our intuitive tools.
              </p>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Presentations</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Students</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Examiners</Link></li>
              </ul>
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <address className="text-gray-400 not-italic space-y-3">
                <p>Email: info@autoshed.com</p>
                <p>Phone: (123) 456-7890</p>
                <p>Address: 123 University Way, Education City</p>
              </address>
            </Col>
          </Row>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} AutoShed. All rights reserved.</p>
          </div>
        </div>
      </Footer>
    </Layout>
  );
}

export default HomePage;