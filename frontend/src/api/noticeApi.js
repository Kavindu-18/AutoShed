import axios from "axios";

const API_URL = "http://localhost:5001/api/notices"; // Backend URL for notices

// Create a new notice (POST)
export const createNotice = async (noticeData) => {
  try {
    const response = await axios.post(API_URL, noticeData);
    return response.data; // { message: "Notice created successfully" }
  } catch (error) {
    console.error("Error creating notice:", error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};

// Get all notices (GET)
export const getNotices = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data; // Array of notices
  } catch (error) {
    console.error("Error fetching notices:", error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};

// Get a single notice by ID (GET)
export const getNoticeById = async (noticeId) => {
  try {
    const response = await axios.get(`${API_URL}/${noticeId}`);
    return response.data; // Single notice object
  } catch (error) {
    console.error("Error fetching notice:", error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};

// Update a notice (PUT)
export const updateNotice = async (noticeId, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${noticeId}`, updatedData);
    return response.data; // { message: "Notice updated successfully" }
  } catch (error) {
    console.error("Error updating notice:", error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};

// Delete a notice (DELETE)
export const deleteNotice = async (noticeId) => {
  try {
    const response = await axios.delete(`${API_URL}/${noticeId}`);
    return response.data; // { message: "Notice deleted successfully" }
  } catch (error) {
    console.error("Error deleting notice:", error.response?.data || error.message);
    return { error: error.response?.data || error.message };
  }
};