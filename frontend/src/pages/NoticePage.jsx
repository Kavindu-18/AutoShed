import React, { useState, useEffect } from "react";
import { NoticeMng } from "../api/noticeApi";

function EnhancedNoticePage() {
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState("effectiveDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [noticeStats, setNoticeStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    byType: {},
    byPriority: {}
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newNotice, setNewNotice] = useState({
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
    highlightNotice: false
  });

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

  function isExpired(expirationDate) {
    return new Date() > new Date(expirationDate);
  }

  // Fetch notices from API on component mount
  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await NoticeMng.getNotices();
        setNotices(response);
      } catch (err) {
        console.error("Failed to fetch notices:", err);
    setError("Failed to load notices. Please check your internet connection and try again.");

      } finally {
        setIsLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // Apply filters, search, and sorting
  useEffect(() => {
    let results = [...notices];
    
    // Apply type filter
    if (filterType !== "all") {
      results = results.filter(notice => notice.type === filterType);
    }
    
    // Apply priority filter
    if (filterPriority !== "all") {
      results = results.filter(notice => notice.priority === filterPriority);
    }
    
    // Apply search
    if (searchTerm) {
      results = results.filter(
        notice =>
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (notice.tags && notice.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
      );
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let valA, valB;
      
      switch (sortBy) {
        case "title":
          valA = a.title.toLowerCase();
          valB = b.title.toLowerCase();
          break;
        case "priority":
          const priorityOrder = { "High": 1, "Medium": 2, "Low": 3 };
          valA = priorityOrder[a.priority];
          valB = priorityOrder[b.priority];
          break;
        case "effectiveDate":
          valA = new Date(a.effectiveDate);
          valB = new Date(b.effectiveDate);
          break;
        case "expirationDate":
          valA = new Date(a.expirationDate);
          valB = new Date(b.expirationDate);
          break;
        default:
          valA = new Date(a.effectiveDate);
          valB = new Date(b.effectiveDate);
      }
      
      if (sortOrder === "asc") {
        return valA > valB ? 1 : -1;
      } else {
        return valA < valB ? 1 : -1;
      }
    });
    
    setFilteredNotices(results);
    
    // Update statistics
    const active = notices.filter(notice => !isExpired(notice.expirationDate)).length;
    const expired = notices.length - active;
    
    // Count by type
    const byType = notices.reduce((acc, notice) => {
      acc[notice.type] = (acc[notice.type] || 0) + 1;
      return acc;
    }, {});
    
    // Count by priority
    const byPriority = notices.reduce((acc, notice) => {
      acc[notice.priority] = (acc[notice.priority] || 0) + 1;
      return acc;
    }, {});
    
    setNoticeStats({
      total: notices.length,
      active,
      expired,
      byType,
      byPriority
    });
    
  }, [notices, searchTerm, sortBy, sortOrder, filterType, filterPriority]);

  // Effect to initialize dark mode based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Apply dark mode to document
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewNotice((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePublishTo = (target) => {
    setNewNotice((prev) => ({
      ...prev,
      [target]: !prev[target]
    }));
  };

  // Function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Improved file handling with error handling and feedback
  const handleFileChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return; // No files selected
    }
    
    setIsLoading(true);
    try {
      const files = Array.from(e.target.files);
      
      // Validate file types and sizes if needed
    const validFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 

                             'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB limit
      
      // Check each file
      for (const file of files) {
        if (maxFileSize && file.size > maxFileSize) {
          throw new Error(`File ${file.name} exceeds the 5MB size limit.`);
        }
        if (validFileTypes.length && !validFileTypes.includes(file.type)) {
          throw new Error(`File ${file.name} is not a supported file type.`);
        }
      }
      
      // Process files
      const filePromises = files.map(async (file) => {
        try {
          const base64Data = await convertToBase64(file);
          return {
            name: file.name,
            type: file.type,
            size: file.size,
            data: base64Data
          };
        } catch (err) {
          console.error(`Error processing file ${file.name}:`, err);
          throw new Error(`Failed to process file ${file.name}`);
        }
      });
      
      const fileData = await Promise.all(filePromises);
      
      setNewNotice((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...fileData]
      }));
    } catch (error) {
      console.error("Error processing files:", error);
      setError(error.message || "Failed to process the selected files. Please try again.");
    } finally {
      setIsLoading(false);
      // Reset the file input so the same file can be selected again if needed
      e.target.value = null;
    }
  };

  const removeAttachment = (attachmentToRemove) => {
    setNewNotice((prev) => ({
      ...prev,
      attachments: prev.attachments.filter(attachment => {
        if (typeof attachment === 'string') {
          return attachment !== attachmentToRemove;
        } else {
          return attachment.name !== attachmentToRemove.name;
        }
      })
    }));
  };

  const viewAttachment = (attachment) => {
    setCurrentAttachment(attachment);
    setShowAttachmentModal(true);
  };

  const closeAttachmentModal = () => {
    setShowAttachmentModal(false);
    setCurrentAttachment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (editNoticeId) {
        // Update existing notice
        const response = await NoticeMng.updateNotice(editNoticeId, {...newNotice, id: editNoticeId});
        
        if (response && response.error) {
          throw new Error(response.error);
        }
        
        // Update local state after successful API call
        setNotices(prevNotices => 
          prevNotices.map(notice => 
            notice.id === editNoticeId ? {...newNotice, id: editNoticeId} : notice
          )
        );
        setEditNoticeId(null);
      } else {
        // Create new notice
        const newId = Date.now().toString();
        const createdNotice = await NoticeMng.createNotice({...newNotice, id: newId});
        
        if (createdNotice && createdNotice.error) {
          throw new Error(createdNotice.error);
        }
        
        // Update local state with the newly created notice
        setNotices(prevNotices => [...prevNotices, {...newNotice, id: newId}]);
      }
      
      // Reset form
      setNewNotice({
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
        highlightNotice: false
      });
      
      setIsFormVisible(false);
    } catch (err) {
      console.error("Failed to save notice:", err);
      setError("Failed to save notice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (notice) => {
    setNewNotice({
      ...notice,
      tags: notice.tags || [],
      attachments: notice.attachments || [],
      publishToStudents: notice.publishToStudents || notice.publishToFrontend || false,
      publishToExaminers: notice.publishToExaminers || false,
      highlightNotice: notice.highlightNotice || false
    });
    setEditNoticeId(notice.id);
    setIsFormVisible(true);
  };

  const handleDelete = async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await NoticeMng.deleteNotice(id);
      
      if (response && response.error) {
        throw new Error(response.error);
      }
      
      // Update local state after successful API call
      setNotices(prevNotices => prevNotices.filter(notice => notice.id !== id));
      setShowDeleteModal(false);
      setNoticeToDelete(null);
    } catch (err) {
      console.error("Failed to delete notice:", err);
      setError("Failed to delete notice. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (notice) => {
    setNoticeToDelete(notice);
    setShowDeleteModal(true);
  };
  
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setNoticeToDelete(null);
  };

  // Function to get priority badge color
  const getPriorityClasses = (priority) => {
    switch(priority) {
      case 'High':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  // Function to get type badge color
  const getTypeClasses = (type) => {
    switch(type) {
      case 'Academic':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'Technical':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Workshop':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Schedule':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Deadline':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Venue':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      case 'Faculty':
        return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Emergency':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDateForDisplay = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper to determine if attachment is a base64 object or a simple string
  const isAttachmentObject = (attachment) => {
    return typeof attachment === 'object' && attachment !== null && attachment.data;
  };

  // Helper to get attachment name
  const getAttachmentName = (attachment) => {
    return isAttachmentObject(attachment) ? attachment.name : attachment;
  };

  // Helper to get attachment type
  const getAttachmentType = (attachment) => {
    if (isAttachmentObject(attachment)) {
      return attachment.type;
    } else {
      const ext = attachment.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image/' + ext;
      if (ext === 'pdf') return 'application/pdf';
      if (['doc', 'docx'].includes(ext)) return 'application/msword';
      return 'application/octet-stream';
    }
  };

  // Helper to determine if attachment is an image
  const isImageAttachment = (attachment) => {
    const type = getAttachmentType(attachment);
    return type.startsWith('image/');
  };

  return (
    <div className={`min-h-screen transition duration-300 ${darkMode ? 'dark:bg-gray-900 dark:text-white' : 'bg-gray-50 text-gray-900'}`} role="main">

      {/* Admin Header with branding */}
      <div className="bg-gradient-to-r from-indigo-700 to-purple-700 dark:from-indigo-900 dark:to-purple-900 text-white py-3 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="text-lg font-semibold">Exam Scheduling System</div>
            </div>
           
          </div>
        </div>
      </div>

      {/* Main header with title */}
      <header className="bg-white dark:bg-gray-800 shadow-md p-4 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-indigo-600 dark:text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Notice Management</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 shadow-sm"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              ) : (
            filteredNotices.map((notice) => (
              <div 
                key={notice.id} 
                className={`bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${notice.highlightNotice ? 'border-2 border-yellow-400 dark:border-yellow-600' : ''}`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                      {notice.title}
                      {notice.highlightNotice && (
                        <span className="ml-2 text-yellow-500 dark:text-yellow-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </span>
                      )}

      {/* Attachment View Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full mx-4 overflow-hidden transform transition-all animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                {getAttachmentName(currentAttachment)}
              </h3>
              <button
                onClick={closeAttachmentModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
                {/* Display image if attachment is an image with base64 data */}
                {isAttachmentObject(currentAttachment) && isImageAttachment(currentAttachment) ? (
                  <div className="text-center">
                    <img 
                      src={currentAttachment.data} 
                      alt={currentAttachment.name}
                      className="max-w-full max-h-96 mb-4 rounded-lg shadow-md"
                    />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">{currentAttachment.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {Math.round(currentAttachment.size / 1024)} KB • {currentAttachment.type.split('/')[1].toUpperCase()} Image
                    </p>
                    <a 
                      href={currentAttachment.data} 
                      download={currentAttachment.name}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                    >
                      Download Image
                    </a>
                  </div>
                ) : getAttachmentType(currentAttachment).includes('pdf') ? (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 4.5V9a1 1 0 001 1h4.5" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{getAttachmentName(currentAttachment)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {isAttachmentObject(currentAttachment) ? `${Math.round(currentAttachment.size / 1024)} KB • ` : ''}
                      PDF Document
                    </p>
                    {isAttachmentObject(currentAttachment) && (
                      <a 
                        href={currentAttachment.data} 
                        download={currentAttachment.name}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                      >
                        Download PDF
                      </a>
                    )}
                  </div>
                ) : getAttachmentType(currentAttachment).includes('word') || getAttachmentName(currentAttachment).match(/\.(doc|docx)$/i) ? (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 4.5V9a1 1 0 001 1h4.5" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{getAttachmentName(currentAttachment)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {isAttachmentObject(currentAttachment) ? `${Math.round(currentAttachment.size / 1024)} KB • ` : ''}
                      Word Document
                    </p>
                    {isAttachmentObject(currentAttachment) && (
                      <a 
                        href={currentAttachment.data} 
                        download={currentAttachment.name}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                      >
                        Download Document
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 4.5V9a1 1 0 001 1h4.5" />
                    </svg>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{getAttachmentName(currentAttachment)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {isAttachmentObject(currentAttachment) ? `${Math.round(currentAttachment.size / 1024)} KB • ` : ''}
                      File
                    </p>
                    {isAttachmentObject(currentAttachment) && (
                      <a 
                        href={currentAttachment.data} 
                        download={currentAttachment.name}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors inline-block"
                      >
                        Download File
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end">
              <button
                onClick={closeAttachmentModal}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityClasses(notice.priority)}`}>
                      {notice.priority}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-3 gap-2">
                    <span className="font-medium flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {notice.author}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeClasses(notice.type)}`}>
                      {notice.type}
                    </span>
                    {(notice.publishToStudents || notice.publishToExaminers || notice.publishToFrontend) && (
                      <div className="flex space-x-1">
                        {(notice.publishToStudents || notice.publishToFrontend) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Students
                          </span>
                        )}
                        {notice.publishToExaminers && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            Examiners
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">{notice.body}</p>
                  
                  {/* Attachments */}
                  {notice.attachments && notice.attachments.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attachments:</h4>
                      <div className="flex flex-wrap gap-2">
                        {notice.attachments.map((attachment, index) => (
                          <div 
                            key={index} 
                            className="group flex items-center bg-gray-100 dark:bg-gray-700 rounded-md px-3 py-1.5 text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                            onClick={() => viewAttachment(attachment)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>{isAttachmentObject(attachment) ? attachment.name : attachment}</span>
                            <span className="ml-1 text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">View</span>
                          </div>
                        ))
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-md p-4 mt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; 2025 Exam Scheduling System - Admin Portal</p>
        </div>
      </footer>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden transform transition-all animate-fadeIn">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Deletion</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Are you sure you want to delete the notice <span className="font-medium">"{noticeToDelete?.title}"</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(noticeToDelete.id)}
                  disabled={isLoading}
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}}
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {notice.tags && notice.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {notice.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-2">
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Effective: {formatDateForDisplay(notice.effectiveDate)}
                      </span>
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Expires: {formatDateForDisplay(notice.expirationDate)}
                      </span>
                    </div>
                    <div className="ml-4">
                      {isExpired(notice.expirationDate) ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          Expired
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex justify-end space-x-3">
                  <button 
                    onClick={() => handleEdit(notice)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors flex items-center shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button 
                    onClick={() => confirmDelete(notice)}
                    className="px-3 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors flex items-center shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                                )}
                </div>
                
                {/* Publishing Options */}
                <div className="form-group md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Publishing Options</h3>
                    </div>
                    <div className="mt-3 space-y-3">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => togglePublishTo('publishToStudents')}
                          className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${
                            newNotice.publishToStudents
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {newNotice.publishToStudents ? (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Published to Students
                            </span>
                          ) : (
                            "Publish to Students"
                          )}
                        </button>
                      </div>
                      
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => togglePublishTo('publishToExaminers')}
                          className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 ${
                            newNotice.publishToExaminers
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {newNotice.publishToExaminers ? (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Published to Examiners
                            </span>
                          ) : (
                            "Publish to Examiners"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Display Options</h3>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="highlightNotice"
                          name="highlightNotice"
                          checked={newNotice.highlightNotice}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded"
                        />
                        <label htmlFor="highlightNotice" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Highlight as Important Notice
                        </label>
                      </div>
                      {newNotice.highlightNotice && (
                        <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          Highlighted notices appear with special styling and priority in lists
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button 
                  type="button" 
                  onClick={() => setIsFormVisible(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all transform hover:scale-105 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    editNoticeId ? "Update Notice" : "Create Notice"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notice Cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredNotices.length === 0 && !isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <div className="flex flex-col items-center justify-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-gray-500 dark:text-gray-400 mb-4 text-lg">No notices found</p>
                <button 
                  onClick={() => {
                    setEditNoticeId(null);
                    setIsFormVisible(true);
                  }}
                  className="mt-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-md shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Your First Notice
                </button>
              </div>
            </div>
          ) : (
            </button>
            <button 
              onClick={() => {
                setEditNoticeId(null);
                setNewNotice({
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
                  highlightNotice: false
                });
                setIsFormVisible(!isFormVisible);
              }}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-md shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {isFormVisible ? "Hide Form" : "Create Notice"}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Error message display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
              </svg>
            </button>
          </div>
        )}
      
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        )}
      
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center border-l-4 border-indigo-500 transform transition-transform hover:scale-105">
            <div className="rounded-full bg-indigo-100 dark:bg-indigo-900 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Notices</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{noticeStats.total}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center border-l-4 border-green-500 transform transition-transform hover:scale-105">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Active Notices</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{noticeStats.active}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center border-l-4 border-red-500 transform transition-transform hover:scale-105">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Expired Notices</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{noticeStats.expired}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center border-l-4 border-purple-500 transform transition-transform hover:scale-105">
            <div className="rounded-full bg-purple-100 dark:bg-purple-900 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Published Notices</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {notices.filter(notice => notice.publishToStudents || notice.publishToExaminers).length}
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters Row */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6" role="region" aria-labelledby="notice-management">

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title, content, author or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 shadow-sm transition-colors"
                />
              </div>
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 shadow-sm transition-colors"
              >
                <option value="all">All Types</option>
                <option value="Academic">Academic</option>
                <option value="Schedule">Schedule</option>
                <option value="Deadline">Deadline</option>
                <option value="Venue">Venue</option>
                <option value="Technical">Technical</option>
                <option value="Faculty">Faculty</option>
                <option value="Administrative">Administrative</option>
                <option value="Resource">Resource</option>
                <option value="Workshop">Workshop</option>
                <option value="Requirements">Requirements</option>
                <option value="Evaluation">Evaluation</option>
                <option value="Equipment">Equipment</option>
                <option value="Remote">Remote Access</option>
                <option value="General">General</option>
              </select>
            </div>