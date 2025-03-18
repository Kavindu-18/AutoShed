import { useState } from "react";
import Sidebar from "../Sidebar";

export default function AddExaminer() {
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    fname: "",
    lname: "",
    position: "",
    phone: "",
    department: "",
    courses: "",
    modules: "",
    availability: "true",
    salary: "0",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      courses: formData.courses.split(",").map((item) => item.trim()),
      modules: formData.modules.split(",").map((item) => item.trim()),
      availability: formData.availability === "true",
      salary: Number(formData.salary),
    };

    const response = await fetch("http://localhost:5001/api/examiners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      alert("Examiner added successfully");
      setFormData({
        id: "",
        email: "",
        fname: "",
        lname: "",
        position: "",
        phone: "",
        department: "",
        courses: "",
        modules: "",
        availability: "true",
        salary: "0",
      });
    } else {
      alert("Error adding examiner");
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <Sidebar />
      <div className="flex flex-col justify-center items-center w-full p-6">
        <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-2xl border border-gray-300">
          <h2 className="text-3xl font-extrabold text-center text-gray-700 mb-6">
            Add Examiner
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4"> {/* Adjusted spacing */}
            {[
              { placeholder: "Examiner ID", name: "id" },
              { placeholder: "Email Address", name: "email", type: "email" },
              { placeholder: "First Name", name: "fname" },
              { placeholder: "Last Name", name: "lname" },
              { placeholder: "Job Position", name: "position" },
              { placeholder: "Phone Number", name: "phone", type: "tel" },
              { placeholder: "Department", name: "department" },
              { placeholder: "Courses (comma separated)", name: "courses" },
              { placeholder: "Modules (comma separated)", name: "modules" },
              { placeholder: "Salary", name: "salary", type: "number" },
            ].map(({ placeholder, name, type = "text" }) => (
              <div key={name} className="relative">
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm placeholder-gray-500" // Adjusted padding
                  required
                />
              </div>
            ))}

            <div className="relative">
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm" // Adjusted padding
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold text-lg hover:bg-blue-700 hover:shadow-lg transform transition duration-300" // Adjusted padding
            >
              Submit Examiner
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}