import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Save, UserCog, CircleDot } from "lucide-react";
import Select from "react-select";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "../Sidebar";

export default function UpdateExaminer() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [examiner, setExaminer] = useState({
    fname: "",
    lname: "",
    email: "",
    position: "",
    phone: "",
    department: "",
    availability: true,
    courses: [],
    modules: [],
    salary: 0,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
      "CS101 Algorithms", "CS102 Operating Systems", "CS103 Software Engineering",
    ],
    "BSc in Software Engineering": [
      "SE101 Data Structures", "SE102 Database Management", "SE103 Software Testing",
    ],
    "BSc in Artificial Intelligence": [
      "AI101 Machine Learning", "AI102 Neural Networks", "AI103 Natural Language Processing",
    ],
  };

  useEffect(() => {
    fetch(`http://localhost:5001/api/examiners/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch examiner data");
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
        toast.error("Failed to load examiner data", {
          position: "bottom-right",
          style: {
            background: "#ef4444",
            color: "#fff",
          },
        });
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExaminer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = () => {
    setExaminer((prev) => ({
      ...prev,
      availability: !prev.availability,
    }));
  };

  const handleCourseChange = (selectedCourses) => {
    const courses = selectedCourses.map((option) => option.value);
    setExaminer((prev) => ({
      ...prev,
      courses,
      modules: [],
    }));
  };

  const handleModuleChange = (selectedModules) => {
    const modules = selectedModules.map((module) => module.value);
    setExaminer((prev) => ({
      ...prev,
      modules,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5001/api/examiners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examiner),
      });

      if (!response.ok) throw new Error("Failed to update examiner");

      toast.success("Examiner updated successfully!", {
        duration: 4000,
        position: "bottom-right",
        style: {
          background: "#22c55e",
          color: "#fff",
          padding: "16px",
          borderRadius: "8px",
        },
        iconTheme: {
          primary: "#fff",
          secondary: "#22c55e",
        },
      });

      setTimeout(() => {
        navigate("/viewexaminers");
      }, 2000);
    } catch (error) {
      console.error("Error updating examiner:", error);
      setError("Failed to update examiner.");
      toast.error("Failed to update examiner", {
        position: "bottom-right",
        style: {
          background: "#ef4444",
          color: "#fff",
        },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-purple-500" />
          <p className="mt-2 text-sm text-gray-500">Loading examiner data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#22c55e",
            color: "#fff",
            padding: "16px",
            borderRadius: "8px",
          },
        }}
      />
      <Sidebar />
      <div className="flex-1 px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <button
              onClick={() => navigate("/viewexaminers")}
              className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Examiners
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="flex items-center text-3xl font-bold text-gray-900">
                  <UserCog className="mr-3 h-8 w-8 text-purple-500" />
                  Update Examiner Profile
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Update the examiner's information and credentials
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Basic Information</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="fname"
                    value={examiner.fname}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="lname"
                    value={examiner.lname}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={examiner.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="flex items-center">
                  <CircleDot 
                    className={`h-5 w-5 mr-2 ${examiner.availability ? 'text-green-500' : 'text-red-500'}`} 
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {examiner.availability ? "Available" : "Unavailable"}
                  </span>
                  <button
                    type="button"
                    onClick={handleAvailabilityChange}
                    className="ml-4 text-sm text-purple-600 hover:text-purple-800"
                  >
                    Toggle Status
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Professional Details</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <select
                    name="position"
                    value={examiner.position}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select Position</option>
                    {examinerPositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <select
                    name="department"
                    value={examiner.department}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Academic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Courses</label>
                  <Select
                    isMulti
                    name="courses"
                    value={examiner.courses.map(course => ({ value: course, label: course }))}
                    onChange={handleCourseChange}
                    options={Object.keys(courseModules).map(course => ({ value: course, label: course }))}
                    className="mt-1"
                    classNamePrefix="select"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modules</label>
                  <Select
                    isMulti
                    name="modules"
                    value={examiner.modules.map(module => ({ value: module, label: module }))}
                    onChange={handleModuleChange}
                    options={examiner.courses.flatMap(course =>
                      courseModules[course] ? courseModules[course].map(module => ({ value: module, label: module })) : []
                    )}
                    className="mt-1"
                    classNamePrefix="select"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate("/viewexaminers")}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${saving ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}