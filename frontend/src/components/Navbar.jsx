import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="font-display text-xl font-800 gradient-text">
        PostForge
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {user ? (
          <>
            <Link to="/dashboard" className="hover:text-accentTo transition">Dashboard</Link>
            <Link to="/create" className="hover:text-accentTo transition">Create Post</Link>
            <span className="text-gray-400 hidden sm:inline">Hi, {user.name}</span>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-red-400 hover:text-red-400 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-accentTo transition">Login</Link>
            <Link to="/register" className="gradient-btn px-4 py-1.5 rounded-lg font-medium">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
