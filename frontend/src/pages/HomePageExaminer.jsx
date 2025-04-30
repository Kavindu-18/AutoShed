import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const HomePageExaminer = () => {
  const [examiner, setExaminer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [editedExaminer, setEditedExaminer] = useState({});
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const email = localStorage.getItem('userEmail');

  useEffect(() => {
    if (email) {
      fetch(`http://localhost:5001/api/examiners/email/${email}`)
        .then(response => response.json())
        .then(data => {
          const enrichedData = {
            ...data,
            presentations: [
              { groupName: 'Group A', date: '2025-05-10', hall: 'Hall 2', time: '10:30 AM' },
              { groupName: 'Group B', date: '2025-05-11', hall: 'Hall 3', time: '2:00 PM' },
            ],
          };
          setExaminer(enrichedData);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [email]);

  const handleLogout = () => {
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedExaminer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = () => {
    const updateData = {
      fname: editedExaminer.fname,
      lname: editedExaminer.lname,
      phone: editedExaminer.phone,
    };

    fetch(`http://localhost:5001/api/examiners/${examiner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(res => res.json())
      .then(() => {
        setExaminer(prev => ({ ...prev, ...updateData }));
        setShowProfile(false);
      })
      .catch(err => console.error('Error updating profile:', err));
  };

  const handleSavePassword = () => {
    if (editedExaminer.currentPassword !== examiner.password) {
      setPasswordError('Current password is incorrect');
      return;
    }

    if (editedExaminer.newPassword !== editedExaminer.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    const updateData = {
      password: editedExaminer.newPassword,
    };

    fetch(`http://localhost:5001/api/examiners/${examiner.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    })
      .then(res => res.json())
      .then(() => {
        setExaminer(prev => ({ ...prev, password: updateData.password }));
        setShowProfile(false);
      })
      .catch(err => console.error('Error updating password:', err));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!examiner) {
    return <div className="flex justify-center items-center h-screen text-red-500">Examiner not found</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-indigo-700">AutoShed</div>
          <nav className="hidden md:flex gap-6 text-gray-700 font-medium">
            <a href="/profile/:id" className="hover:text-indigo-600">Home</a>
            <a href="/about" className="hover:text-indigo-600">About Us</a>
            <a href="/contact" className="hover:text-indigo-600">Contact Us</a>
            <a href="/examiners" className="hover:text-indigo-600">Examiners</a>
            <a href="/help" className="hover:text-indigo-600">Help Center</a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium hidden sm:block">{examiner.email}</span>
              <FaBell className="text-xl text-gray-500 hover:text-indigo-600 cursor-pointer" />
            </div>
            <FaUserCircle
              className="text-3xl text-indigo-700 hover:text-indigo-900 cursor-pointer"
              onClick={() => {
                setEditedExaminer({
                  fname: examiner.fname,
                  lname: examiner.lname,
                  phone: examiner.phone,
                  showPasswordFields: false,
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: ''
                });
                setPasswordError('');
                setShowProfile(true);
              }}
            />
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600 transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-6 text-center">
            Welcome , {examiner.fname} {examiner.lname}
          </h1>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-purple-100 p-4 rounded shadow"><p className="font-semibold">Department:</p><p>{examiner.department}</p></div>
            <div className="bg-orange-100 p-4 rounded shadow"><p className="font-semibold">Position:</p><p>{examiner.position}</p></div>
            <div className="bg-yellow-100 p-4 rounded shadow"><p className="font-semibold">Phone:</p><p>{examiner.phone}</p></div>
            <div className="bg-blue-100 p-4 rounded shadow"><p className="font-semibold">Email:</p><p>{examiner.email}</p></div>
            <div className="bg-green-100 p-4 rounded shadow"><p className="font-semibold">Availability:</p><p>{examiner.availability ? 'Available' : 'Not Available'}</p></div>
            <div className="bg-gray-100 p-4 rounded shadow"><p className="font-semibold">Salary:</p><p>${examiner.salary?.toFixed(2)}</p></div>
            <div className="md:col-span-2 bg-pink-100 p-4 rounded shadow"><p className="font-semibold">Courses:</p><p>{examiner.courses?.join(', ')}</p></div>
            <div className="md:col-span-2 bg-indigo-100 p-4 rounded shadow"><p className="font-semibold">Modules:</p><p>{examiner.modules?.join(', ')}</p></div>
          </div>

          {/* Schedule Table */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Presentation Schedule</h2>
            <table className="min-w-full table-auto border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border text-left">Date</th>
                  <th className="px-4 py-2 border text-left">Time</th>
                  <th className="px-4 py-2 border text-left">Hall No.</th>
                  <th className="px-4 py-2 border text-left">Student Group Number</th>
                </tr>
              </thead>
              <tbody>
                {examiner.presentations.map((presentation, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{presentation.date}</td>
                    <td className="px-4 py-2">{presentation.time}</td>
                    <td className="px-4 py-2">{presentation.hall}</td>
                    <td className="px-4 py-2">{presentation.groupName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Side Profile Modal */}
      {showProfile && (
        <div className="fixed top-0 right-0 h-full w-full bg-black bg-opacity-40 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-white h-full p-6 overflow-y-auto transform transition-all duration-300 shadow-xl rounded-l-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-indigo-700">Profile</h2>
              <button
                onClick={() => setShowProfile(false)}
                className="text-red-500 text-2xl hover:text-red-600"
              >
                ✖
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold">ID</label>
                <input type="text" value={examiner.id} disabled className="w-full p-2 border bg-gray-100 rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Email</label>
                <input type="email" value={examiner.email} disabled className="w-full p-2 border bg-gray-100 rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">First Name</label>
                <input name="fname" value={editedExaminer.fname || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Last Name</label>
                <input name="lname" value={editedExaminer.lname || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-semibold">Phone</label>
                <input name="phone" value={editedExaminer.phone || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
              </div>

              {!editedExaminer.showPasswordFields ? (
                <button
                  onClick={() => setEditedExaminer(prev => ({ ...prev, showPasswordFields: true }))} 
                  className="text-blue-600 font-medium underline"
                >
                  Change Password
                </button>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold">Current Password</label>
                    <input type="password" name="currentPassword" value={editedExaminer.currentPassword || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">New Password</label>
                    <input type="password" name="newPassword" value={editedExaminer.newPassword || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold">Re-enter New Password</label>
                    <input type="password" name="confirmPassword" value={editedExaminer.confirmPassword || ''} onChange={handleInputChange} className="w-full p-2 border rounded" />
                  </div>
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                </>
              )}

              <div className="flex flex-col gap-2 mt-4">
                <button onClick={handleSaveChanges} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded">
                  Save Changes
                </button>
                {editedExaminer.showPasswordFields && (
                  <button onClick={handleSavePassword} className="bg-green-600 hover:bg-green-700 text-white py-2 rounded">
                    Save Password
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">AutoShed</h3>
              <p className="text-gray-400 text-base">A comprehensive platform for managing exam scheduling and presentations.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
                <li><a href="/examiners" className="hover:text-white">Examiners</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: support@autoshed.com</li>
                <li>Phone: +1 800 123 4567</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePageExaminer;
