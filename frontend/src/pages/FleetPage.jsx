import React, { useState, useEffect } from 'react';
import VehicleCard from '../components/VehicleCard';
import { useAuth } from '../context/AuthContext';
import { vehicleAPI, bookingAPI } from '../services/api';
import { Calendar, Car, Filter, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

/**
 * Task 1, 2, 4: FleetPage Component
 * - Fetches vehicles from GET /api/v1/vehicles on mount via useEffect
 * - Maintains 3 states: vehicles, loading, error
 * - Client-side type filter (All | Hatchback | Sedan | SUV) without re-fetching
 * - Booking form with useState managing selectedVehicle, pickupDate, returnDate
 * - Meaningful display of selected vehicle as state changes
 * - Renders grid of VehicleCard components passing props
 */
const FleetPage = () => {
  // Task 4: Three required states for API consumption
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Task 4: Client-side filter state
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // Task 2: Form state managed with useState
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Vehicle object or null
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  // Booking submission states
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  const { token, customer } = useAuth();

  // Task 4: Fetch vehicles on component mount using useEffect
  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleAPI.getAll();
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.message || 'Unable to connect to the fleet service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  // Task 4: Client-side filter derived with .filter() without triggering a new API call
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (selectedTypeFilter === 'All') return true;
    return vehicle.type?.toLowerCase() === selectedTypeFilter.toLowerCase();
  });

  // Handler when user clicks 'Book Now' on a VehicleCard
  const handleSelectVehicleForBooking = (vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingSuccess('');
    setBookingError('');

    // Smooth scroll down to the booking form
    const formElement = document.getElementById('booking-form-section');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit booking form
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) {
      setBookingError('Please select a vehicle to book.');
      return;
    }
    if (!pickupDate || !returnDate) {
      setBookingError('Please select both pickup and return dates.');
      return;
    }

    setBookingLoading(true);
    setBookingError('');
    setBookingSuccess('');

    try {
      const data = await bookingAPI.create(
        {
          vehicleId: selectedVehicle._id,
          pickupDate,
          returnDate
        },
        token
      );

      setBookingSuccess(
        `Booking confirmed! Vehicle: ${selectedVehicle.model}. Status: ${data.booking?.status || 'reserved'}`
      );

      // Update vehicle in local state to mark available: false
      setVehicles((prev) =>
        prev.map((v) => (v._id === selectedVehicle._id ? { ...v, available: false } : v))
      );

      // Reset selection
      setSelectedVehicle(null);
      setPickupDate('');
      setReturnDate('');
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>DriveEasy Fleet</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Browse our maintained self-drive cars with live availability and instant reservation.
        </p>
      </div>

      {/* Task 4: Client-side Filter Bar */}
      <div className="filter-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Filter size={18} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filter by Vehicle Type:</span>
        </div>
        <div className="filter-pills">
          {['All', 'Hatchback', 'Sedan', 'SUV'].map((type) => (
            <button
              key={type}
              type="button"
              className={`filter-pill ${selectedTypeFilter === type ? 'active' : ''}`}
              onClick={() => setSelectedTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Task 4 Requirement: Display loading state while data is fetched */}
      {loading && (
        <div className="state-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>
            Fetching vehicle fleet from API...
          </p>
        </div>
      )}

      {/* Task 4 Requirement: Display friendly error message if request fails */}
      {error && !loading && (
        <div className="alert alert-danger" style={{ margin: '2rem 0' }}>
          <AlertCircle size={20} />
          <div>
            <strong>Error Loading Fleet:</strong> {error}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ marginLeft: '1rem' }}
              onClick={fetchVehicles}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Task 4 Requirement: Render grid of VehicleCard components after successful request */}
      {!loading && !error && (
        <>
          {filteredVehicles.length === 0 ? (
            <div className="state-container">
              <Car size={48} color="var(--text-dim)" />
              <p style={{ color: 'var(--text-muted)' }}>
                No vehicles found matching type "{selectedTypeFilter}".
              </p>
            </div>
          ) : (
            <div className="vehicle-grid">
              {filteredVehicles.map((vehicle) => (
                /* Task 1: Reusable VehicleCard accepting model, type, pricePerDay, available */
                <VehicleCard
                  key={vehicle._id}
                  model={vehicle.model}
                  type={vehicle.type}
                  pricePerDay={vehicle.pricePerDay}
                  available={vehicle.available}
                  imageUrl={vehicle.imageUrl}
                  fuelType={vehicle.fuelType}
                  transmission={vehicle.transmission}
                  seatingCapacity={vehicle.seatingCapacity}
                  onBookNow={() => handleSelectVehicleForBooking(vehicle)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Task 2: Booking Form Section */}
      <div id="booking-form-section" style={{ marginTop: '3.5rem' }}>
        <div className="form-card" style={{ maxWidth: '720px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Calendar size={24} color="#3b82f6" />
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Reserve a Vehicle</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Select a car from the fleet above and pick your rental dates.
              </p>
            </div>
          </div>

          {bookingSuccess && (
            <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
              <CheckCircle2 size={20} />
              <span>{bookingSuccess}</span>
            </div>
          )}

          {bookingError && (
            <div className="alert alert-danger" style={{ marginBottom: '1.25rem' }}>
              <ShieldAlert size={20} />
              <span>{bookingError}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit}>
            {/* Task 2 Requirement: Meaningful display of selected vehicle as state changes */}
            <div className="form-group">
              <label className="form-label">Selected Vehicle:</label>
              {selectedVehicle ? (
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong style={{ color: '#ffffff', fontSize: '1rem' }}>
                      {selectedVehicle.model}
                    </strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                      ({selectedVehicle.type} • ₹{selectedVehicle.pricePerDay}/day)
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelectedVehicle(null)}
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: '0.85rem 1.15rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-dim)',
                    fontSize: '0.9rem'
                  }}
                >
                  No vehicle selected yet. Click "Book Now" on any available vehicle card above.
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Task 2: Pickup Date state */}
              <div className="form-group">
                <label className="form-label" htmlFor="pickup-date">
                  Pickup Date
                </label>
                <input
                  id="pickup-date"
                  type="date"
                  className="form-control"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              {/* Task 2: Return Date state */}
              <div className="form-group">
                <label className="form-label" htmlFor="return-date">
                  Return Date
                </label>
                <input
                  id="return-date"
                  type="date"
                  className="form-control"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={pickupDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Live State Feedback Summary */}
            {selectedVehicle && pickupDate && returnDate && (
              <div
                style={{
                  margin: '1rem 0',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255, 255, 255, 0.04)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>
                  Booking <strong>{selectedVehicle.model}</strong> from <strong>{pickupDate}</strong> to <strong>{returnDate}</strong>
                </span>
                <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                  Est. Total: ₹
                  {Math.max(
                    1,
                    Math.ceil(
                      Math.abs(new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
                    ) || 1
                  ) * selectedVehicle.pricePerDay}
                </span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={bookingLoading || !selectedVehicle}
            >
              {bookingLoading ? 'Processing Reservation...' : 'Confirm Reservation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FleetPage;
