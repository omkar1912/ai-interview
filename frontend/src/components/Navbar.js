import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          AI Interview Platform
        </Link>
        <ul className="navbar-links">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/interviews">Interviews</Link></li>
          {isAdmin() && (
            <>
              <li><Link to="/create-interview">Create Interview</Link></li>
              <li><Link to="/questions">Questions</Link></li>
              <li><Link to="/create-question">Create Question</Link></li>
              <li><Link to="/ai-generator">AI Generator</Link></li>
              <li><Link to="/admin">Admin</Link></li>
            </>
          )}
          <li><Link to="/profile">Profile</Link></li>
          <li>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;