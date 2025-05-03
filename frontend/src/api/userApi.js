import axios from "axios";

const API_URL = "http://localhost:5001/api/users"; // Backend URL

// Register User API
// Register a new user (POST)
export const registerUser = async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, userData);
      return response.data;
    } catch (error) {
      console.error("Error registering user:", error.response?.data || error.message);
      return { error: error.response?.data || error.message };
    }
  };
  
  // Get all users (GET)
  export const getUsers = async () => {
    try {
      const response = await axios.get(API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error.response?.data || error.message);
      return { error: error.response?.data || error.message };
    }
  };
  
  // Delete a user (DELETE)
  export const deleteUser = async (userId) => {
    try {
      const response = await axios.delete(`${API_URL}/${userId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error.response?.data || error.message);
      return { error: error.response?.data || error.message };
    }
  };
