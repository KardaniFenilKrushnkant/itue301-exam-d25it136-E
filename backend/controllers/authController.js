const Customer = require('../models/Customer');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'driveeasy_super_secret_jwt_key_2026';

/**
 * Generate a signed JWT token for a customer
 */
const generateToken = (customer) => {
  return jwt.sign(
    {
      id: customer._id,
      name: customer.name,
      email: customer.email,
      role: customer.role || 'Customer',
      licenseNumber: customer.licenseNumber
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * POST /api/v1/auth/login
 * Authenticate customer and issue token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find customer by email (case-insensitive)
    const customer = await Customer.findOne({ email: email.toLowerCase().trim() });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address. No customer found with this email.'
      });
    }

    // If password provided, verify it (demo allows password123 or matching customer password)
    if (password && customer.password && customer.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password credentials.'
      });
    }

    const token = generateToken(customer);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        licenseNumber: customer.licenseNumber,
        role: customer.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/auth/register
 * Register a new customer
 */
const register = async (req, res, next) => {
  try {
    const { name, email, phone, licenseNumber, role, password } = req.body;

    const existing = await Customer.findOne({
      $or: [{ email: email?.toLowerCase() }, { licenseNumber }]
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A customer with this email or license number already exists.'
      });
    }

    const customer = await Customer.create({
      name,
      email,
      phone,
      licenseNumber,
      role: role || 'Customer',
      password: password || 'password123'
    });

    const token = generateToken(customer);

    res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      token,
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        licenseNumber: customer.licenseNumber,
        role: customer.role
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/auth/me
 * Return current logged-in customer info
 */
const getMe = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.customer.id).select('-password');
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.status(200).json({
      success: true,
      customer
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  register,
  getMe
};
