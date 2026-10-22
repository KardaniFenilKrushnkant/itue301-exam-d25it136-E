/**
 * Centralized API service for DriveEasy Car Rental Frontend
 * Handles base URL configuration and authentication token attachment.
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

/**
 * Helper to execute API requests with optional authentication
 */
export async function apiRequest(endpoint, { method = 'GET', body = null, token = null } = {}) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// Vehicle APIs
export const vehicleAPI = {
  // Task 4: GET /api/v1/vehicles (Public)
  getAll: (type) => {
    const query = type && type !== 'All' ? `?type=${encodeURIComponent(type)}` : '';
    return apiRequest(`/vehicles${query}`);
  },
  getById: (id) => apiRequest(`/vehicles/${id}`),
  create: (vehicleData, token) => apiRequest('/vehicles', { method: 'POST', body: vehicleData, token }),
  update: (id, updateData, token) => apiRequest(`/vehicles/${id}`, { method: 'PATCH', body: updateData, token })
};

// Booking APIs
export const bookingAPI = {
  // Task 3 & 5: POST /api/v1/bookings (Protected)
  create: (bookingData, token) => apiRequest('/bookings', { method: 'POST', body: bookingData, token }),

  // Task 3 & 5: GET /api/v1/bookings/my (Protected)
  getMyBookings: (token) => apiRequest('/bookings/my', { token }),

  // Task 3: PATCH /api/v1/bookings/:id/status (Protected)
  updateStatus: (id, status, token) =>
    apiRequest(`/bookings/${id}/status`, { method: 'PATCH', body: { status }, token }),

  // GET /api/v1/bookings (Admin Fleet Bookings)
  getAllBookings: (token) => apiRequest('/bookings', { token })
};

// Auth APIs
export const authAPI = {
  // Task 3: POST /api/v1/auth/login
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (customerData) => apiRequest('/auth/register', { method: 'POST', body: customerData }),
  getMe: (token) => apiRequest('/auth/me', { token })
};
