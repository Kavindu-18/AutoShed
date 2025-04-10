import axios from "axios";

const API_URL = "http://localhost:5001/api/students";

// Fetch all students
export const getStudents = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Add a new student
export const addStudent = async (student) => {
  const response = await axios.post(API_URL, student);
  return response.data;
};

// Delete a student
export const deleteStudent = async (id) => {
  await axios.delete(`${API_URL}/${id}`);
};

// Update a student
export const updateStudent = async (id, student) => {
    const response = await axios.put(`${API_URL}/${id}`, student);
    return response.data;
};
  
