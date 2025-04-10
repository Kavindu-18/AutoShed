import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function HomePage() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExaminers: 0,
    scheduledPresentations: 0,
    completedPresentations: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all notices from API
        const allNotices = await NoticeMng.getNotices();
        
        // Filter for notices published to both students AND examiners
        const filteredNotices = allNotices.filter(notice => 
          notice.publishToStudents && notice.publishToExaminers
        );
        
        // Sort by priority and effective date
        filteredNotices.sort((a, b) => {
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
        
        setNotices(filteredNotices);
        setFilteredNotices(filteredNotices);
        
        // TODO: Fetch stats from API
        // For a real application, we would fetch these from a backend API
        // For now, use placeholder stats
        setStats({
          totalStudents: 0,
          totalExaminers: 0,
          scheduledPresentations: 0,
          completedPresentations: 0
        });
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please refresh the page or try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Enhanced search handler that supports both simple and advanced search
  const handleSearch = (valueOrFiltered) => {
    if (typeof valueOrFiltered === 'string') {
      const value = valueOrFiltered;
      setSearchValue(value);
      
      if (!value.trim()) {
        setFilteredNotices(notices);
        return;
      }
      
      const searchTermLower = value.toLowerCase();
      const filtered = notices.filter(notice => 
        (notice.title && notice.title.toLowerCase().includes(searchTermLower)) ||
        (notice.body && notice.body.toLowerCase().includes(searchTermLower)) ||
        (notice.author && notice.author.toLowerCase().includes(searchTermLower)) ||
        (notice.type && notice.type.toLowerCase().includes(searchTermLower))
      );
      
      setFilteredNotices(filtered);
    } else if (Array.isArray(valueOrFiltered)) {
      // Handle pre-filtered results from advanced search
      setFilteredNotices(valueOrFiltered);
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
                      <Link to="/register">
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
          
          {/* Stats Section overlapping the hero */}
          <div className="container mx-auto px-4 relative -mt-24 z-10">
            <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
              <Row gutter={16} justify="space-around" align="middle" className="text-center">
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Students</div>} 
                    value={stats.totalStudents} 
                    prefix={<UserOutlined className="mr-2" />} 
                    valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Examiners</div>} 
                    value={stats.totalExaminers} 
                    prefix={<TeamOutlined className="mr-2" />} 
                    valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Scheduled Presentations</div>} 
                    value={stats.scheduledPresentations} 
                    prefix={<CalendarOutlined className="mr-2" />} 
                    valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                  />
                </Col>
                <Col xs={12} sm={12} md={6} lg={6}>
                  <Statistic 
                    title={<div className="text-gray-500 font-medium">Completed Presentations</div>} 
                    value={stats.completedPresentations} 
                    prefix={<CheckCircleOutlined className="mr-2" />} 
                    valueStyle={{ color: '#722ed1', fontWeight: 'bold' }}
                  />
                </Col>
              </Row>
            </div>
          </div>
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
              linkTo="/exams"
              color="blue"
            />
            
            <FeatureCard 
              icon={<FileTextOutlined className="text-emerald-600" />}
              title="Presentations"
              description="Organize and track presentations with comprehensive management tools."
              linkTo="/presentations"
              color="emerald"
            />
            
            <FeatureCard 
              icon={<UserOutlined className="text-purple-600" />}
              title="Student Management"
              description="Track student progress, manage profiles, and monitor examination status."
              linkTo="/students"
              color="purple"
            />
            
            <FeatureCard 
              icon={<TeamOutlined className="text-amber-600" />}
              title="Examiner Management"
              description="Manage examiners, their availability, and specialization areas."
              linkTo="/examiners"
              color="amber"
            />
          </div>
        </section>
        
        {/* Notices Section */}
        <section className="py-20 bg-gradient-to-b from-gray-100 to-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
              <Title level={2} className="text-gray-800 mb-4 md:mb-0">Important Notices</Title>
              <div className="w-full md:w-1/2 lg:w-1/3">
                <EnhancedSearch 
                  onSearch={handleSearch}
                  searchValue={searchValue}
                  setSearchValue={setSearchValue}
                  notices={notices}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Spin size="large" />
              </div>
            ) : filteredNotices.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNotices.slice(0, 6).map(notice => (
                  <NoticeCard key={notice.id} notice={notice} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-16 rounded-lg shadow-md border border-gray-100 text-center">
                <Empty 
                  description={
                    searchValue 
                      ? <Text className="text-gray-500">No notices match your search</Text>
                      : <Text className="text-gray-500">{error || "No notices available"}</Text>
                  } 
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </div>
            )}
            
            <div className="mt-12 text-center">
              <Link to="/notices">
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-blue-600 hover:bg-blue-700 border-0"
                >
                  View All Notices
                </Button>
              </Link>
            </div>
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
              <Link to="/register">
                <Button 
                  type="primary" 
                  size="large" 
                  className="bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-800 border-0 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                  style={{ height: '50px', padding: '0 32px', borderRadius: '8px', fontSize: '16px' }}
                >
                  Create Account
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
                <li><Link to="/presentations" className="hover:text-white transition-colors">Presentations</Link></li>
                <li><Link to="/students" className="hover:text-white transition-colors">Students</Link></li>
                <li><Link to="/examiners" className="hover:text-white transition-colors">Examiners</Link></li>
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