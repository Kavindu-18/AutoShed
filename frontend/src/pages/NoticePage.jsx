import React, { useState, useEffect } from "react";

function SimplifiedNoticePage() {
  // Core state variables
  const [notices, setNotices] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState(null);

  // Simplified notice structure
  const [newNotice, setNewNotice] = useState({
    id: Date.now().toString(),
    title: "",
    type: "HR",
    priority: "Medium",
    body: "",
    author: "",
    effectiveDate: formatDate(new Date()),
    expirationDate: formatDate(addDays(new Date(), 30)),
    tags: [],
    createdAt: new Date().toISOString(),
  });

  // Helper functions
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

  // Fetch notices on component mount
  useEffect(() => {
    fetchNotices();
  }, []);

  // Filter notices based on search term
  useEffect(() => {
    let results = [...notices];
    if (searchTerm) {
      results = results.filter(
        notice =>
          notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notice.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredNotices(results);
  }, [notices, searchTerm]);

  // Fetch notices (now empty)
  const fetchNotices = () => {
    // Empty array instead of dummy data
    setNotices([]);
    setFilteredNotices([]);
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewNotice((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTagsChange = (e) => {
    const { value } = e.target;
    setNewNotice((prev) => ({
      ...prev,
      tags: value.split(",").map(tag => tag.trim()),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editNoticeId) {
      // Update existing notice
      setNotices(notices.map(notice => 
        notice.id === editNoticeId ? {...newNotice, id: editNoticeId} : notice
      ));
      setEditNoticeId(null);
    } else {
      // Create new notice
      setNotices([...notices, {...newNotice, id: Date.now().toString()}]);
    }
    
    // Reset form
    setNewNotice({
      id: Date.now().toString(),
      title: "",
      type: "HR",
      priority: "Medium",
      body: "",
      author: "",
      effectiveDate: formatDate(new Date()),
      expirationDate: formatDate(addDays(new Date(), 30)),
      tags: [],
      createdAt: new Date().toISOString(),
    });
    
    setIsFormVisible(false);
  };

  const handleEdit = (notice) => {
    setNewNotice({
      ...notice,
      tags: notice.tags || []
    });
    setEditNoticeId(notice.id);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    setNotices(notices.filter(notice => notice.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto py-4 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Notice Management</h1>
            <button
              onClick={() => {
                setEditNoticeId(null);
                setIsFormVisible(!isFormVisible);
              }}
              className="bg-white text-blue-600 px-4 py-2 rounded font-semibold"
            >
              {isFormVisible ? "Hide Form" : "Create Notice"}
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search notices..."
            className="w-full p-2 border border-gray-300 rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Notice form */}
        {isFormVisible && (
          <div className="bg-white p-4 rounded shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editNoticeId ? "Edit Notice" : "Create New Notice"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newNotice.title}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Author</label>
                  <input
                    type="text"
                    name="author"
                    value={newNotice.author}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Type</label>
                  <select
                    name="type"
                    value={newNotice.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Event">Event</option>
                    <option value="Policy">Policy</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Priority</label>
                  <select
                    name="priority"
                    value={newNotice.priority}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Effective Date</label>
                  <input
                    type="date"
                    name="effectiveDate"
                    value={newNotice.effectiveDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Expiration Date</label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={newNotice.expirationDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={newNotice.tags.join(", ")}
                    onChange={handleTagsChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Body</label>
                  <textarea
                    name="body"
                    value={newNotice.body}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded h-32"
                    required
                  ></textarea>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFormVisible(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {editNoticeId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notice list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`bg-white rounded shadow-md overflow-hidden border-l-4 ${
                notice.priority === "High" 
                  ? "border-red-500" 
                  : notice.priority === "Medium" 
                    ? "border-yellow-500" 
                    : "border-green-500"
              }`}
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{notice.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    notice.priority === "High" 
                      ? "bg-red-100 text-red-800" 
                      : notice.priority === "Medium" 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-green-100 text-green-800"
                  }`}>
                    {notice.priority}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {notice.author} • {notice.type}
                </div>
                <p className="text-gray-800 mb-3">{notice.body}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {notice.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Effective: {notice.effectiveDate} • Expires: {notice.expirationDate}
                </div>
                <div className={`text-sm font-medium ${
                  isExpired(notice.expirationDate) ? "text-red-600" : "text-green-600"
                }`}>
                  {isExpired(notice.expirationDate) ? "Expired" : "Active"}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-2 flex justify-end space-x-2 border-t">
                <button
                  onClick={() => handleEdit(notice)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(notice.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SimplifiedNoticePage;