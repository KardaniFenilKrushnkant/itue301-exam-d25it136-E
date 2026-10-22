const Vehicle = require('../models/Vehicle');

/**
 * GET /api/v1/vehicles
 * Return all vehicles (public endpoint)
 */
const getAllVehicles = async (req, res, next) => {
  try {
    const { type, available } = req.query;
    const filter = {};

    if (type && type !== 'All') {
      filter.type = type;
    }

    if (available !== undefined) {
      filter.available = available === 'true';
    }

    const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/vehicles/:id
 * Return a single vehicle by ID
 */
const getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      vehicle
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/vehicles
 * Create a new vehicle (Admin / Fleet Manager)
 */
const createVehicle = async (req, res, next) => {
  try {
    const { model, type, pricePerDay, available, fuelType, transmission, seatingCapacity, imageUrl } = req.body;

    const vehicle = await Vehicle.create({
      model,
      type,
      pricePerDay,
      available: available !== undefined ? available : true,
      fuelType,
      transmission,
      seatingCapacity,
      imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      vehicle
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/vehicles/:id
 * Update vehicle details / availability
 */
const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehicle not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Vehicle updated successfully',
      vehicle
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle
};
