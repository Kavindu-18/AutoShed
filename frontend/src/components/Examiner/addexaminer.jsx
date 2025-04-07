import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { Mail, Phone, Building2, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import Sidebar from "../Sidebar";
import Select from "react-select";
import logo from "../../../public/Img/Examinerlogo.png"; // Import the logo

export default function AddExaminer() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    fname: "",
    lname: "",
    position: "",
    phone: "",
    department: "",
    courses: [],
    modules: [],
  });

  const examinerPositions = [
    "Internal Examiner", "External Examiner", "Chief Examiner",
    "Practical Examiner", "Dissertation Examiner",
    "Continuous Assessment Examiner", "Online Examiner",
  ];

  const departments = [
    "Department of Computer Science", "Department of Information Systems",
    "Department of Cybersecurity", "Department of Artificial Intelligence",
    "Department of Data Science", "Department of Business Administration",
    "Department of Civil Engineering", "Department of Mechanical Engineering",
    "Department of Electrical Engineering", "Department of Computer Engineering",
  ];

  const courseModules = {
    "BSc in Computer Science": [
      "CS101 Algorithms",
      "CS102 Operating Systems",
      "CS103 Software Engineering",
    ],
    "BSc in Software Engineering": [
      "SE101 Data Structures",
      "SE102 Database Management",
      "SE103 Software Testing",
    ],
    "BSc in Artificial Intelligence": [
      "AI101 Machine Learning",
      "AI102 Neural Networks",
      "AI103 Natural Language Processing",
    ],
  };

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateStep = (step) => {
    let newErrors = {};

    if (step === 1) {
      ["email", "fname", "lname"].forEach((field) => {
        if (!formData[field].trim()) newErrors[field] = "All fields are required";
      });
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    } else if (step === 2) {
      ["position", "phone", "department"].forEach((field) => {
        if (!formData[field].trim()) newErrors[field] = "All fields are required";
      });

      const phone = formData.phone.trim(); // Ensure trimming
      if (phone && !/^\d{10}$/.test(phone)) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
    } else if (step === 3) {
      if (!formData.courses || formData.courses.length === 0) 
        newErrors.courses = "Select at least one course";
      
      if (!formData.modules || formData.modules.length === 0) 
        newErrors.modules = "Select at least one module";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

  const ExaminerStatus = ({ examiner, handleAvailabilityChange }) => {
  return (
    <div className="flex items-center space-x-3">
      <label className="text-sm font-medium text-gray-700">Status</label>
      <button
        onClick={handleAvailabilityChange}
        className="flex items-center space-x-2 px-3 py-1.5 border rounded-lg shadow-sm transition hover:bg-gray-100"
      >
        {examiner.availability ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
        <span className="text-sm font-medium text-gray-700">
          {examiner.availability ? "Available" : "Unavailable"}
        </span>
      </button>
    </div>
  );
};

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleCourseChange = (selectedCourses) => {
    const courses = selectedCourses.map(option => option.value);
    setFormData({
      ...formData,
      courses,
      modules: [],
    });
  };

  const handleModuleChange = (selectedModules) => {
    setFormData({
      ...formData,
      modules: selectedModules.map(module => module.value),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5001/api/examiners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Examiner added successfully!', {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: '#10B981',
            color: '#FFFFFF',
            padding: '16px',
          },
        });
        setTimeout(() => {
          navigate("/viewexaminers");
        }, 2000);
      } else {
        toast.error('Failed to add examiner', {
          position: 'bottom-right',
        });
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`, {
        position: 'bottom-right',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Personal Information</h3>
            {["email", "fname", "lname"].map((field) => (
              <div key={field} className="relative">
                <div className="flex items-center">
                  {field === "email" && <Mail className="w-5 h-5 text-gray-400 absolute left-3" />}
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    placeholder={field === "fname" ? "First Name" : 
                               field === "lname" ? "Last Name" : 
                               "Email"}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                      errors[field] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors[field] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field]}</p>
                )}
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Professional Details</h3>
            <div className="relative">
              <div className="flex items-center">
                <GraduationCap className="w-5 h-5 text-gray-400 absolute left-3" />
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Position</option>
                  {examinerPositions.map((position) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
              {errors.position && (
                <p className="text-red-500 text-sm mt-1">{errors.position}</p>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-gray-400 absolute left-3" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div className="relative">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400 absolute left-3" />
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${
                    errors.department ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <p className="text-red-500 text-sm mt-1">{errors.department}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">Course Assignment</h3>
            <div className="relative">
              <div className="flex items-center mb-2">
                <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-600">Select Courses</span>
              </div>
              <Select
                isMulti
                name="courses"
                options={Object.keys(courseModules).map((course) => ({
                  label: course,
                  value: course,
                }))}
                value={formData.courses.map((course) => ({
                  label: course,
                  value: course,
                }))}
                onChange={handleCourseChange}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Select courses..."
              />
              {errors.courses && (
                <p className="text-red-500 text-sm mt-1">{errors.courses}</p>
              )}
            </div>

            {formData.courses.length > 0 && (
              <div className="relative">
                <div className="flex items-center mb-2">
                  <BookOpen className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Select Modules</span>
                </div>
                <Select
                  isMulti
                  name="modules"
                  options={formData.courses.flatMap((course) =>
                    courseModules[course]?.map((module) => ({
                      label: module,
                      value: module,
                    }))
                  )}
                  value={formData.modules.map((module) => ({
                    label: module,
                    value: module,
                  }))}
                  onChange={handleModuleChange}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select modules..."
                />
                {errors.modules && (
                  <p className="text-red-500 text-sm mt-1">{errors.modules}</p>
                )}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
              Add New Examiner
            </h2>

            {/* Logo Display */}
            <div className="text-center mb-8">
              <img src={logo} alt="Examiner Logo" className="w-32 h-auto mx-auto" />
            </div>

            {/* Progress Steps */}
            <div className="flex justify-between items-center mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep === step
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && <ChevronRight className="w-5 h-5 text-gray-600" />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            {renderStepContent()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-gray-300 text-black rounded-lg transition-all duration-300 hover:bg-gray-400"
                >
                  Previous
                </button>
              )}
              <div>
                {currentStep < 3 && (
                  <button
                    onClick={handleNext}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-all duration-300 hover:bg-blue-600"
                  >
                    Next
                  </button>
                )}
                {currentStep === 3 && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg transition-all duration-300 hover:bg-green-600"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
