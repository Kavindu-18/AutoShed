import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Save, UserCog } from "lucide-react";
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
    availability: "true",
    courses: [],
    modules: [],
    salary: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExaminer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleArrayChange = (e, field) => {
    const value = e.target.value;
    setExaminer((prev) => ({
      ...prev,
      [field]: value.split(",").map((item) => item.trim()),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    fetch(`http://localhost:5001/api/examiners/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(examiner),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to update examiner");
        return response.json();
      })
      .then(() => navigate("/viewexaminers"))
      .catch((error) => {
        console.error("Error updating examiner:", error);
        setError("Failed to update examiner.");
      });
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
      <Sidebar />
      <div className="flex-1 px-8 py-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
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

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="fname"
                    value={examiner.fname}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lname"
                    value={examiner.lname}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Contact Details
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={examiner.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={examiner.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Professional Details
              </h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={examiner.position}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={examiner.department}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Availability
                  </label>
                  <select
                    name="availability"
                    value={examiner.availability}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="true">Available</option>
                    <option value="false">Not Available</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Salary
                  </label>
                  <input
                    type="number"
                    name="salary"
                    value={examiner.salary}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Academic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Courses (comma separated)
                  </label>
                  <input
                    type="text"
                    value={examiner.courses.join(", ")}
                    onChange={(e) => handleArrayChange(e, "courses")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Modules (comma separated)
                  </label>
                  <input
                    type="text"
                    value={examiner.modules.join(", ")}
                    onChange={(e) => handleArrayChange(e, "modules")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                className="inline-flex items-center rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}