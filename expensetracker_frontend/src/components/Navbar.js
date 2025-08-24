import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("access_token"));
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false); // ✅ update state
    navigate("/login");
  };

  useEffect(() => {
    // ✅ Listen for login/logout changes
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("access_token"));
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <div className="font-bold text-lg">Expense Tracker</div>
      <div className="space-x-4">
        <Link to="/">Dashboard</Link>
        {!isLoggedIn ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
