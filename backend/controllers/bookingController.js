const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

/**
 * POST /api/v1/bookings
 * Create a new booking (protected)
 * Checks that vehicle.available === true before creating, creates Booking, and sets vehicle.available = false.
 */
const createBooking = async (req, res, next) => {
  try {
    const { vehicleId, pickupDate, returnDate } = req.body;
    const customerId = req.customer.id;

    // Validate required fields
    if (!vehicleId) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle ID is required to create a booking.'
      });
    }

    if (!pickupDate || !returnDate) {
      return res.status(400).json({
        success: false,
        message: 'Both pickupDate and returnDate are required.'
      });
    }

    const start = new Date(pickupDate);
    const end = new Date(returnDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format provided for pickupDate or returnDate.'
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'Return date cannot be earlier than pickup date.'
      });
    }

    // Find the vehicle to book
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: `Vehicle not found with ID: ${vehicleId}`
      });
    }

    // Crucial requirement: Check if vehicle is available
    if (vehicle.available !== true) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Vehicle '${vehicle.model}' is currently not available for booking.`
      });
    }

    // Calculate total rental days and price
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalPrice = diffDays * vehicle.pricePerDay;

    // Create the Booking record
    const booking = await Booking.create({
      customerId,
      vehicleId,
      pickupDate: start,
      returnDate: end,
      status: 'reserved',
      totalDays: diffDays,
      totalPrice
    });

    // Set vehicle available to false
    vehicle.available = false;
    await vehicle.save();

    // Populate customer and vehicle for comprehensive response
    const populatedBooking = await Booking.findById(booking._id)
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type');

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking: populatedBooking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/bookings/my
 * Return the logged-in customer's own bookings (protected)
 * Must use .populate('customerId', 'name email') and .populate('vehicleId', 'model type')
 */
const getMyBookings = async (req, res, next) => {
  try {
    const customerId = req.customer.id;

    const bookings = await Booking.find({ customerId })
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/bookings/:id/status
 * Update booking status (protected)
 * Allowed statuses: reserved, ongoing, completed, cancelled
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['reserved', 'ongoing', 'completed', 'cancelled'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values are: ${allowedStatuses.join(', ')}`
      });
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();

    // If completed or cancelled, make vehicle available again
    if (['completed', 'cancelled'].includes(status)) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: true });
    } else if (['reserved', 'ongoing'].includes(status) && ['completed', 'cancelled'].includes(previousStatus)) {
      await Vehicle.findByIdAndUpdate(booking.vehicleId, { available: false });
    }

    const updatedBooking = await Booking.findById(id)
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type');

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}' successfully`,
      booking: updatedBooking
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/bookings
 * Get all bookings across the fleet (Admin / Fleet Manager)
 */
const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('customerId', 'name email phone licenseNumber')
      .populate('vehicleId', 'model type pricePerDay')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  updateBookingStatus,
  getAllBookings
};
