import React, { useState, useEffect, useCallback } from "react";
import { NoticeMng } from "../api/noticeApi";
import Sidebar from "../components/Sidebar";
import { Layout } from "antd";

const { Content } = Layout;

// Enhanced Admin API functions with proper backend integration
const AdminNotificationMng = {
  getNotifications: async () => {
    try {
      return await NoticeMng.getNotices();
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  uploadAttachment: async (file) => {
    try {
      // In a real implementation, this would use the actual backend API
      const formData = new FormData();
      formData.append('file', file);
      
      // Replace with your actual API endpoint
      // const response = await fetch('/api/attachments/upload', {
      //   method: 'POST',
      //   body: formData
      // });
      // const data = await response.json();
      // return data;

      // Create a local URL for the frontend display
      const fileUrl = URL.createObjectURL(file);
      
      // Mock implementation for demo purposes
      // Store additional metadata that we'll use in the UI, but only send the URL to the backend
      const mockResponse = {
        id: Date.now().toString(),
        filename: file.name,
        url: fileUrl, // This is what will be sent to the backend
        size: file.size,
        type: file.type,
        displayUrl: fileUrl // For local UI display
      };
      return mockResponse;
    } catch (error) {
      console.error("Error in uploadAttachment:", error);
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  },

  deleteAttachment: async (attachmentId) => {
    try {
      // In a real implementation, this would call the actual backend API
      // await fetch(`/api/attachments/${attachmentId}`, {
      //   method: 'DELETE'
      // });
      
      // Mock implementation for demo purposes
      return { success: true };
    } catch (error) {
      console.error("Error in deleteAttachment:", error);
      throw error;
    }
  },

  createNotification: async (notification) => {
    try {
      // Add audit trail
      notification.createdAt = new Date().toISOString();
      notification.createdBy = "Current Admin User"; // Would come from auth context
      
      // Create a deep copy of the notification to avoid modifying the original
      const notificationToSend = JSON.parse(JSON.stringify(notification));
      
      // Convert attachment objects to strings (URLs) for the backend
      // The backend schema expects attachments to be an array of strings
      if (Array.isArray(notificationToSend.attachments) && notificationToSend.attachments.length > 0) {
        // Extract just the URLs from the attachment objects
        notificationToSend.attachments = notificationToSend.attachments.map(attachment => 
          attachment.url || attachment.filename || attachment
        );
      } else {
        notificationToSend.attachments = [];
      }
      
      console.log("Sending notification with attachments:", notificationToSend.attachments);
      
      // Make sure we call the backend API with properly formatted data
      const result = await NoticeMng.createNotice(notificationToSend);
      
      // Return the result from the backend, not the local object
      return result;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  },

  updateNotification: async (id, notification) => {
    try {
      // Add audit trail
      notification.lastModifiedAt = new Date().toISOString();
      notification.lastModifiedBy = "Current Admin User"; // Would come from auth context
      
      // Create a deep copy of the notification to avoid modifying the original
      const notificationToSend = JSON.parse(JSON.stringify(notification));
      
      // Convert attachment objects to strings (URLs) for the backend
      // The backend schema expects attachments to be an array of strings
      if (Array.isArray(notificationToSend.attachments) && notificationToSend.attachments.length > 0) {
        // Extract just the URLs from the attachment objects
        notificationToSend.attachments = notificationToSend.attachments.map(attachment => 
          attachment.url || attachment.filename || attachment
        );
      } else {
        notificationToSend.attachments = [];
      }
      
      console.log("Sending notification with attachments:", notificationToSend.attachments);
      
      // Make sure we call the backend API with properly formatted data
      const result = await NoticeMng.updateNotice(id, notificationToSend);
      
      // Return the result from the backend, not the local object
      return result;
    } catch (error) {
      console.error("Error updating notification:", error);
      throw error;
    }
  },

  bulkDeleteNotifications: async (ids) => {
    try {
      // Admin-specific function to delete multiple notifications at once
      const results = await Promise.all(ids.map(id => NoticeMng.deleteNotice(id)));
      return { 
        success: results.every(result => result.success), 
        deletedCount: results.filter(result => result.success).length 
      };
    } catch (error) {
      console.error("Error in bulk delete:", error);
      throw error;
    }
  },

  getNotificationStats: async () => {
    try {
      // Fetch all notifications to calculate stats
      const notifications = await NoticeMng.getNotices();

      const currentDate = new Date();
      const oneWeekLater = new Date();
      oneWeekLater.setDate(oneWeekLater.getDate() + 7);

      // Calculate stats
      const totalNotifications = notifications.length;
      const activeNotifications = notifications.filter(notification => 
        new Date(notification.expirationDate) >= currentDate
      ).length;

      const expiringThisWeek = notifications.filter(notification => 
        new Date(notification.expirationDate) >= currentDate && 
        new Date(notification.expirationDate) <= oneWeekLater
      ).length;

      // Aggregate view counts by type
      const viewsByType = notifications.reduce((acc, notification) => {
        const type = notification.type;
        if (!acc[type]) acc[type] = 0;
        acc[type] += notification.viewCount || 0;
        return acc;
      }, {
        Academic: 0,
        Administrative: 0,
        Event: 0
      });

      return {
        totalNotifications,
        activeNotifications,
        expiringThisWeek,
        viewsByType
      };
    } catch (error) {
      console.error("Error fetching notification stats:", error);
      throw error;
    }
  },

  deleteNotification: async (id) => {
    try {
      return await NoticeMng.deleteNotice(id);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
};

// Utility functions for attachment handling
const getAttachmentIcon = (attachment) => {
  const type = typeof attachment === 'object' ? attachment.type : '';
  
  if (type.includes('image')) return '🖼️';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('zip')) return '🗜️';
  if (type.includes('csv')) return '📋';
  return '📎';
};

const formatAttachmentName = (attachment) => {
  if (typeof attachment === 'string') return attachment.split('/').pop();
  if (typeof attachment === 'object') return attachment.filename || 'Attachment';
  return 'Attachment';
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

// Function to normalize status values
const normalizeStatus = (status) => {
  if (!status) return 'Draft'; // Default status if undefined
  // Convert to string and capitalize first letter
  return status.toString().charAt(0).toUpperCase() + status.toString().slice(1);
};

// Get a valid URL from an attachment object or string
const getAttachmentUrl = (attachment) => {
  if (typeof attachment === 'object') {
    return attachment.displayUrl || attachment.url || '#';
  } else if (typeof attachment === 'string') {
    return attachment;
  }
  return '#';
};

// Helper function to download attachment
const downloadAttachment = (attachment) => {
  try {
    let url = '';
    let filename = '';
    
    if (typeof attachment === 'object') {
      url = attachment.displayUrl || attachment.url;
      filename = attachment.filename || url.split('/').pop() || 'download';
    } else if (typeof attachment === 'string') {
      url = attachment;
      filename = url.split('/').pop() || 'download';
    } else {
      throw new Error('Invalid attachment format');
    }
    
    // Check if URL is valid
    if (!url || url === '#') {
      throw new Error('No valid URL found for the attachment');
    }
    
    // Create an anchor element and set download attribute
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading attachment:", error);
    alert("Failed to download attachment: " + error.message);
  }
};

// Enhanced component to display attachments - direct opening instead of modal
const AttachmentsList = ({ attachments }) => {
  if (!attachments || !Array.isArray(attachments) || attachments.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-2">
      <div className="flex items-center text-xs text-gray-500 mb-1">
        <span className="mr-1">📎</span>
        <span>{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="pl-4 border-l-2 border-gray-200 space-y-2">
        {attachments.map((attachment, idx) => {
          // Get URL and filename
          const url = getAttachmentUrl(attachment);
          const filename = formatAttachmentName(attachment);
          const fileType = typeof attachment === 'object' ? attachment.type : '';
          const fileSize = typeof attachment === 'object' ? attachment.size : null;
          
          return (
            <div key={idx} className="flex items-center text-xs bg-gray-50 p-2 rounded-md">
              <span className="text-xl mr-2">{getAttachmentIcon(attachment)}</span>
              <div className="flex-1 overflow-hidden">
                <div className="truncate font-medium">{filename}</div>
                {fileType && fileSize && (
                  <div className="text-gray-500 text-xs">
                    {fileType.split('/')[1]} · {formatFileSize(fileSize)}
                  </div>
                )}
              </div>
              <div className="ml-2 flex space-x-2">
                <a 
                  href={url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Open
                </a>
                <button
                  onClick={() => downloadAttachment(attachment)}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                >
                  Download
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function AdminNotificationPanel() {
  // State management
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editNotificationId, setEditNotificationId] = useState(null);
  const [sortBy, setSortBy] = useState("effectiveDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [stats, setStats] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // list, grid, calendar
  const [isDragging, setIsDragging] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0); // New state to trigger refreshes

  // Utility functions
  function formatDate(date) {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Initial notification state with additional admin fields
  const [newNotification, setNewNotification] = useState({
    id: Date.now().toString(),
    title: "",
    type: "Academic",
    priority: "Medium",
    body: "",
    author: "",
    effectiveDate: formatDate(new Date()),
    expirationDate: formatDate(addDays(new Date(), 30)),
    tags: [],
    attachments: [],
    publishToStudents: false,
    publishToExaminers: false,
    highlightNotice: false,
    status: "Draft", // Default status is now Draft instead of Published
    notifyViaEmail: false, // New field: Send email notification
    targetAudience: [] // New field: More specific targeting
  });

  // Fetch notifications and stats on component mount or when refreshTrigger changes
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedNotifications, fetchedStats] = await Promise.all([
        AdminNotificationMng.getNotifications(),
        AdminNotificationMng.getNotificationStats()
      ]);
      
      setNotifications(fetchedNotifications);
      setStats(fetchedStats);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setError("Failed to load administrative data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [refreshTrigger]); // Add refreshTrigger as a dependency

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter and sort notifications whenever dependencies change
  useEffect(() => {
    let result = [...notifications];

    // Apply type filter
    if (filterType !== "all") {
      result = result.filter(notification => notification.type === filterType);
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      result = result.filter(notification => notification.priority === filterPriority);
    }
    
    // Apply status filter - Updated to use normalized status values
    if (filterStatus !== "all") {
      result = result.filter(notification => {
        const notificationStatus = normalizeStatus(notification.status);
        return notificationStatus === filterStatus;
      });
    }

    // Apply search filter (enhanced with more fields)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(notification => 
        (notification.title || '').toLowerCase().includes(lowerSearchTerm) ||
        (notification.body || '').toLowerCase().includes(lowerSearchTerm) ||
        (notification.author || '').toLowerCase().includes(lowerSearchTerm) ||
        (notification.tags && Array.isArray(notification.tags) && notification.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))) ||
        (notification.id || '').toLowerCase().includes(lowerSearchTerm)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let valueA, valueB;

      if (sortBy === "effectiveDate") {
        valueA = new Date(a.effectiveDate);
        valueB = new Date(b.effectiveDate);
      } else if (sortBy === "priority") {
        const priorityMap = { Low: 1, Medium: 2, High: 3 };
        valueA = priorityMap[a.priority];
        valueB = priorityMap[b.priority];
      } else if (sortBy === "viewCount") {
        valueA = a.viewCount || 0;
        valueB = b.viewCount || 0;
      } else {
        valueA = a[sortBy];
        valueB = b[sortBy];
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredNotifications(result);
  }, [notifications, filterType, filterPriority, filterStatus, searchTerm, sortBy, sortOrder]);

  // Helper function to refresh data from backend
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Other utility functions
  function isExpired(expirationDate) {
    return new Date() > new Date(expirationDate);
  }

  function isExpiringSoon(expirationDate) {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.floor((expDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration >= 0;
  }

  // Enhanced file handling functions
  const handleFileChange = async (e) => {
    const files = e.target.files || e.dataTransfer.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const uploadedFiles = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size (10MB limit for admin)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 10MB size limit`);
        }

        // More file types allowed for admin
        const allowedTypes = [
          'application/pdf', 
          'image/jpeg', 
          'image/png', 
          'application/msword', 
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/zip',
          'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
          throw new Error(`File type ${file.type} not supported`);
        }

        try {
          const uploadedFile = await AdminNotificationMng.uploadAttachment(file);
          if (uploadedFile && uploadedFile.id) {
            uploadedFiles.push(uploadedFile);
          }
        } catch (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
          throw new Error(`Failed to upload ${file.name}: ${uploadError.message}`);
        }
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }

      if (uploadedFiles.length > 0) {
        setNewNotification(prev => {
          const currentAttachments = Array.isArray(prev.attachments) ? prev.attachments : [];
          return {
            ...prev,
            attachments: [...currentAttachments, ...uploadedFiles]
          };
        });

        setStatusMessage(`Successfully uploaded ${uploadedFiles.length} file(s)`);
        setTimeout(() => setStatusMessage(""), 3000);
      } else {
        throw new Error("No files were uploaded successfully");
      }

    } catch (error) {
      console.error("Error uploading files:", error);
      setError(error.message || "Failed to upload files");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    try {
      setIsLoading(true);
      
      // If using numeric index for simple string attachments
      if (typeof attachmentId === 'number') {
        setNewNotification(prev => {
          const currentAttachments = Array.isArray(prev.attachments) ? prev.attachments : [];
          return {
            ...prev,
            attachments: currentAttachments.filter((_, index) => index !== attachmentId)
          };
        });
      } else {
        // For complex attachment objects with IDs
        await AdminNotificationMng.deleteAttachment(attachmentId);
        
        setNewNotification(prev => {
          const currentAttachments = Array.isArray(prev.attachments) ? prev.attachments : [];
          return {
            ...prev,
            attachments: currentAttachments.filter(att => 
              typeof att === 'object' ? att.id !== attachmentId : true
            )
          };
        });
      }
      
      setStatusMessage("Attachment removed successfully");
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (error) {
      console.error("Error removing attachment:", error);
      setError("Failed to remove attachment: " + (error.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  // Form submission with proper backend integration
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!newNotification.title.trim()) {
        throw new Error("Title is required");
      }

      if (!newNotification.body.trim()) {
        throw new Error("Content is required");
      }

      // Check if dates are valid
      if (new Date(newNotification.expirationDate) < new Date(newNotification.effectiveDate)) {
        throw new Error("Expiration date cannot be earlier than effective date");
      }

      if (editNotificationId) {
        // Update existing notification
        await AdminNotificationMng.updateNotification(editNotificationId, newNotification);
        setStatusMessage("Notification updated successfully!");
      } else {
        // Create new notification
        await AdminNotificationMng.createNotification(newNotification);
        setStatusMessage("Notification created successfully!");
      }

      // Reset form and close it
      setNewNotification({
        id: Date.now().toString(),
        title: "",
        type: "Academic",
        priority: "Medium",
        body: "",
        author: "",
        effectiveDate: formatDate(new Date()),
        expirationDate: formatDate(addDays(new Date(), 30)),
        tags: [],
        attachments: [],
        publishToStudents: false,
        publishToExaminers: false,
        highlightNotice: false,
        status: "Draft",
        notifyViaEmail: false,
        targetAudience: []
      });
      
      setIsFormVisible(false);
      setEditNotificationId(null);

      // Refresh data from backend
      refreshData();

      // Clear status message after 3 seconds
      setTimeout(() => {
        setStatusMessage("");
      }, 3000);
    } catch (error) {
      console.error("Error submitting notification:", error);
      setError(error.message || "Failed to save notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotifications.length === 0) return;

    if (window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications? This action cannot be undone.`)) {
      setIsLoading(true);
      try {
        await AdminNotificationMng.bulkDeleteNotifications(selectedNotifications);
        setSelectedNotifications([]);
        setBulkSelectMode(false);
        setStatusMessage(`Successfully deleted ${selectedNotifications.length} notifications`);
        
        // Refresh data from backend
        refreshData();
        
        setTimeout(() => setStatusMessage(""), 3000);
      } catch (error) {
        console.error("Error during bulk delete:", error);
        setError("Failed to delete selected notifications: " + (error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(notificationId => notificationId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      // Deselect all
      setSelectedNotifications([]);
    } else {
      // Select all
      setSelectedNotifications(filteredNotifications.map(notification => notification.id));
    }
  };

  // Standard handlers
  const handleEdit = (notification) => {
    setEditNotificationId(notification.id);
    // Make a deep copy to avoid reference issues
    setNewNotification(JSON.parse(JSON.stringify(notification)));
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      setIsLoading(true);
      try {
        await AdminNotificationMng.deleteNotification(id);
        setStatusMessage("Notification deleted successfully!");
        
        // Refresh data from backend
        refreshData();
        
        setTimeout(() => setStatusMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting notification:", error);
        setError("Failed to delete notification: " + (error.message || "Unknown error"));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e);
  };

  const getPriorityColor = (priority) => {
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'Academic':
        return 'bg-blue-100 text-blue-800';
      case 'Administrative':
        return 'bg-purple-100 text-purple-800';
      case 'Event':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusColor = (status) => {
    const normalizedStatus = normalizeStatus(status);
    
    switch (normalizedStatus) {
      case 'Published':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Archived':
        return 'bg-amber-100 text-amber-800';
      case 'Pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calendar view functions
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const selectDate = (date) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
    setSelectedDate(newDate);
  };

  const getNotificationsForDate = (date) => {
    // Format the selected date for comparison
    const dateStr = formatDate(date);
    
    return filteredNotifications.filter(notification => {
      const effectiveDate = notification.effectiveDate;
      const expirationDate = notification.expirationDate;
      
      // Check if the notification is active on this date
      return dateStr >= effectiveDate && dateStr <= expirationDate;
    });
  };

  // Check if a date has notifications
  const hasNotificationsOnDate = (date) => {
    try {
      const fullDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date);
      return getNotificationsForDate(fullDate).length > 0;
    } catch (error) {
      console.error("Error checking notifications for date:", error);
      return false;
    }
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Prepare calendar days
    const calendarDays = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-12 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = new Date().getDate() === day && 
                       new Date().getMonth() === month && 
                       new Date().getFullYear() === year;
      const isSelected = selectedDate.getDate() === day && 
                        selectedDate.getMonth() === month && 
                        selectedDate.getFullYear() === year;
      const hasNotifications = hasNotificationsOnDate(day);
      
      calendarDays.push(
        <div 
          key={`day-${day}`} 
          className={`h-12 border border-gray-200 p-1 relative cursor-pointer
                    ${isToday ? 'bg-blue-50' : ''}
                    ${isSelected ? 'ring-2 ring-blue-500' : ''}
                    ${hasNotifications ? 'font-bold' : ''}`}
          onClick={() => selectDate(day)}
        >
          <div className="flex justify-between">
            <span>{day}</span>
            {hasNotifications && <span className="h-2 w-2 rounded-full bg-blue-600"></span>}
          </div>
        </div>
      );
    }
    
    // Add extra days to fill the last row if needed (for aesthetics)
    const totalCells = calendarDays.length;
    const totalRows = Math.ceil(totalCells / 7);
    const totalCellsNeeded = totalRows * 7;
    
    for (let i = totalCells; i < totalCellsNeeded; i++) {
      calendarDays.push(<div key={`extra-${i}`} className="h-12 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Get notifications for the selected date
    const selectedDateNotifications = getNotificationsForDate(selectedDate);
    
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          {/* Calendar header */}
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              &larr;
            </button>
            <h2 className="text-xl font-semibold">{monthNames[month]} {year}</h2>
            <button 
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              &rarr;
            </button>
          </div>
          
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-0 mb-1">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-0 mb-4">
            {calendarDays}
          </div>
          
          {/* Selected date notifications */}
          <div className="mt-4 border-t pt-4">
            <h3 className="text-lg font-medium mb-2">
              Notifications for {formatDate(selectedDate)}
            </h3>
            
            {selectedDateNotifications.length === 0 ? (
              <p className="text-gray-500">No notifications for this date.</p>
            ) : (
              <div className="space-y-3">
                {selectedDateNotifications.map(notification => (
                  <div key={notification.id} className="p-3 border rounded-md hover:bg-gray-50">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{notification.title}</h4>
                      <div className="flex space-x-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(notification.status)}`}>
                          {normalizeStatus(notification.status)}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.body}</p>
                    
                    {/* Display attachments directly */}
                    {notification.attachments && notification.attachments.length > 0 && (
                      <AttachmentsList attachments={notification.attachments} />
                    )}
                    
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Author: {notification.author || 'N/A'}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(notification);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(notification.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout className="min-h-screen">
      <Sidebar />
      <Layout className="bg-gray-100">
        <Content className="p-4">
          <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h1 className="text-3xl font-bold text-gray-800">Admin Notification Management</h1>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md ${viewMode === "list" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  title="List View"
                >
                  📋
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md ${viewMode === "grid" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  title="Grid View"
                >
                  📊
                </button>
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-2 rounded-md ${viewMode === "calendar" ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                  title="Calendar View"
                >
                  📅
                </button>
         
              </div>
            </div>

            {/* Admin Dashboard Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
                  <h3 className="text-sm font-medium text-gray-500">Total Notifications</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalNotifications}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
                  <h3 className="text-sm font-medium text-gray-500">Active Notifications</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.activeNotifications}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
                  <h3 className="text-sm font-medium text-gray-500">Expiring This Week</h3>
                  <p className="text-2xl font-bold text-gray-800">{stats.expiringThisWeek}</p>
                </div>
              </div>
            )}

            {/* Status Message */}
            {statusMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
                <span className="mr-2">✅</span>
                {statusMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
                <span className="mr-2">❌</span>
                {error}
              </div>
            )}

            {/* Notification Form */}
            {isFormVisible && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {editNotificationId ? "Edit Notification" : "Create New Notification"}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        name="title"
                        value={newNotification.title}
                        onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                      <input
                        type="text"
                        name="author"
                        value={newNotification.author}
                        onChange={(e) => setNewNotification({...newNotification, author: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        name="type"
                        value={newNotification.type}
                        onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Academic">Academic</option>
                        <option value="Administrative">Administrative</option>
                        <option value="Event">Event</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select
                        name="priority"
                        value={newNotification.priority}
                        onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        name="status"
                        value={newNotification.status}
                        onChange={(e) => setNewNotification({...newNotification, status: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Pending">Pending</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date</label>
                      <input
                        type="date"
                        name="effectiveDate"
                        value={newNotification.effectiveDate}
                        onChange={(e) => setNewNotification({...newNotification, effectiveDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
                      <input
                        type="date"
                        name="expirationDate"
                        value={newNotification.expirationDate}
                        onChange={(e) => setNewNotification({...newNotification, expirationDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      name="body"
                      value={newNotification.body}
                      onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="6"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && tagInput.trim()) {
                            e.preventDefault();
                            const currentTags = Array.isArray(newNotification.tags) ? newNotification.tags : [];
                            if (!currentTags.includes(tagInput.trim())) {
                              setNewNotification({
                                ...newNotification,
                                tags: [...currentTags, tagInput.trim()]
                              });
                            }
                            setTagInput('');
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (tagInput.trim()) {
                            const currentTags = Array.isArray(newNotification.tags) ? newNotification.tags : [];
                            if (!currentTags.includes(tagInput.trim())) {
                              setNewNotification({
                                ...newNotification,
                                tags: [...currentTags, tagInput.trim()]
                              });
                            }
                            setTagInput('');
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Array.isArray(newNotification.tags) && newNotification.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md flex items-center"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              setNewNotification({
                                ...newNotification,
                                tags: newNotification.tags.filter((_, i) => i !== index)
                              });
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                    <div 
                      className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer ${
                        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => document.getElementById("file-upload").click()}
                    >
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <span className="text-3xl mb-2">📂</span>
                      <p className="text-sm text-gray-600 text-center">
                        Drag & drop files here, or click to select files
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, Word, Excel, Images, CSV (Max 10MB)
                      </p>
                    </div>
                    
                    {/* Upload progress */}
                    {uploadProgress > 0 && (
                      <div className="mt-2">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Attachment list */}
                    {Array.isArray(newNotification.attachments) && newNotification.attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Uploaded Files:</p>
                        {Array.isArray(newNotification.attachments) && newNotification.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <span className="mr-2">{getAttachmentIcon(attachment)}</span>
                              <span className="text-sm">{typeof attachment === 'object' ? attachment.filename : attachment}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              {typeof attachment === 'object' && attachment.displayUrl && (
                                <>
                                  <a 
                                    href={attachment.displayUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:text-blue-800 focus:outline-none"
                                  >
                                    View
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => downloadAttachment(attachment)}
                                    className="text-green-600 hover:text-green-800 focus:outline-none"
                                  >
                                    Download
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRemoveAttachment(typeof attachment === 'object' ? attachment.id : index)}
                                className="text-red-600 hover:text-red-800 focus:outline-none"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Advanced options */}
                  <div className="space-y-3 pt-3 border-t border-gray-200">
                    <h3 className="text-sm font-medium text-gray-700">Advanced Options</h3>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="publishToStudents"
                        checked={newNotification.publishToStudents}
                        onChange={(e) => setNewNotification({...newNotification, publishToStudents: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="publishToStudents" className="text-sm text-gray-700">
                        Publish to Students
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="publishToExaminers"
                        checked={newNotification.publishToExaminers}
                        onChange={(e) => setNewNotification({...newNotification, publishToExaminers: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="publishToExaminers" className="text-sm text-gray-700">
                        Publish to Examiners
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="highlightNotice"
                        checked={newNotification.highlightNotice}
                        onChange={(e) => setNewNotification({...newNotification, highlightNotice: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="highlightNotice" className="text-sm text-gray-700">
                        Highlight Notification
                      </label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="notifyViaEmail"
                        checked={newNotification.notifyViaEmail}
                        onChange={(e) => setNewNotification({...newNotification, notifyViaEmail: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="notifyViaEmail" className="text-sm text-gray-700">
                        Send Email Notification
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormVisible(false);
                        setEditNotificationId(null);
                        setNewNotification({
                          id: Date.now().toString(),
                          title: "",
                          type: "Academic",
                          priority: "Medium",
                          body: "",
                          author: "",
                          effectiveDate: formatDate(new Date()),
                          expirationDate: formatDate(addDays(new Date(), 30)),
                          tags: [],
                          attachments: [],
                          publishToStudents: false,
                          publishToExaminers: false,
                          highlightNotice: false,
                          status: "Draft",
                          notifyViaEmail: false,
                          targetAudience: []
                        });
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Saving...' : editNotificationId ? 'Update Notification' : 'Create Notification'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Enhanced Admin Control Panel */}
            <div className="bg-gray-50 rounded-lg p-5 mb-6 shadow-sm">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                {/* Search with advanced options */}
                <div className="flex-1 min-w-[300px]">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search notifications by title, content, author, tags or ID..."
                      className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-3 top-2.5 text-gray-400">
                      🔍
                    </span>
                  </div>
                </div>

                {/* Admin Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="Academic">Academic</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Event">Event</option>
                  </select>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                  >
                    <option value="all">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="Draft">Draft</option>
                    <option value="Pending">Pending</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                  
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder);
                    }}
                  >
                    <option value="effectiveDate-desc">Newest First</option>
                    <option value="effectiveDate-asc">Oldest First</option>
                    <option value="priority-desc">Priority (High-Low)</option>
                    <option value="priority-asc">Priority (Low-High)</option>
                    <option value="viewCount-desc">Most Viewed</option>
                  </select>
                </div>
                
                {/* Admin Action Buttons */}
                <div className="flex gap-2">
                  {bulkSelectMode ? (
                    <>
                      <button
                        onClick={toggleSelectAll}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          selectedNotifications.length === filteredNotifications.length
                            ? 'bg-blue-200 text-blue-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {selectedNotifications.length === filteredNotifications.length
                          ? 'Deselect All'
                          : 'Select All'}
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        disabled={selectedNotifications.length === 0}
                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                          selectedNotifications.length > 0
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Delete Selected ({selectedNotifications.length})
                      </button>
                      <button
                        onClick={() => {
                          setBulkSelectMode(false);
                          setSelectedNotifications([]);
                        }}
                        className="px-3 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setBulkSelectMode(true)}
                        className="px-3 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md"
                        title="Bulk Actions"
                      >
                        Bulk Actions
                      </button>
                      <button
                        onClick={() => {
                          setIsFormVisible(!isFormVisible);
                          if (!isFormVisible) {
                            setEditNotificationId(null);
                            setNewNotification({
                              id: Date.now().toString(),
                              title: "",
                              type: "Academic",
                              priority: "Medium",
                              body: "",
                              author: "",
                              effectiveDate: formatDate(new Date()),
                              expirationDate: formatDate(addDays(new Date(), 30)),
                              tags: [],
                              attachments: [],
                              publishToStudents: false,
                              publishToExaminers: false,
                              highlightNotice: false,
                              status: "Draft",
                              notifyViaEmail: false,
                              targetAudience: []
                            });
                          }
                        }}
                        className="px-3 py-2 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        {isFormVisible ? "Cancel" : "Create Notification"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Notification List View */}
            {viewMode === "list" && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {bulkSelectMode && (
                        <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                            onChange={toggleSelectAll}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                      )}
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dates
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={bulkSelectMode ? 7 : 6} className="px-3 py-4 text-center text-sm text-gray-500">
                          Loading notifications...
                        </td>
                      </tr>
                    ) : filteredNotifications.length === 0 ? (
                      <tr>
                        <td colSpan={bulkSelectMode ? 7 : 6} className="px-3 py-4 text-center text-sm text-gray-500">
                          No notifications found.
                        </td>
                      </tr>
                    ) : (
                      filteredNotifications.map((notification) => (
                        <tr key={notification.id} className={`${isExpired(notification.expirationDate) ? 'bg-gray-50' : ''} group hover:bg-gray-50`}>
                          {bulkSelectMode && (
                            <td className="px-3 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedNotifications.includes(notification.id)}
                                onChange={() => toggleSelectNotification(notification.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                          )}
                          <td className="px-3 py-4">
                            <div className="flex flex-col">
                              <div className="text-sm font-medium text-gray-900">
                                {notification.title}
                                {notification.highlightNotice && (
                                  <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                                    ⭐
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ID: {notification.id ? notification.id.slice(0, 8) : 'N/A'}... | Author: {notification.author || 'N/A'}
                              </div>
                              {notification.tags && Array.isArray(notification.tags) && notification.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {notification.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                      {tag}
                                    </span>
                                  ))}
                                  {notification.tags.length > 3 && (
                                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-gray-100 text-gray-800">
                                      +{notification.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Direct attachments display */}
                              {notification.attachments && notification.attachments.length > 0 && (
                                <AttachmentsList attachments={notification.attachments} />
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>
                              <span className="font-medium">Effective:</span> {notification.effectiveDate}
                            </div>
                            <div className={
                              isExpired(notification.expirationDate)
                                ? 'text-red-600'
                                : isExpiringSoon(notification.expirationDate)
                                  ? 'text-amber-600'
                                  : ''
                            }>
                              <span className="font-medium">Expires:</span> {notification.expirationDate} 
                              {isExpired(notification.expirationDate) && ' (Expired)'}
                              {!isExpired(notification.expirationDate) && isExpiringSoon(notification.expirationDate) && ' (Soon)'}
                            </div>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                              {normalizeStatus(notification.status)}
                            </span>
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap text-sm text-right space-x-1">
                            <button
                              onClick={() => handleEdit(notification)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                              title="Edit"
                            >
                              Edit
                            </button>
                            
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                              title="Delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    Loading notifications...
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No notifications found.
                  </div>
                ) : (
                  filteredNotifications.map((notification) => (
                    <div 
                      key={notification.id} 
                      className={`bg-white rounded-lg shadow-md overflow-hidden relative ${
                        isExpired(notification.expirationDate) ? 'opacity-75' : ''
                      }`}
                    >
                      {bulkSelectMode && (
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => toggleSelectNotification(notification.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      )}
                      
                      <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900 pr-4">{notification.title}</h3>
                          <div className="flex space-x-1">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(notification.type)}`}>
                              {notification.type}
                            </span>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(notification.status)}`}>
                              {normalizeStatus(notification.status)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          <p className="line-clamp-3">{notification.body}</p>
                        </div>
                        
                        {notification.tags && Array.isArray(notification.tags) && notification.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {notification.tags.map((tag, idx) => (
                              <span key={idx} className="px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Direct attachments display */}
                        {notification.attachments && notification.attachments.length > 0 && (
                          <AttachmentsList attachments={notification.attachments} />
                        )}
                        
                        <div className="mt-4 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>
                              <span className="font-medium">Effective:</span> {notification.effectiveDate}
                            </span>
                            <span className={
                              isExpired(notification.expirationDate)
                                ? 'text-red-600'
                                : isExpiringSoon(notification.expirationDate)
                                  ? 'text-amber-600'
                                  : ''
                            }>
                              <span className="font-medium">Expires:</span> {notification.expirationDate}
                            </span>
                          </div>
                          
                          <div className="flex justify-between mt-1">
                            <span>
                              <span className="font-medium">Author:</span> {notification.author || 'N/A'}
                            </span>
                            <span>
                              <span className="font-medium">ID:</span> {notification.id ? notification.id.slice(0, 8) : 'N/A'}...
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="px-4 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(notification)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                          title="Edit"
                        >
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Calendar View */}
            {viewMode === "calendar" && renderCalendar()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminNotificationPanel;