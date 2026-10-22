import React from 'react';
import { Fuel, Gauge, Users, CheckCircle2, XCircle } from 'lucide-react';

/**
 * Task 1: Reusable VehicleCard Component
 * Accepts props: model, type, pricePerDay, available (plus optional extra specs/callbacks)
 * Renders all four required values.
 * If available is false, renders 'Not Available' badge instead of 'Book Now' button;
 * if true, renders 'Book Now' button.
 */
const VehicleCard = ({
  model,
  type,
  pricePerDay,
  available,
  imageUrl,
  fuelType = 'Petrol',
  transmission = 'Automatic',
  seatingCapacity = 5,
  onBookNow
}) => {
  return (
    <div className="vehicle-card" data-testid={`vehicle-card-${model}`}>
      <div className="vehicle-image-wrapper">
        <img
          src={
            imageUrl ||
            'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60'
          }
          alt={model}
          className="vehicle-image"
          loading="lazy"
        />
        <span className="vehicle-type-tag">{type}</span>
        <div className="vehicle-status-tag">
          {available ? (
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> Available
            </span>
          ) : (
            <span className="badge badge-danger">
              <XCircle size={12} /> Unavailable
            </span>
          )}
        </div>
      </div>

      <div className="vehicle-card-content">
        <div className="vehicle-header">
          <div>
            <h3 className="vehicle-model">{model}</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
              Self-Drive • {type}
            </span>
          </div>
          <div className="vehicle-price-box">
            <span className="vehicle-price-value">₹{pricePerDay}</span>
            <span className="vehicle-price-sub"> / day</span>
          </div>
        </div>

        <div className="vehicle-specs">
          <div className="vehicle-spec-item">
            <Fuel size={14} />
            <span>{fuelType}</span>
          </div>
          <div className="vehicle-spec-item">
            <Gauge size={14} />
            <span>{transmission}</span>
          </div>
          <div className="vehicle-spec-item">
            <Users size={14} />
            <span>{seatingCapacity} Seats</span>
          </div>
        </div>

        <div className="vehicle-card-footer">
          {/* Required Ternary: 'Not Available' badge vs 'Book Now' button */}
          {!available ? (
            <div
              className="badge badge-danger"
              style={{
                width: '100%',
                padding: '0.65rem 1rem',
                justifyContent: 'center',
                fontSize: '0.875rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              Not Available
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => onBookNow && onBookNow({ model, type, pricePerDay, available })}
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
