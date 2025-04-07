import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { addStudent, updateStudent } from "../api/studentApi";

const facultyOptions = {
  "": [],
  Computing: [
    "Software Engineering",
    "Information Technology",
    "Computer Science",
    "Data Science",
    "Cyber Security",
  ],
  Engineering: [
    "Electrical & Electronic",
    "Civil",
    "Mechanical",
    "Material",
  ],
  Business: [
    "Marketing Management",
    "Business Management",
    "Business Administration",
  ],
};

const StudentForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [student, setStudent] = useState({
    studentId: "",
    name: "",
    age: "",
    address: "",
    email: "",
    contactNo: "",
    faculty: "",
    specialization: "",
    year: "",
  });

  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (location.state?.student) {
      setStudent(location.state.student);
      setIsEditMode(true);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleFacultyChange = (e) => {
    const selectedFaculty = e.target.value;
    setStudent({
      ...student,
      faculty: selectedFaculty,
      specialization: "",
    });
  };

  // Restrict Student ID input to exactly 10 characters
  const handleStudentIdInput = (e) => {
    if (e.target.value.length > 10) {
      e.target.value = e.target.value.slice(0, 10); // Truncate to 10 characters
    }
    handleChange(e);
  };

  // Restrict Contact No input to only digits and exactly 10 digits
  const handleContactNoInput = (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value.length > 10) {
      value = value.slice(0, 10); // Truncate to 10 digits
    }
    e.target.value = value; // Update the input value
    handleChange(e); // Update the state
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Student ID validation
    if (!student.studentId) {
      newErrors.studentId = "Student ID is required.";
    } else if (student.studentId.length !== 10) {
      newErrors.studentId = "Student ID must be exactly 10 characters.";
    }

    // Name validation
    if (!student.name) {
      newErrors.name = "Name is required.";
    }

    // Age validation
    if (!student.age) {
      newErrors.age = "Age is required.";
    } else if (isNaN(student.age) || student.age < 1) {
      newErrors.age = "Age must be a valid number.";
    }

    // Address validation
    if (!student.address) {
      newErrors.address = "Address is required.";
    }

    // Email validation
    if (!student.email) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
      newErrors.email = "Invalid email format.";
    }

    // Contact No validation
    if (!student.contactNo) {
      newErrors.contactNo = "Contact No is required.";
    } else if (!/^\d{10}$/.test(student.contactNo)) {
      newErrors.contactNo = "Contact No must be exactly 10 digits.";
    }

    // Faculty validation
    if (!student.faculty) {
      newErrors.faculty = "Faculty is required.";
    }

    // Specialization validation
    if (!student.specialization) {
      newErrors.specialization = "Specialization is required.";
    }

    // Year validation
    if (!student.year) {
      newErrors.year = "Year is required.";
    } else if (isNaN(student.year) || student.year < 1) {
      newErrors.year = "Year must be a valid number.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    if (isEditMode) {
      await updateStudent(student._id, student);
    } else {
      await addStudent(student);
    }

    setStudent({
      studentId: "",
      name: "",
      age: "",
      address: "",
      email: "",
      contactNo: "",
      faculty: "",
      specialization: "",
      year: "",
    });

    navigate("/students");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-200 via-purple-150 to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          {isEditMode ? "Edit Student" : "Add Student"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                name="studentId"
                value={student.studentId}
                onChange={handleStudentIdInput} // Use custom handler
                onInput={handleStudentIdInput} // Restrict input to 10 characters
                placeholder="Enter Student ID"
                id="studentId"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={student.name}
                onChange={handleChange}
                placeholder="Enter Name"
                id="name"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                Age
              </label>
              <input
                type="number"
                name="age"
                value={student.age}
                onChange={handleChange}
                placeholder="Enter Age"
                id="age"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={student.address}
                onChange={handleChange}
                placeholder="Enter Address"
                id="address"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>
            <div>
              <label htmlFor="faculty" className="block text-sm font-medium text-gray-700 mb-1">
                Faculty
              </label>
              <select
                name="faculty"
                value={student.faculty}
                onChange={handleFacultyChange}
                id="faculty"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Faculty</option>
                {Object.keys(facultyOptions).filter(f => f !== "").map((faculty) => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
              {errors.faculty && <p className="text-red-500 text-sm mt-1">{errors.faculty}</p>}
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                name="specialization"
                value={student.specialization}
                onChange={handleChange}
                id="specialization"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!student.faculty}
              >
                <option value="">Select Specialization</option>
                {facultyOptions[student.faculty]?.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {errors.specialization && <p className="text-red-500 text-sm mt-1">{errors.specialization}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={student.email}
                onChange={handleChange}
                placeholder="Enter Email"
                id="email"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">
                Contact No
              </label>
              <input
                type="text"
                name="contactNo"
                value={student.contactNo}
                onChange={handleContactNoInput} // Use custom handler
                onInput={handleContactNoInput} // Restrict input to digits only
                placeholder="Enter Contact No"
                id="contactNo"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.contactNo && <p className="text-red-500 text-sm mt-1">{errors.contactNo}</p>}
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={student.year}
                onChange={handleChange}
                placeholder="Enter Year"
                id="year"
                className="w-full p-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-semibold"
            >
              {isEditMode ? "Update Student" : "Add Student"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition duration-200 font-semibold"
            >
              View Students
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentForm;