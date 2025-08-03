import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const isLoggedIn = localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/';
  };

  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <div className="font-bold text-lg">Expense Tracker</div>
      <div className="space-x-4">
        <Link to="/">Dashboard</Link>
        {/* <Link to="/add-expense">Add Expense</Link>
        <Link to="/set-budget">Set Budget</Link>
        <Link to="/history">History</Link>
        <Link to="/monthly-summary">Monthly</Link> */}
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
