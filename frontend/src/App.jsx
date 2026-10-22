import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Standard Page Imports
import LoginPage from './pages/LoginPage';
import FleetPage from './pages/FleetPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Task 2 Requirement: Lazy-loaded route for Admin Panel using React.lazy + Suspense
const AdminPanel = lazy(() => import('./pages/AdminPanel'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Navigation with React Router links without full-page reload */}
          <Navbar />

          <main className="main-content">
            <Routes>
              {/* Route: / -> LoginPage */}
              <Route path="/" element={<LoginPage />} />

              {/* Route: /fleet -> FleetPage (protected) */}
              <Route
                path="/fleet"
                element={
                  <ProtectedRoute>
                    <FleetPage />
                  </ProtectedRoute>
                }
              />

              {/* Route: /my-bookings -> MyBookingsPage (protected) */}
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Route: /admin -> AdminPanel (lazy-loaded with React.lazy + Suspense) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <Suspense
                      fallback={
                        <div className="state-container">
                          <div className="spinner"></div>
                          <p style={{ color: 'var(--text-muted)' }}>
                            Loading DriveEasy Admin Panel...
                          </p>
                        </div>
                      }
                    >
                      <AdminPanel />
                    </Suspense>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect to / */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
