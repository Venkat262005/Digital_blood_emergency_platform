import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaHeartbeat, FaBars, FaUser, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import Button from "./ui/Button";

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <nav className="container-custom py-4 flex items-center justify-between gap-4">
        {/* Left Side: Menu + Logo */}
        <div className="flex items-center gap-4">
          {user && onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors lg:hidden"
              aria-label="Toggle menu"
            >
              <FaBars className="text-xl" />
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-red-600 hover:text-red-700 transition-colors">
            <FaHeartbeat className="text-2xl" />
            <div className="flex flex-col leading-tight">
              <span className="font-black">BloodLink</span>
              <span className="text-[10px] font-normal text-neutral-500 hidden sm:block">
                Save lives together
              </span>
            </div>
          </Link>
        </div>

        {/* Center Navigation (Desktop) */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            {user.role === "donor" && (
              <>
                <NavLink
                  to="/donor/dashboard"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "bg-red-50 text-red-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/donor/donation-history"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "bg-red-50 text-red-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  Donation History
                </NavLink>
                <NavLink
                  to="/donor/points-history"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "bg-red-50 text-red-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  Points History
                </NavLink>
              </>
            )}

            {user.role === "receiver" && (
              <>
                <NavLink
                  to="/receiver/dashboard"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "bg-red-50 text-red-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  Find Donors
                </NavLink>
                <NavLink
                  to="/requests/new"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "bg-red-50 text-red-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  New Request
                </NavLink>
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isActive
                      ? "bg-red-50 text-red-600"
                      : "text-neutral-700 hover:bg-neutral-100"
                    }`
                  }
                >
                  History
                </NavLink>
              </>
            )}
          </div>
        )}

        {/* Right Side: User Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-neutral-100 rounded-xl">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <FaUser className="text-red-600 text-sm" />
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-neutral-900">{user.name}</p>
                  <p className="text-[10px] text-neutral-500 capitalize">{user.role}</p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <FaSignOutAlt />
                Logout
              </Button>
              <button
                onClick={handleLogout}
                className="sm:hidden p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
                aria-label="Logout"
              >
                <FaSignOutAlt className="text-lg" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button to="/login" variant="ghost" size="sm">
                Login
              </Button>
              <Button to="/signup" variant="primary" size="sm">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
