import { Routes, Route, Link } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Dashboard from "./components/Dashboard.jsx";
import PostForm from "./components/PostForm.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const Landing = () => {
  const { user } = useAuth();
  return (
    <div className="max-w-4xl mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-4xl sm:text-5xl font-800 mb-4">
        One post. <span className="gradient-text">Every platform.</span>
      </h1>
      <p className="text-gray-400 max-w-xl mx-auto mb-8">
        Write your content once — PostForge validates character limits, media size, and
        formatting for Twitter, Instagram, LinkedIn and Facebook automatically.
      </p>
      <Link to={user ? "/create" : "/register"} className="gradient-btn inline-block px-8 py-3 rounded-xl font-semibold">
        {user ? "Create a post" : "Get started free"}
      </Link>
    </div>
  );
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <PostForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
