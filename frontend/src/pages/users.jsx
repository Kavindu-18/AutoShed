import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";

export default function Users() {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5001/api/users")
            .then((response) => response.json())
            .then((data) => setUsers(data))
            .catch((error) => console.error("Error fetching users:", error));
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Users</h1>
                    <button
                        onClick={() => navigate("/add-user")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        + Add User
                    </button>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl shadow-md">
                    <table className="min-w-full text-sm text-left text-gray-700">
                        <thead className="text-xs uppercase bg-gray-100 text-gray-600">
                            <tr>
                                <th className="px-6 py-4">#</th>
                                <th className="px-6 py-4">Firstname</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">User ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length > 0 ? (
                                users.map((user, index) => (
                                    <tr
                                        key={user._id || user.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4">{user.firstname}</td>
                                        <td className="px-6 py-4">{user.email}</td>
                                        <td className="px-6 py-4 capitalize">{user.role}</td>
                                        <td className="px-6 py-4 text-blue-600 font-semibold">AS{index + 1}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                        Loading users or no users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
