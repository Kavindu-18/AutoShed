import React, { useState, useEffect } from 'react';
import {
  AlertCircle, Bell, Calendar, CheckCircle, Edit2, Trash2, Plus, Eye, Users,
  Tag, FileText, AlertTriangle, Clock, Archive, Send, Search, Grid, List,
  Filter, ChevronLeft, ChevronRight, LayoutGrid, BarChart2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Sidebar from "../components/Sidebar";

const AdminNotificationPage = () => {
  // State management
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [audienceStats, setAudienceStats] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'Academic',
    priority: 'Medium',
    status: 'Draft',
    targetAudience: [],
    effectiveDate: new Date().toISOString().split('T')[0],
    expirationDate: '',
    tags: '',
    highlightNotice: false,
    notifyViaEmail: false
  });

  // Backend API base URL
  const API_BASE_URL = 'http://localhost:5001';

  // Colors for pie chart
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

  // Fetch notifications and stats
  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      calculateAudienceDistribution();
    }
  }, [notifications]);

  const calculateAudienceDistribution = () => {
    const audienceCounts = {
      students: 0,
      examiners: 0,
      common: 0
    };
    notifications.forEach(notification => {
      if (notification.targetAudience) {
        notification.targetAudience.forEach(audience => {
          if (audienceCounts.hasOwnProperty(audience)) {
            audienceCounts[audience]++;
          }
        });
      }
    });
    const total = Object.values(audienceCounts).reduce((sum, count) => sum + count, 0);
    const distributionData = [
      { name: 'Students', value: audienceCounts.students, percentage: ((audienceCounts.students / total) * 100).toFixed(1) || 0 },
      { name: 'Examiners', value: audienceCounts.examiners, percentage: ((audienceCounts.examiners / total) * 100).toFixed(1) || 0 },
      { name: 'Common', value: audienceCounts.common, percentage: ((audienceCounts.common / total) * 100).toFixed(1) || 0 }
    ];
    setAudienceStats(distributionData);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/stats/overview`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      setStats({
        totalNotifications: 0,
        activeNotifications: 0,
        expiringThisWeek: 0,
        byType: {}
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    else if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    else if (formData.title.length > 100) newErrors.title = 'Title must not exceed 100 characters';
    if (!formData.body.trim()) newErrors.body = 'Body is required';
    else if (formData.body.length < 10) newErrors.body = 'Body must be at least 10 characters';
    if (formData.targetAudience.length === 0) newErrors.targetAudience = 'Select at least one target audience';
    if (!formData.expirationDate) newErrors.expirationDate = 'Expiration date is required';
    else if (new Date(formData.expirationDate) <= new Date(formData.effectiveDate)) newErrors.expirationDate = 'Expiration date must be after effective date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const url = editingNotification
        ? `${API_BASE_URL}/api/notifications/${editingNotification._id}`
        : `${API_BASE_URL}/api/notifications`;
      const method = editingNotification ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
        })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await response.json();
      fetchNotifications();
      resetForm();
    } catch (error) {
      alert('Failed to save notification. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      type: 'Academic',
      priority: 'Medium',
      status: 'Draft',
      targetAudience: [],
      effectiveDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      tags: '',
      highlightNotice: false,
      notifyViaEmail: false
    });
    setEditingNotification(null);
    setShowForm(false);
    setErrors({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        fetchNotifications();
      } catch (error) {
        alert('Failed to delete notification. Please try again.');
      }
    }
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setFormData({
      title: notification.title,
      body: notification.body,
      type: notification.type,
      priority: notification.priority,
      status: notification.status,
      targetAudience: notification.targetAudience,
      effectiveDate: new Date(notification.effectiveDate).toISOString().split('T')[0],
      expirationDate: new Date(notification.expirationDate).toISOString().split('T')[0],
      tags: notification.tags.join(', '),
      highlightNotice: notification.highlightNotice,
      notifyViaEmail: notification.notifyViaEmail
    });
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'targetAudience') {
        const newAudience = checked
          ? [...formData.targetAudience, value]
          : formData.targetAudience.filter(audience => audience !== value);
        setFormData(prev => ({ ...prev, targetAudience: newAudience }));
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    let matchesTab = activeTab === 'all' || notification.status.toLowerCase() === activeTab;
    let matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.body.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    let matchesType = filterType === 'all' || notification.type === filterType;
    return matchesTab && matchesSearch && matchesPriority && matchesType;
  });

  // Pie chart label
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Calendar functions
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedMonth);
    const firstDayOfMonth = getFirstDayOfMonth(selectedMonth);
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };
  const getNotificationsForDate = (day) => {
    if (!day) return [];
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    return filteredNotifications.filter(notification => {
      const effectiveDate = new Date(notification.effectiveDate);
      const expirationDate = new Date(notification.expirationDate);
      return date >= effectiveDate && date <= expirationDate;
    });
  };
  const navigateMonth = (direction) => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(selectedMonth.getMonth() + direction);
    setSelectedMonth(newDate);
  };

  // Render views
  const renderListView = () => (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => (
        <div
          key={notification._id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                {notification.highlightNotice && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    Highlighted
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4">{notification.body}</p>
              <div className="flex flex-wrap gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  notification.priority === 'High' ? 'bg-red-100 text-red-800' :
                  notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {notification.priority} Priority
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  notification.status === 'Published' ? 'bg-green-100 text-green-800' :
                  notification.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {notification.status}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {notification.type}
                </span>
                {notification.targetAudience && notification.targetAudience.map((audience, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {audience}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(notification.effectiveDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Expires: {new Date(notification.expirationDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {notification.viewCount || 0} views
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleEdit(notification)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleDelete(notification._id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredNotifications.map((notification) => (
        <div
          key={notification._id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{notification.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(notification)}
                className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(notification._id)}
                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-gray-600 mb-4 line-clamp-2">{notification.body}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              notification.priority === 'High' ? 'bg-red-100 text-red-800' :
              notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {notification.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              notification.status === 'Published' ? 'bg-green-100 text-green-800' :
              notification.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {notification.status}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              {notification.type}
            </span>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(notification.effectiveDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {notification.viewCount || 0}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendarView = () => {
    const calendarDays = generateCalendarDays();
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return (
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {monthNames[selectedMonth.getMonth()]} {selectedMonth.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {weekDays.map(day => (
              <div key={day} className="bg-gray-50 text-center font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
            {calendarDays.map((day, index) => {
              const notifications = getNotificationsForDate(day);
              return (
                <div
                  key={index}
                  className={`min-h-[100px] bg-white border border-gray-100 p-2 ${
                    day ? 'hover:bg-gray-50' : 'bg-gray-50'
                  }`}
                >
                  {day && (
                    <>
                      <div className="font-medium text-gray-700">{day}</div>
                      <div className="mt-1 space-y-1">
                        {notifications.slice(0, 2).map((notification, i) => (
                          <div
                            key={i}
                            className={`text-xs p-1 rounded truncate cursor-pointer ${
                              notification.priority === 'High' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                            title={notification.title}
                            onClick={() => handleEdit(notification)}
                          >
                            {notification.title}
                          </div>
                        ))}
                        {notifications.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{notifications.length - 2} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Notification Management</h1>
                <p className="text-blue-100 mt-2">Manage and track all system notifications</p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                Create Notification
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-inner">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Notifications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalNotifications || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-inner">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeNotifications || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-inner">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.expiringThisWeek || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-inner">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Views</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats && stats.byType ? Object.values(stats.byType).reduce((acc, curr) => acc + (curr.views || 0), 0) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pie Chart - Audience Distribution */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8 p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart2 className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Notice Distribution by Target Audience</h2>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="w-full md:w-1/2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={audienceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {audienceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full md:w-1/2">
                <div className="grid grid-cols-1 gap-4">
                  {audienceStats.map((stat, index) => (
                    <div key={stat.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium text-gray-700">{stat.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{stat.value} notices</p>
                        <p className="text-sm text-gray-600">{stat.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-8">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                    showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="List View"
                >
                  <List className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'calendar' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Calendar View"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
            </div>
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Academic">Academic</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Event">Event</option>
                </select>
              </div>
            )}
          </div>

          {/* Tabs and Content Area */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-8">
            <div className="flex border-b border-gray-200">
              {['all', 'draft', 'published', 'archived'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading notifications...</p>
                </div>
              ) : filteredNotifications.length > 0 ? (
                viewMode === 'list' ? renderListView() :
                viewMode === 'grid' ? renderGridView() :
                renderCalendarView()
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No notifications found</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                  <h2 className="text-xl font-semibold">
                    {editingNotification ? 'Edit Notification' : 'Create New Notification'}
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.title ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                      }`}
                      placeholder="Enter notification title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>
                  {/* Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Body
                    </label>
                    <textarea
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      rows={4}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.body ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                      }`}
                      placeholder="Enter notification content"
                    />
                    {errors.body && (
                      <p className="mt-1 text-sm text-red-600">{errors.body}</p>
                    )}
                  </div>
                  {/* Type and Priority */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="Academic">Academic</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Event">Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  {/* Status and Target Audience */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <div className="space-y-2">
                        {['students', 'examiners', 'common'].map((audience) => (
                          <label key={audience} className="flex items-center">
                            <input
                              type="checkbox"
                              name="targetAudience"
                              value={audience}
                              checked={formData.targetAudience.includes(audience)}
                              onChange={handleInputChange}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm capitalize">{audience}</span>
                          </label>
                        ))}
                      </div>
                      {errors.targetAudience && (
                        <p className="mt-1 text-sm text-red-600">{errors.targetAudience}</p>
                      )}
                    </div>
                  </div>
                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Effective Date
                      </label>
                      <input
                        type="date"
                        name="effectiveDate"
                        value={formData.effectiveDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiration Date
                      </label>
                      <input
                        type="date"
                        name="expirationDate"
                        value={formData.expirationDate}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.expirationDate ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
                        }`}
                      />
                      {errors.expirationDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.expirationDate}</p>
                      )}
                    </div>
                  </div>
                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      placeholder="e.g., announcement, urgent, update"
                    />
                  </div>
                  {/* Checkboxes */}
                  <div className="flex gap-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="highlightNotice"
                        checked={formData.highlightNotice}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Highlight this notice</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="notifyViaEmail"
                        checked={formData.notifyViaEmail}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">Send email notification</span>
                    </label>
                  </div>
                  {/* Form Actions */}
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      {editingNotification ? (
                        <>
                          <Edit2 className="w-4 h-4" />
                          Update Notification
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Create Notification
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationPage;
