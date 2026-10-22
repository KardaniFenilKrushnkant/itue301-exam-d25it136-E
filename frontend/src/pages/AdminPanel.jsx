import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Car, Users, Calendar, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api/v1';

/**
 * Task 2: AdminPanel Component
 * Lazy-loaded via React.lazy() + Suspense.
 * Gives Fleet Managers and Admins complete visibility over fleet metrics and bookings.
 */
const AdminPanel = () => {
  const { token, customer } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New vehicle form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState('Sedan');
  const [newPrice, setNewPrice] = useState('');

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch vehicles
      const vRes = await fetch(`${API_BASE}/vehicles`);
      const vData = await vRes.json();
      setVehicles(vData.vehicles || []);

      // Fetch all bookings
      const bRes = await fetch(`${API_BASE}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const bData = await bRes.json();
      setAllBookings(bData.bookings || []);
    } catch (err) {
      setError(err.message || 'Error loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newModel || !newPrice) return;

    try {
      const res = await fetch(`${API_BASE}/vehicles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          model: newModel,
          type: newType,
          pricePerDay: Number(newPrice),
          available: true
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add vehicle');

      setVehicles((prev) => [data.vehicle, ...prev]);
      setNewModel('');
      setNewPrice('');
      setShowAddForm(false);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const totalVehicles = vehicles.length;
  const availableCount = vehicles.filter((v) => v.available).length;
  const unavailableCount = totalVehicles - availableCount;
  const activeBookingsCount = allBookings.filter((b) => ['reserved', 'ongoing'].includes(b.status)).length;

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
          <ShieldCheck size={28} color="#8b5cf6" />
          <h1 style={{ fontSize: '2.25rem' }}>DriveEasy Fleet Admin & Management</h1>
        </div>
        <p style={{ color: 'var(--text-muted)' }}>
          System console for Fleet Managers and Administrators. Real-time fleet health & double-booking prevention.
        </p>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        <div className="form-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Car size={20} color="#60a5fa" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Fleet</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>{totalVehicles}</div>
        </div>

        <div className="form-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <CheckCircle size={20} color="#34d399" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Available Cars</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#34d399' }}>{availableCount}</div>
        </div>

        <div className="form-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Calendar size={20} color="#fbbf24" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Currently Booked</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fbbf24' }}>{unavailableCount}</div>
        </div>

        <div className="form-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <Users size={20} color="#a78bfa" />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Reservations</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa' }}>{activeBookingsCount}</div>
        </div>
      </div>

      {/* Fleet Management Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem' }}>Fleet Inventory Control</h2>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <PlusCircle size={16} />
          <span>{showAddForm ? 'Cancel' : 'Add New Vehicle'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddVehicle} className="form-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Register New Vehicle to Fleet</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Model Name</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Kia Seltos"
                value={newModel}
                onChange={(e) => setNewModel(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select
                className="form-control"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
              >
                <option value="Hatchback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Price Per Day (₹)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                placeholder="3500"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
            Save Vehicle to MongoDB
          </button>
        </form>
      )}

      {/* Bookings Table */}
      <div className="form-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem' }}>All Fleet Reservations</h2>
        {allBookings.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No bookings recorded in the system yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem' }}>Customer</th>
                <th style={{ padding: '0.75rem' }}>Vehicle</th>
                <th style={{ padding: '0.75rem' }}>Dates</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {allBookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600 }}>{b.customerId?.name || 'Customer'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.customerId?.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div>{b.vehicleId?.model || 'Vehicle'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{b.vehicleId?.type}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {new Date(b.pickupDate).toLocaleDateString()} → {new Date(b.returnDate).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className="badge badge-primary">{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
