import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { Calendar, Car, Clock, AlertCircle, RefreshCw, XCircle, CheckCircle } from 'lucide-react';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const { token, customer } = useAuth();

  const fetchMyBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingAPI.getMyBookings(token);
      setBookings(data.bookings || []);
    } catch (err) {
      setError(err.message || 'Error fetching your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyBookings();
    }
  }, [token]);

  // Handle status update (e.g. cancel booking)
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await bookingAPI.updateStatus(bookingId, newStatus, token);

      // Update state
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'reserved':
        return <span className="badge badge-primary">Reserved</span>;
      case 'ongoing':
        return <span className="badge badge-warning">Ongoing</span>;
      case 'completed':
        return <span className="badge badge-success">Completed</span>;
      case 'cancelled':
        return <span className="badge badge-danger">Cancelled</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.35rem' }}>My Bookings</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Viewing rental history for <strong>{customer?.name}</strong> ({customer?.email})
          </p>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={fetchMyBookings}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'spinner' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)' }}>Loading your rental reservations...</p>
        </div>
      )}

      {error && !loading && (
        <div className="alert alert-danger" style={{ marginBottom: '2rem' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="state-container">
          <Car size={52} color="var(--text-dim)" />
          <h3>No bookings found</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>
            You haven't reserved any vehicles yet. Explore our fleet to book a self-drive car today!
          </p>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((b) => (
            <div
              key={b._id}
              className="form-card"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div
                  style={{
                    padding: '1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Car size={28} color="#60a5fa" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
                    {b.vehicleId?.model || 'Vehicle info'}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    <span>Type: <strong>{b.vehicleId?.type || 'Standard'}</strong></span>
                    <span>•</span>
                    <span>Booking ID: <code style={{ color: '#93c5fd' }}>{b._id.slice(-6)}</code></span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                    Pickup Date
                  </span>
                  <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>
                    {new Date(b.pickupDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                    Return Date
                  </span>
                  <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>
                    {new Date(b.returnDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>
                    Status
                  </span>
                  <div>{getStatusBadge(b.status)}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {b.status === 'reserved' && (
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleUpdateStatus(b._id, 'cancelled')}
                    disabled={updatingId === b._id}
                  >
                    <XCircle size={14} />
                    <span>Cancel</span>
                  </button>
                )}
                {b.status === 'ongoing' && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleUpdateStatus(b._id, 'completed')}
                    disabled={updatingId === b._id}
                  >
                    <CheckCircle size={14} />
                    <span>Complete</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
