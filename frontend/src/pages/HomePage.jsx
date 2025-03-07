import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50">
      <h1 className="text-4xl font-bold text-gray-800">Welcome to AutoShed</h1>
      <p className="mt-4 text-lg text-gray-600">Manage your auto repair business efficiently.</p>
      <Link to="/register">
        <button className="mt-6 px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow">
          Get Started
        </button>
      </Link>
    </div>
  );
}

export default HomePage;
