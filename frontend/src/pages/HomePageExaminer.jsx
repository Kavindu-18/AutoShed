import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaBell, FaCheckCircle, FaCalendarAlt, FaTimes, FaChalkboardTeacher, FaBookOpen, FaClipboardList, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";

const HomePageExaminer = () => {
  const [examiner, setExaminer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editedExaminer, setEditedExaminer] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (email) {
      fetch(`http://localhost:5001/api/examiners/email/${email}`)
        .then(response => response.json())
        .then(data => {
          const enrichedData = {
            ...data,
            presentations: [
              { groupName: 'Group A', date: '2025-05-10', hall: 'Hall 2', time: '10:30 AM' },
              { groupName: 'Group B', date: '2025-05-11', hall: 'Hall 3', time: '2:00 PM' },
            ],
          };
          setExaminer(enrichedData);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [email]);
  
  // Fetch notifications for examiners
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Fetch notifications
        const response = await fetch('http://localhost:5001/api/notifications');
        const allNotifications = await response.json();
        
        // Filter notifications ONLY for examiners (not common) that are published and not expired
        const currentDate = new Date();
        const relevantNotifications = allNotifications.filter(notification => 
          // Only show notifications specifically targeted to examiners
          notification.targetAudience.includes('examiners') &&
          notification.status === 'Published' &&
          new Date(notification.expirationDate) > currentDate &&
          new Date(notification.effectiveDate) <= currentDate
        );
        
        console.log('Filtered examiner-only notifications:', relevantNotifications); // Debug log
        setNotifications(relevantNotifications);
        
        // Calculate unread notifications
        const unread = relevantNotifications.filter(notification => !notification.viewedBy?.includes(email)).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    if (email) {
      fetchNotifications();
      
      // Set up polling to check for new notifications every minute
      const intervalId = setInterval(fetchNotifications, 60000);
      return () => clearInterval(intervalId);
    }
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
      
      // Update notifications list to mark this one as read
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

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedExaminer(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveChanges = () => {
    const updateData = {
      fname: editedExaminer.fname,
      lname: editedExaminer.lname,
      phone: editedExaminer.phone,
    };
  
    fetch(`http://localhost:5001/api/examiners/${examiner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update profile');
        return res.json();
      })
      .then(() => {
        setExaminer(prev => ({ ...prev, ...updateData }));
        toast.success("Profile details updated successfully!");
        setShowProfile(false);
      })
      .catch(err => {
        console.error('Error updating profile:', err);
        toast.error("Failed to update profile details.");
      });
  };
  
  const handleSavePassword = () => {
    // Validate current password
    if (editedExaminer.currentPassword !== examiner.password) {
      setPasswordError('Current password is incorrect');
      toast.error('Current password is incorrect');
      return;
    }
  
    // Validate new password match
    if (editedExaminer.newPassword !== editedExaminer.confirmPassword) {
      setPasswordError('New passwords do not match');
      toast.error('New passwords do not match');
      return;
    }
  
    setPasswordError(''); // Clear any previous error
  
    const updateData = {
      password: editedExaminer.newPassword,
    };
  
    fetch(`http://localhost:5001/api/examiners/${examiner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to update password');
        return res.json();
      })
      .then(() => {
        setExaminer(prev => ({ ...prev, password: updateData.password }));
        toast.success("Password updated successfully!");
  
        setEditedExaminer(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          showPasswordFields: false,
        }));
  
        setShowProfile(false); // Optional: close profile modal
      })
      .catch(err => {
        console.error('Error updating password:', err);
        toast.error("Failed to update password.");
      });
  
  };
  

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!examiner) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-xl font-semibold mb-4">Examiner not found</div>
        <button 
          onClick={() => navigate('/')} 
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-300"
        >
          Back to Login
        </button>
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600">AutoShed</div>
          </div>
          <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
            <a href="/profile/:id" className="hover:text-indigo-600 transition-colors duration-200 flex items-center gap-1">
              <span className="w-1 h-1 bg-indigo-600 rounded-full"></span>
              Home
            </a>
            <a href="/about" className="hover:text-indigo-600 transition-colors duration-200">About Us</a>
            <a href="/contact" className="hover:text-indigo-600 transition-colors duration-200">Contact Us</a>
            <a href="/examiners" className="hover:text-indigo-600 transition-colors duration-200">Examiners</a>
            <a href="/help" className="hover:text-indigo-600 transition-colors duration-200">Help Center</a>
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium hidden sm:block">{examiner.email}</span>
              <div className="relative">
                <div className="cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
                  <div className="relative group">
                    <FaBell className="text-xl text-gray-500 group-hover:text-indigo-600 transition-colors duration-200" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-md transform transition-transform duration-200 group-hover:scale-110">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto border border-gray-200 animate-fadeIn">
                    <div className="flex justify-between items-center p-4 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-700">Examiner Notifications</h3>
                      <FaTimes 
                        className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors duration-200" 
                        onClick={() => setShowNotifications(false)} 
                      />
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 flex flex-col items-center">
                        <FaBell className="text-3xl text-gray-300 mb-2" />
                        <p>No examiner notifications</p>
                      </div>
                    ) : (
                      <div>
                        {notifications.map(notification => {
                          const isUnread = !notification.viewedBy?.includes(email);
                          return (
                            <div 
                              key={notification._id} 
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${isUnread ? 'bg-blue-50' : ''}`}
                              onClick={() => handleNotificationClick(notification._id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)} shadow-md`}>
                                  {notification.type === 'Academic' ? (
                                    <FaCalendarAlt className="text-white" />
                                  ) : notification.type === 'Administrative' ? (
                                    <FaClipboardList className="text-white" />
                                  ) : (
                                    <FaCheckCircle className="text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-gray-800">{notification.title}</h4>
                                    {isUnread && <div className="w-2 h-2 rounded-full bg-blue-600 shadow-sm"></div>}
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
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="relative group">
              <FaUserCircle
                className="text-3xl text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors duration-200"
                onClick={() => {
                  setEditedExaminer({
                    fname: examiner.fname,
                    lname: examiner.lname,
                    phone: examiner.phone,
                    showPasswordFields: false,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setPasswordError('');
                  setShowProfile(true);
                }}
              />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                Edit Profile
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-md hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-1"
            >
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full transform -translate-x-1/3 translate-y-1/3"></div>
            
            <h1 className="text-4xl font-bold mb-2 relative z-10">
              Welcome, {examiner.fname} {examiner.lname}
            </h1>
            <p className="text-indigo-100 text-lg max-w-xl relative z-10">
              Access your scheduling information, manage notifications, and view upcoming presentations all in one place.
            </p>
          </div>

          {/* Notification Banner - For highest priority notifications */}
          {notifications.some(n => n.priority === 'High' && n.highlightNotice) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mb-8 rounded-lg shadow-md animate-pulse">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaBell className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-yellow-700 font-medium">
                    You have important examiner notifications
                  </p>
                  <p className="text-yellow-600 mt-1">
                    Check your notification panel for important updates
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Info Cards */}
            <div className="lg:col-span-2 space-y-8">
              {/* Info Grid */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaChalkboardTeacher className="mr-2 text-indigo-600" />
                  Examiner Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-indigo-700 mb-1">Department</p>
                    <p className="text-gray-800 flex items-center">
                      <FaBookOpen className="mr-2 text-indigo-500" />
                      {examiner.department}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg shadow-sm border border-purple-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-purple-700 mb-1">Position</p>
                    <p className="text-gray-800">{examiner.position}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-blue-700 mb-1">Phone</p>
                    <p className="text-gray-800 flex items-center">
                      <FaPhone className="mr-2 text-blue-500" />
                      {examiner.phone}
                    </p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg shadow-sm border border-teal-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-teal-700 mb-1">Email</p>
                    <p className="text-gray-800 flex items-center">
                      <FaEnvelope className="mr-2 text-teal-500" />
                      {examiner.email}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg shadow-sm border border-green-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-green-700 mb-1">Availability</p>
                    <p className="text-gray-800 flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${examiner.availability ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {examiner.availability ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg shadow-sm border border-amber-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-amber-700 mb-1">Salary</p>
                    <p className="text-gray-800">${examiner.salary?.toFixed(2)}</p>
                  </div>
                  <div className="md:col-span-2 bg-pink-50 p-4 rounded-lg shadow-sm border border-pink-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-pink-700 mb-1">Courses</p>
                    <div className="flex flex-wrap gap-2">
                      {examiner.courses?.map((course, index) => (
                        <span key={index} className="bg-white px-2 py-1 rounded-md text-sm text-gray-700 border border-pink-200">
                          {course}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-violet-50 p-4 rounded-lg shadow-sm border border-violet-100 transition-transform hover:transform hover:scale-102 duration-200">
                    <p className="font-semibold text-violet-700 mb-1">Modules</p>
                    <div className="flex flex-wrap gap-2">
                      {examiner.modules?.map((module, index) => (
                        <span key={index} className="bg-white px-2 py-1 rounded-md text-sm text-gray-700 border border-violet-200">
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Table */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaCalendarAlt className="mr-2 text-indigo-600" />
                  Presentation Schedule
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto border-collapse bg-white">
                    <thead>
                      <tr className="bg-indigo-50 text-indigo-600">
                        <th className="px-6 py-3 text-left text-sm font-semibold rounded-tl-lg">Date</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Time</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">Hall</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold rounded-tr-lg">Student Group</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {examiner.presentations.map((presentation, index) => (
                        <tr 
                          key={index} 
                          className={`hover:bg-gray-50 transition-colors duration-150 ${index === examiner.presentations.length - 1 ? 'rounded-b-lg' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{presentation.date}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{presentation.time}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{presentation.hall}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{presentation.groupName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right column - Notifications */}
            <div>
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 sticky top-24">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
                  <FaBell className="mr-2 text-indigo-600" />
                  Examiner Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
                
                {notifications.length === 0 ? (
                  <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500 border border-gray-200">
                    <FaBell className="text-4xl mx-auto mb-2 text-gray-300" />
                    <p>No examiner notifications</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.slice(0, 5).map(notification => {
                      const isUnread = !notification.viewedBy?.includes(email);
                      return (
                        <div 
                          key={notification._id} 
                          className={`border rounded-lg p-4 hover:border-indigo-300 transition-all duration-200 shadow-sm cursor-pointer ${isUnread ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                          onClick={() => handleNotificationClick(notification._id)}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900 flex items-center">
                              {isUnread && <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>}
                              {notification.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-600 text-sm line-clamp-2">{notification.body}</p>
                          <div className="mt-3 flex justify-between items-center text-xs">
                            <span className="text-gray-500 flex items-center">
                              <FaClock className="mr-1" /> {formatDate(notification.effectiveDate)}
                            </span>
                            {notification.highlightNotice && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-medium flex items-center">
                                <FaCheckCircle className="mr-1" /> Important
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {notifications.length > 5 && (
                      <div className="text-center mt-4">
                        <button 
                          onClick={() => setShowNotifications(true)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors duration-200"
                        >
                          View all notifications ({notifications.length})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Side Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex justify-end transition-opacity duration-300">
          <div 
            className="w-full max-w-md bg-white h-full p-8 overflow-y-auto shadow-2xl rounded-l-3xl transform transition-all duration-500 animate-slideInRight"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-indigo-700">Profile Settings</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-gray-400 hover:text-red-500 transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-4xl border-4 border-indigo-200">
                  {examiner.fname.charAt(0)}{examiner.lname.charAt(0)}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">ID</label>
                    <input 
                      type="text" 
                      value={examiner.id} 
                      disabled 
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input 
                      type="email" 
                      value={examiner.email} 
                      disabled 
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed" 
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                    <input 
                      name="fname" 
                      value={editedExaminer.fname || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                    <input 
                      name="lname" 
                      value={editedExaminer.lname || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                    <input 
                      name="phone" 
                      value={editedExaminer.phone || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <button 
                    onClick={handleSaveChanges} 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-md font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Security</h3>
                {!editedExaminer.showPasswordFields ? (
                  <button
                    onClick={() => setEditedExaminer(prev => ({ ...prev, showPasswordFields: true }))} 
                    className="text-indigo-600 font-medium flex items-center hover:text-indigo-800 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    Change Password
                  </button>
                ) : (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Current Password</label>
                      <input 
                        type="password" 
                        name="currentPassword" 
                        value={editedExaminer.currentPassword || ''} 
                        onChange={handleInputChange} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                      <input 
                        type="password" 
                        name="newPassword" 
                        value={editedExaminer.newPassword || ''} 
                        onChange={handleInputChange} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Re-enter New Password</label>
                      <input 
                        type="password" 
                        name="confirmPassword" 
                        value={editedExaminer.confirmPassword || ''} 
                        onChange={handleInputChange} 
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200" 
                      />
                    </div>
                    {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                    
                    <button 
                      onClick={handleSavePassword} 
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                      Update Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">AutoShed</h3>
              <p className="text-gray-400 text-base">A comprehensive platform for managing exam scheduling and presentations efficiently.</p>
              <div className="mt-4 flex gap-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg text-gray-200">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="/" className="hover:text-white transition-colors duration-200">Home</a></li>
                <li><a href="/about" className="hover:text-white transition-colors duration-200">About Us</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors duration-200">Contact Us</a></li>
                <li><a href="/examiners" className="hover:text-white transition-colors duration-200">Examiners</a></li>
                <li><a href="/help" className="hover:text-white transition-colors duration-200">Help Center</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg text-gray-200">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center">
                  <FaEnvelope className="mr-2 text-indigo-400" />
                  support@autoshed.com
                </li>
                <li className="flex items-center">
                  <FaPhone className="mr-2 text-indigo-400" />
                  +1 800 123 4567
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 mr-2 text-indigo-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                  <span>123 Education Street, Academic Building<br />University Campus, CA 90210</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} AutoShed. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper function to get priority badge color
const getPriorityBadgeClass = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-100 text-red-800';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'Low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get priority icon background color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High':
      return 'bg-red-500';
    case 'Medium':
      return 'bg-yellow-500';
    case 'Low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

export default HomePageExaminer;