import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

export default function AddExaminer() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    id: "",
    email: "",
    fname: "",
    lname: "",
    position: "",
    phone: "",
    department: "",
    courses: [],
    modules: [],
    availability: "true",
    salary: "0",
  });

  const [newCourse, setNewCourse] = useState("");
  const [newModule, setNewModule] = useState("");
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    let newErrors = {};
    ["id", "email", "fname", "lname", "position", "phone"].forEach((field) => {
      if (!formData[field].trim()) newErrors[field] = "This field is required";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    let newErrors = {};
    if (!formData.department.trim()) newErrors.department = "Department is required";
    if (formData.courses.length === 0) newErrors.courses = "At least one course is required";
    if (formData.modules.length === 0) newErrors.modules = "At least one module is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const addCourse = () => {
    if (newCourse.trim()) {
      setFormData({ ...formData, courses: [...formData.courses, newCourse.trim()] });
      setNewCourse("");
    }
  };

  const addModule = () => {
    if (newModule.trim()) {
      setFormData({ ...formData, modules: [...formData.modules, newModule.trim()] });
      setNewModule("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    const payload = {
      ...formData,
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
      navigate("/viewexaminers");
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
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                {["id", "email", "fname", "lname", "position", "phone"].map((name) => (
                  <div key={name} className="relative">
                    <input
                      type={name === "email" ? "email" : "text"}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      placeholder={name.replace(/\b\w/g, (char) => char.toUpperCase())}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
                      required
                    />
                    {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => validateStep1() && setStep(2)}
                  className="w-full bg-blue-600 text-white p-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300"
                >
                  Next
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="relative">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Department"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
                    required
                  />
                  {errors.department && <p className="text-red-500 text-sm">{errors.department}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    placeholder="Add Course"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                  <button type="button" onClick={addCourse} className="bg-green-500 text-white p-2 rounded ml-2">Add</button>
                  <ul>{formData.courses.map((course, index) => <li key={index}>{course}</li>)}</ul>
                  {errors.courses && <p className="text-red-500 text-sm">{errors.courses}</p>}
                </div>

                <div>
                  <input
                    type="text"
                    value={newModule}
                    onChange={(e) => setNewModule(e.target.value)}
                    placeholder="Add Module"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                  <button type="button" onClick={addModule} className="bg-green-500 text-white p-2 rounded ml-2">Add</button>
                  <ul>{formData.modules.map((module, index) => <li key={index}>{module}</li>)}</ul>
                  {errors.modules && <p className="text-red-500 text-sm">{errors.modules}</p>}
                </div>

                <div className="flex justify-between">
                  <button type="button" onClick={() => setStep(1)} className="bg-gray-500 text-white p-3 rounded-lg">Back</button>
                  <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg">Submit</button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
