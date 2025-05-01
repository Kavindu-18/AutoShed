import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaBell, FaCheckCircle, FaCalendarAlt, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
        // Fetch notifications targeted to examiners or common audience
        const response = await fetch('http://localhost:5001/api/notifications');
        const allNotifications = await response.json();
        
        // Filter notifications for examiners or common audience that are published and not expired
        const currentDate = new Date();
        const relevantNotifications = allNotifications.filter(notification => 
          (notification.targetAudience === 'examiners' || notification.targetAudience === 'common') &&
          notification.status === 'Published' &&
          new Date(notification.expirationDate) > currentDate &&
          new Date(notification.effectiveDate) <= currentDate
        );
        
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
      .then(res => res.json())
      .then(() => {
        setExaminer(prev => ({ ...prev, ...updateData }));
        setShowProfile(false);
      })
      .catch(err => console.error('Error updating profile:', err));
  };

  const handleSavePassword = () => {
    if (editedExaminer.currentPassword !== examiner.password) {
      setPasswordError('Current password is incorrect');
      return;
    }

    if (editedExaminer.newPassword !== editedExaminer.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    const updateData = {
      password: editedExaminer.newPassword,
    };

    fetch(`http://localhost:5001/api/examiners/${examiner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(res => res.json())
      .then(() => {
        setExaminer(prev => ({ ...prev, password: updateData.password }));
        setShowProfile(false);
      })
      .catch(err => console.error('Error updating password:', err));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!examiner) {
    return <div className="flex justify-center items-center h-screen text-red-500">Examiner not found</div>;
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-700">AutoShed</div>
          <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
            <a href="/profile/:id" className="hover:text-indigo-600">Home</a>
            <a href="/about" className="hover:text-indigo-600">About Us</a>
            <a href="/contact" className="hover:text-indigo-600">Contact Us</a>
            <a href="/examiners" className="hover:text-indigo-600">Examiners</a>
            <a href="/help" className="hover:text-indigo-600">Help Center</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium hidden sm:block">{examiner.email}</span>
              <div className="relative">
                <div className="cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
                  <FaBell className="text-xl text-gray-500 hover:text-indigo-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
                
                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-10 max-h-96 overflow-y-auto">
                    <div className="flex justify-between items-center p-3 border-b">
                      <h3 className="font-medium">Notifications</h3>
                      <FaTimes 
                        className="text-gray-500 hover:text-gray-700 cursor-pointer" 
                        onClick={() => setShowNotifications(false)} 
                      />
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    ) : (
                      <div>
                        {notifications.map(notification => {
                          const isUnread = !notification.viewedBy?.includes(email);
                          return (
                            <div 
                              key={notification._id} 
                              className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${isUnread ? 'bg-blue-50' : ''}`}
                              onClick={() => handleNotificationClick(notification._id)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${getPriorityColor(notification.priority)}`}>
                                  {notification.type === 'Academic' ? (
                                    <FaCalendarAlt className="text-white" />
                                  ) : (
                                    <FaCheckCircle className="text-white" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-gray-800">{notification.title}</h4>
                                    {isUnread && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                                  </div>
                                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{notification.body}</p>
                                  <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-gray-500">
                                      {formatDate(notification.effectiveDate)}
                                    </span>
                                    {notification.highlightNotice && (
                                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">
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
            <FaUserCircle
              className="text-3xl text-indigo-700 hover:text-indigo-900 cursor-pointer"
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
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-6 text-center">
            Welcome , {examiner.fname} {examiner.lname}
          </h1>

          {/* Notification Banner - For highest priority notifications */}
          {notifications.some(n => n.priority === 'High' && n.highlightNotice) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaBell className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700 font-medium">
                    You have important notifications
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Check your notification panel for important updates
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-100 p-4 rounded shadow"><p className="font-semibold">Department:</p><p>{examiner.department}</p></div>
            <div className="bg-orange-100 p-4 rounded shadow"><p className="font-semibold">Position:</p><p>{examiner.position}</p></div>
            <div className="bg-yellow-100 p-4 rounded shadow"><p className="font-semibold">Phone:</p><p>{examiner.phone}</p></div>
            <div className="bg-blue-100 p-4 rounded shadow"><p className="font-semibold">Email:</p><p>{examiner.email}</p></div>
            <div className="bg-green-100 p-4 rounded shadow"><p className="font-semibold">Availability:</p><p>{examiner.availability ? 'Available' : 'Not Available'}</p></div>
            <div className="bg-gray-100 p-4 rounded shadow"><p className="font-semibold">Salary:</p><p>${examiner.salary?.toFixed(2)}</p></div>
            <div className="md:col-span-2 bg-pink-100 p-4 rounded shadow"><p className="font-semibold">Courses:</p><p>{examiner.courses?.join(', ')}</p></div>
            <div className="md:col-span-2 bg-indigo-100 p-4 rounded shadow"><p className="font-semibold">Modules:</p><p>{examiner.modules?.join(', ')}</p></div>
          </div>

          {/* Recent Notifications Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Recent Notifications</h2>
            {notifications.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded text-center text-gray-500">
                No recent notifications
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification._id} className="bg-white border rounded-lg p-4 hover:border-indigo-300 transition-colors shadow-sm">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{notification.body}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-sm text-gray-500">{formatDate(notification.effectiveDate)}</span>
                      {notification.highlightNotice && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded">Important</span>
                      )}
                    </div>
                  </div>
                ))}
                {notifications.length > 3 && (
                  <div className="text-center">
                    <button 
                      onClick={() => setShowNotifications(true)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Schedule Table */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Presentation Schedule</h2>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border text-left">Date</th>
                  <th className="px-4 py-2 border text-left">Time</th>
                  <th className="px-4 py-2 border text-left">Hall No.</th>
                  <th className="px-4 py-2 border text-left">Student Group Number</th>
                </tr>
              </thead>
              <tbody>
                {examiner.presentations.map((presentation, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{presentation.date}</td>
                    <td className="px-4 py-2">{presentation.time}</td>
                    <td className="px-4 py-2">{presentation.hall}</td>
                    <td className="px-4 py-2">{presentation.groupName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Side Profile Modal */}
      {showProfile && (
        <div className="fixed top-0 right-0 h-full w-full bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto transform transition-all duration-300 shadow-xl rounded-l-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-indigo-700">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-red-500 text-2xl hover:text-red-600"
              >
                ✖
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">ID</label>
                <input type="text" value={examiner.id} disabled className="w-full p-2 border bg-gray-100 rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Email</label>
                <input type="email" value={examiner.email} disabled className="w-full p-2 border bg-gray-100 rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">First Name</label>
                <input name="fname" value={editedExaminer.fname || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Last Name</label>
                <input name="lname" value={editedExaminer.lname || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Phone</label>
                <input name="phone" value={editedExaminer.phone || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
              </div>

              {!editedExaminer.showPasswordFields ? (
                <button
                  onClick={() => setEditedExaminer(prev => ({ ...prev, showPasswordFields: true }))} 
                  className="text-blue-600 font-medium underline"
                >
                  Change Password
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold">Current Password</label>
                    <input type="password" name="currentPassword" value={editedExaminer.currentPassword || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">New Password</label>
                    <input type="password" name="newPassword" value={editedExaminer.newPassword || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Re-enter New Password</label>
                    <input type="password" name="confirmPassword" value={editedExaminer.confirmPassword || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
                  </div>
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                </>
              )}

              <div className="flex flex-col gap-2 mt-4">
                <button onClick={handleSaveChanges} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">
                  Save Changes
                </button>
                {editedExaminer.showPasswordFields && (
                  <button onClick={handleSavePassword} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                    Save Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">AutoShed</h3>
              <p className="text-gray-400 text-base">A comprehensive platform for managing exam scheduling and presentations.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="/examiners" className="hover:text-white">Examiners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@autoshed.com</li>
                <li>Phone: +1 800 123 4567</li>
              </ul>
            </div>
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