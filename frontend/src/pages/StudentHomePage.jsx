import React, { useEffect, useState } from 'react';
import { 
  FaBell, 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaTimes, 
  FaClipboardList, 
  FaClock,
  FaExclamationTriangle,
  FaRegDotCircle,
  FaGraduationCap,
  FaUserGraduate,
  FaBook,
  FaCalendarDay,
  FaChartLine
} from 'react-icons/fa';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Get student email from localStorage
  const email = localStorage.getItem('userEmail') || "student@example.com";
  
  // Demo student data (only for display, not for notifications)
  const studentData = {
    name: "",
    id: "ST202545",
    program: "Computer Science",
    year: 3,
    gpa: 3.8,
    courses: [
      { code: "CS301", name: "Database Systems", progress: 85 },
      { code: "CS315", name: "Software Engineering", progress: 72 },
      { code: "MATH251", name: "Applied Statistics", progress: 90 }
    ],
    upcomingAssignments: [
      { course: "CS301", title: "Database Design Project", dueDate: "2025-05-15" },
      { course: "CS315", title: "User Interface Mockups", dueDate: "2025-05-10" }
    ]
  };
  
  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Fetch notifications from backend API
        const response = await fetch('http://localhost:5001/api/notifications');
        const allNotifications = await response.json();
        
        // Filter notifications for students that are published and not expired
        const currentDate = new Date();
        const relevantNotifications = allNotifications.filter(notification => 
          notification.targetAudience.includes('students') &&
          notification.status === 'Published' &&
          new Date(notification.expirationDate) > currentDate &&
          new Date(notification.effectiveDate) <= currentDate
        );
        
        setNotifications(relevantNotifications);
        
        // Calculate unread notifications
        const unread = relevantNotifications.filter(notification => 
          !notification.viewedBy?.includes(email)
        ).length;
        
        setUnreadCount(unread);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setLoading(false);
        
        // In development environment, we can use this fallback data
        // But in production, we'd handle errors differently
        console.log("Using fallback data for development only");
      }
    };
    
    fetchNotifications();
    
    // Set up polling for new notifications
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, [email]);
  
  const handleNotificationClick = async (notificationId) => {
    try {
      // Mark notification as viewed
      await fetch(`http://localhost:5001/api/notifications/${notificationId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // Update notifications list
      setNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, viewedBy: [...(notification.viewedBy || []), email] } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get days remaining until expiration
  const getDaysRemaining = (expirationDate) => {
    const today = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = Math.abs(expiration - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper functions for styling
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  // Get notification type icon
  const getNotificationTypeIcon = (type) => {
    switch (type) {
      case 'Academic':
        return <FaCalendarAlt className="text-white" />;
      case 'Administrative':
        return <FaClipboardList className="text-white" />;
      case 'Health':
        return <FaExclamationTriangle className="text-white" />;
      case 'Career':
        return <FaGraduationCap className="text-white" />;
      default:
        return <FaCheckCircle className="text-white" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Campus<span className="text-indigo-600">Connect</span>
                </span>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-800 font-medium border-b-2 border-indigo-500 px-3 py-2 text-sm">Dashboard</a>
                  <a href="#" className="text-gray-500 hover:text-gray-800 px-3 py-2 text-sm font-medium">Courses</a>
                  <a href="#" className="text-gray-500 hover:text-gray-800 px-3 py-2 text-sm font-medium">Schedule</a>
                  <a href="#" className="text-gray-500 hover:text-gray-800 px-3 py-2 text-sm font-medium">Grades</a>
                  <a href="#" className="text-gray-500 hover:text-gray-800 px-3 py-2 text-sm font-medium">Resources</a>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Bell icon with notification count */}
              <div className="relative">
                <button 
                  className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200" 
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <div className="relative">
                    <FaBell className="text-gray-600 hover:text-indigo-600 transition-colors duration-200" size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-lg shadow-xl z-50 max-h-[32rem] overflow-y-auto border border-gray-200 animate-fadeIn">
                    <div className="sticky top-0 flex justify-between items-center p-4 border-b border-gray-100 bg-white z-10">
                      <h3 className="font-semibold text-gray-700 flex items-center">
                        <FaBell className="text-indigo-500 mr-2" />
                        Notification Center
                      </h3>
                      <button
                        className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full" 
                        onClick={() => setShowNotifications(false)}
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    {loading ? (
                      <div className="p-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                        <FaBell className="text-3xl text-gray-300 mb-2" />
                        <p>No notifications found</p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map(notification => {
                          const isUnread = !notification.viewedBy?.includes(email);
                          const daysRemaining = getDaysRemaining(notification.expirationDate);
                          return (
                            <button 
                              key={notification._id} 
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 w-full text-left ${isUnread ? 'bg-blue-50' : ''}`}
                              onClick={() => handleNotificationClick(notification._id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)} shadow-md flex-shrink-0`}>
                                  {getNotificationTypeIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-gray-800">{notification.title}</h4>
                                    {isUnread && <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-sm"></div>}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{notification.body}</p>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <FaClock className="text-gray-400" />
                                      {formatDate(notification.effectiveDate)}
                                    </span>
                                    {notification.highlightNotice && (
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-md font-medium">
                                        Important
                                      </span>
                                    )}
                                  </div>
                                  {daysRemaining <= 3 && (
                                    <div className="mt-1 text-xs text-red-500">
                                      Expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Student Profile */}
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-2">
                  {studentData.name.charAt(0)}
                </div>
                <span className="text-gray-700 font-medium hidden md:block">{studentData.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Overview */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h1 className="text-2xl font-bold">{studentData.name}</h1>
              <p className="text-indigo-100">ID: {studentData.id} • {studentData.program} • Year {studentData.year}</p>
              
              <div className="mt-4 flex space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <FaChartLine className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-100">Current GPA</p>
                    <p className="font-bold text-xl">{studentData.gpa.toFixed(1)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <FaBook className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-100">Courses</p>
                    <p className="font-bold text-xl">{studentData.courses.length}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-white bg-opacity-20 rounded-lg p-2">
                    <FaCalendarDay className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-100">Upcoming Tasks</p>
                    <p className="font-bold text-xl">{studentData.upcomingAssignments.length}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 md:mt-0 flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <FaUserGraduate className="text-white text-4xl" />
              </div>
            </div>
          </div>
        </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Notification Section - Takes up 2/3 of the grid */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                <FaBell className="mr-2 text-indigo-600" />
                Student Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {unreadCount} new
                  </span>
                )}
              </h2>

              {/* Notification Banner - For highest priority notifications */}
              {notifications.some(n => n.priority === 'High' && n.highlightNotice) && (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mb-6 rounded-lg shadow-sm animate-pulse">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FaBell className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-yellow-700 font-medium">
                        You have important notifications
                      </p>
                      <p className="text-yellow-600 mt-1">
                        Please review your important notifications below
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Notifications List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <span className="ml-3 text-indigo-500 font-medium">Loading notifications...</span>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500 border border-gray-200">
                    <FaBell className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p>No notifications available</p>
                    <p className="text-sm text-gray-400 mt-2">Any important updates will appear here</p>
                  </div>
                ) : (
                  <>
                    {notifications.map(notification => {
                      const isUnread = !notification.viewedBy?.includes(email);
                      const daysRemaining = getDaysRemaining(notification.expirationDate);
                      return (
                        <button 
                          key={notification._id} 
                          className={`border rounded-lg p-4 hover:border-indigo-300 w-full text-left shadow-sm ${isUnread ? 'bg-indigo-50 border-indigo-200' : 'bg-white'} hover:bg-indigo-50 transform hover:-translate-y-1 transition-all duration-200`}
                          onClick={() => handleNotificationClick(notification._id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-3 rounded-full ${getPriorityColor(notification.priority)} shadow-md flex-shrink-0`}>
                              {getNotificationTypeIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium text-gray-900 flex items-center text-lg">
                                  {isUnread && <span className="w-2 h-2 bg-indigo-600 rounded-full mr-2"></span>}
                                  {notification.title}
                                </h3>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(notification.priority)}`}>
                                  {notification.priority}
                                </span>
                              </div>
                              <p className="mt-2 text-gray-600 text-sm">{notification.body}</p>
                              <div className="mt-3 flex justify-between items-center text-xs">
                                <span className="text-gray-500 flex items-center">
                                  <FaClock className="mr-1" /> Posted: {formatDate(notification.effectiveDate)}
                                </span>
                                <div className="flex items-center gap-2">
                                  {daysRemaining <= 3 && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">
                                      Expires soon
                                    </span>
                                  )}
                                  {notification.highlightNotice && (
                                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-medium flex items-center">
                                      <FaExclamationTriangle className="mr-1" /> Important
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Course Progress */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                <FaBook className="mr-2 text-indigo-600" />
                Course Progress
              </h2>
              <div className="space-y-4">
                {studentData.courses.map((course, index) => (
                  <div key={index} className="p-4 border border-gray-100 rounded-lg hover:border-indigo-200 transition-colors">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                        <h3 className="font-medium mt-1">{course.name}</h3>
                      </div>
                      <span className="text-lg font-bold text-indigo-600">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Upcoming Assignments */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center mb-6">
                <FaCalendarDay className="mr-2 text-indigo-600" />
                Upcoming Assignments
              </h2>
              <div className="space-y-3">
                {studentData.upcomingAssignments.map((assignment, index) => (
                  <div key={index} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700 mr-3">
                      <FaCalendarAlt />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{assignment.title}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-medium text-indigo-600">{assignment.course}</span>
                        <span className="text-xs text-gray-500">Due: {formatDate(assignment.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentNotifications;