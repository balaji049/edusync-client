import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import PrimaryButton from "./PrimaryButton";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  const isAuthPage =
    location.pathname.startsWith("/login") ||
    location.pathname.startsWith("/signup");

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="navbar-logo">
          <span className="logo-dot" />
          <span>EduSync AI</span>
        </Link>
      </div>

      <nav className="navbar-center">
        {isAuthenticated && (
          <>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            <Link to="/profile" className="nav-link">
              Profile
            </Link>
          </>
        )}
      </nav>

      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <span className="welcome-text">
              Hello, {user.name.charAt(0).toUpperCase() + user.name.slice(1)}
            </span>
            <button className="primary-btn" onClick={logout}>
              Logout
            </button>
          </>
        ) : isAuthPage ? (
          <Link to="/">
            <PrimaryButton>Back to Home</PrimaryButton>
          </Link>
        ) : (
          <>
            <Link to="/login" className="nav-text-link">
              Log in
            </Link>
            <Link to="/signup">
              <PrimaryButton>Get Started</PrimaryButton>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
