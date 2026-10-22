const express = require('express');
const router = express.Router();
const {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle
} = require('../controllers/vehicleController');
const authGuard = require('../middleware/authGuard');

// Public route: Return all vehicles
router.get('/', getAllVehicles);

// Public route: Return single vehicle
router.get('/:id', getVehicleById);

// Protected routes for vehicle management
router.post('/', authGuard, createVehicle);
router.patch('/:id', authGuard, updateVehicle);

module.exports = router;
