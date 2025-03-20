import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar";

export default function UpdateExaminer() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State for examiner data and loading state
  const [examiner, setExaminer] = useState({
    fname: "",
    lname: "",
    email: "",
    position: "",
    phone: "",
    department: "",
    availability: "true",
    courses: [],
    modules: [],
    salary: 0,
  });

  const [loading, setLoading] = useState(true); // Loading state for fetching data
  const [error, setError] = useState(""); // Error state for any fetch or validation errors

  // Fetch examiner data when component mounts
  useEffect(() => {
    fetch(`http://localhost:5001/api/examiners/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch examiner data");
        }
        return response.json();
      })
      .then((data) => {
        setExaminer(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching examiner:", error);
        setError("Failed to load examiner data.");
        setLoading(false);
      });
  }, [id]);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setExaminer((prevExaminer) => ({
      ...prevExaminer,
      [name]: value,
    }));
  };

  // Handle changes for courses and modules (array fields)
  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    setExaminer((prevExaminer) => ({
      ...prevExaminer,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    setError(""); // Clear any previous errors

    fetch(`http://localhost:5001/api/examiners/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(examiner),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update examiner");
        }
        return response.json();
      })
      .then(() => {
        navigate("/viewexaminers"); // Redirect after successful update
      })
      .catch((error) => {
        console.error("Error updating examiner:", error);
        setError("Failed to update examiner.");
      });
  };

  if (loading) {
    return <div>Loading...</div>; // Display loading message while fetching data
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col">
      <div className="flex-1 flex">
        <Sidebar />
        <div className="p-6 w-full">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Update Examiner
          </h1>
          {error && <div className="text-red-500 mb-4">{error}</div>} {/* Display error if any */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            {/* ID Field - Display only, cannot be edited */}
            <div className="mb-4">
              <label htmlFor="id" className="block text-gray-700 text-sm font-bold mb-2">Examiner ID</label>
              <input
                type="text"
                id="id"
                name="id"
                value={id} // Display the ID
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-200 cursor-not-allowed"
                readOnly // Make it read-only so it cannot be edited
              />
            </div>

            <div className="mb-4">
              <label htmlFor="fname" className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
              <input type="text" id="fname" name="fname" value={examiner.fname} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="lname" className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
              <input type="text" id="lname" name="lname" value={examiner.lname} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input type="email" id="email" name="email" value={examiner.email} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">Position</label>
              <input type="text" id="position" name="position" value={examiner.position} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">Phone</label>
              <input type="text" id="phone" name="phone" value={examiner.phone} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="department" className="block text-gray-700 text-sm font-bold mb-2">Department</label>
              <input type="text" id="department" name="department" value={examiner.department} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="availability" className="block text-gray-700 text-sm font-bold mb-2">Availability</label>
              <select id="availability" name="availability" value={examiner.availability} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div className="mb-4">
              <label htmlFor="courses" className="block text-gray-700 text-sm font-bold mb-2">Courses (comma separated)</label>
              <input type="text" id="courses" name="courses" value={examiner.courses.join(", ")} onChange={(e) => handleArrayChange(e, "courses")} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="modules" className="block text-gray-700 text-sm font-bold mb-2">Modules (comma separated)</label>
              <input type="text" id="modules" name="modules" value={examiner.modules.join(", ")} onChange={(e) => handleArrayChange(e, "modules")} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="mb-4">
              <label htmlFor="salary" className="block text-gray-700 text-sm font-bold mb-2">Salary</label>
              <input type="number" id="salary" name="salary" value={examiner.salary} onChange={handleChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
            </div>
            <div className="flex items-center justify-between">
              <button type="submit" className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
