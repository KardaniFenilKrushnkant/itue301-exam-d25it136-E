import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Task 2: ProtectedRoute Wrapper
 * Redirects unauthenticated users to '/' using <Navigate to="/" />
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, customer, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (requiredRole && customer?.role !== requiredRole && customer?.role !== 'Admin') {
    return <Navigate to="/fleet" replace />;
  }

  return children;
};

export default ProtectedRoute;
