import React, { useState, useEffect } from "react";
import { NoticeMng } from "../api/noticeApi";

function EnhancedNoticePage() {
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

  // Core state for notices and form management
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
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
    highlightNotice: false,
  });

  // State for form and modal management
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState(null);

  // State for search and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [sortBy, setSortBy] = useState("effectiveDate");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch notices from API on component mount
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await NoticeMng.getNotices();
        setNotices(response);
      } catch (err) {
        console.error("Failed to fetch notices:", err);
      }
    };

    fetchNotices();
  }, []);

  // Apply filters, search, and sorting
  useEffect(() => {
    let results = [...notices];

    // Apply type filter
    if (filterType !== "all") {
      results = results.filter((notice) => notice.type === filterType);
    }

    // Apply priority filter
    if (filterPriority !== "all") {
      results = results.filter((notice) => notice.priority === filterPriority);
    }

    // Apply search
    if (searchTerm) {
      results = results.filter(
        (notice) =>
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (notice.tags &&
            notice.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
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
          const priorityOrder = { High: 1, Medium: 2, Low: 3 };
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

      return sortOrder === "asc" ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    setFilteredNotices(results);
  }, [notices, searchTerm, sortBy, sortOrder, filterType, filterPriority]);

  // Handle input changes for new/edit notice
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewNotice((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Toggle publishing options
  const togglePublishTo = (target) => {
    setNewNotice((prev) => ({
      ...prev,
      [target]: !prev[target],
    }));
  };

  // Submit notice (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editNoticeId) {
        await NoticeMng.updateNotice(editNoticeId, { ...newNotice, id: editNoticeId });

        setNotices((prevNotices) =>
          prevNotices.map((notice) =>
            notice.id === editNoticeId ? { ...newNotice, id: editNoticeId } : notice
          )
        );
        setEditNoticeId(null);
      } else {
        const newId = Date.now().toString();
        await NoticeMng.createNotice({ ...newNotice, id: newId });

        setNotices((prevNotices) => [...prevNotices, { ...newNotice, id: newId }]);
      }

      setIsFormVisible(false);
    } catch (err) {
      console.error("Failed to save notice:", err);
    }
  };

  // Edit a notice
  const handleEdit = (notice) => {
    setNewNotice({
      ...notice,
      tags: notice.tags || [],
      attachments: notice.attachments || [],
      publishToStudents: notice.publishToStudents || false,
      publishToExaminers: notice.publishToExaminers || false,
      highlightNotice: notice.highlightNotice || false,
    });
    setEditNoticeId(notice.id);
    setIsFormVisible(true);
  };

  // Delete a notice
  const handleDelete = async (id) => {
    try {
      await NoticeMng.deleteNotice(id);
      setNotices((prevNotices) => prevNotices.filter((notice) => notice.id !== id));
      setShowDeleteModal(false);
      setNoticeToDelete(null);
    } catch (err) {
      console.error("Failed to delete notice:", err);
    }
  };

  // Confirm delete modal trigger
  const confirmDelete = (notice) => {
    setNoticeToDelete(notice);
    setShowDeleteModal(true);
  };

  return (
    <div>
      <h1>Enhanced Notice Management</h1>
      <button onClick={() => setIsFormVisible(true)}>Add Notice</button>
      <ul>
        {filteredNotices.map((notice) => (
          <li key={notice.id}>
            {notice.title} - {notice.priority}
            <button onClick={() => handleEdit(notice)}>Edit</button>
            <button onClick={() => confirmDelete(notice)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EnhancedNoticePage;
