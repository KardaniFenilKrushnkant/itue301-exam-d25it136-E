import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Car, CalendarCheck, ShieldCheck, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Task 2: Navigation Component
 * Provides seamless client-side navigation using React Router NavLinks without full-page reloads.
 */
const Navbar = () => {
  const { customer, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="nav-wrapper">
        <NavLink to={isAuthenticated ? '/fleet' : '/'} className="brand-logo">
          <Car size={26} color="#3b82f6" />
          <span>DriveEasy</span>
        </NavLink>

        <ul className="nav-links">
          {!isAuthenticated ? (
            <li>
              <NavLink
                to="/"
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                end
              >
                <LogIn size={16} />
                <span>Login</span>
              </NavLink>
            </li>
          ) : (
            <>
              <li>
                <NavLink
                  to="/fleet"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <Car size={16} />
                  <span>Fleet</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/my-bookings"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <CalendarCheck size={16} />
                  <span>My Bookings</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  <ShieldCheck size={16} />
                  <span>Admin Panel</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {isAuthenticated && customer && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-badge">
              <User size={14} color="#60a5fa" />
              <span>{customer.name}</span>
              <span className="role-tag">{customer.role || 'Customer'}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLogout}
              title="Logout"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
