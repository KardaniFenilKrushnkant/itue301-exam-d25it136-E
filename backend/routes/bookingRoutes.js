const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings
} = require('../controllers/bookingController');
const authGuard = require('../middleware/authGuard');

// All booking routes require authentication via authGuard
router.use(authGuard);

// POST /api/v1/bookings - Create a new booking
router.post('/', createBooking);

// GET /api/v1/bookings/my - Return customer's own bookings
router.get('/my', getMyBookings);

// PATCH /api/v1/bookings/:id/status - Update booking status
router.patch('/:id/status', updateBookingStatus);

// GET /api/v1/bookings - Return all fleet bookings (Admin/Fleet Manager)
router.get('/', getAllBookings);

module.exports = router;
