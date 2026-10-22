import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('driveeasy_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('driveeasy_token') || null;
  });

  const [loading, setLoading] = useState(false);

  const login = (newToken, newCustomer) => {
    setToken(newToken);
    setCustomer(newCustomer);
    localStorage.setItem('driveeasy_token', newToken);
    localStorage.setItem('driveeasy_customer', JSON.stringify(newCustomer));
  };

  const logout = () => {
    setToken(null);
    setCustomer(null);
    localStorage.removeItem('driveeasy_token');
    localStorage.removeItem('driveeasy_customer');
  };

  const isAuthenticated = Boolean(token && customer);

  return (
    <AuthContext.Provider
      value={{
        customer,
        token,
        isAuthenticated,
        loading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
