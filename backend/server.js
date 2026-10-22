require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5001;

// Enable CORS for frontend clients
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Request Logger Middleware: logs [METHOD] [PATH] [TIMESTAMP]
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'DriveEasy Car Rental API',
    timestamp: new Date().toISOString()
  });
});

// REST API Endpoints mounted under /api/v1/
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found on this server.`
  });
});

// Global Error Handling Middleware (must be last)
app.use(errorHandler);

const Customer = require('./models/Customer');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

// Auto-seed initial demo data if database is empty
const autoSeedIfEmpty = async () => {
  try {
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      console.log('[Database] Database is empty. Auto-seeding initial demo data...');
      const customers = await Customer.create([
        {
          name: 'Rahul Sharma',
          email: 'rahul.sharma@example.com',
          phone: '+91 98765 43210',
          licenseNumber: 'GJ-01-2021-998877',
          role: 'Customer',
          password: 'password123'
        },
        {
          name: 'Priya Patel',
          email: 'priya.patel@example.com',
          phone: '+91 98220 12345',
          licenseNumber: 'GJ-06-2022-445566',
          role: 'Customer',
          password: 'password123'
        },
        {
          name: 'Amit Varma',
          email: 'fleet.manager@driveeasy.com',
          phone: '+91 91234 56789',
          licenseNumber: 'GJ-05-2019-112233',
          role: 'Fleet Manager',
          password: 'password123'
        },
        {
          name: 'System Admin',
          email: 'admin@driveeasy.com',
          phone: '+91 99999 88888',
          licenseNumber: 'GJ-01-2018-000001',
          role: 'Admin',
          password: 'password123'
        }
      ]);

      const vehicles = await Vehicle.create([
        {
          model: 'Maruti Suzuki Swift',
          type: 'Hatchback',
          pricePerDay: 1800,
          available: true,
          fuelType: 'Petrol',
          transmission: 'Manual',
          seatingCapacity: 5,
          imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=60'
        },
        {
          model: 'Hyundai i20 Asta',
          type: 'Hatchback',
          pricePerDay: 2200,
          available: true,
          fuelType: 'Petrol',
          transmission: 'Automatic',
          seatingCapacity: 5,
          imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=60'
        },
        {
          model: 'Honda City V',
          type: 'Sedan',
          pricePerDay: 3200,
          available: true,
          fuelType: 'Petrol',
          transmission: 'Automatic',
          seatingCapacity: 5,
          imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=60'
        },
        {
          model: 'Hyundai Verna SX',
          type: 'Sedan',
          pricePerDay: 3000,
          available: false, // unavailable for validation testing
          fuelType: 'Diesel',
          transmission: 'Manual',
          seatingCapacity: 5,
          imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=60'
        },
        {
          model: 'Mahindra XUV700 AX7',
          type: 'SUV',
          pricePerDay: 4800,
          available: true,
          fuelType: 'Diesel',
          transmission: 'Automatic',
          seatingCapacity: 7,
          imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=60'
        },
        {
          model: 'Tata Harrier XZA+',
          type: 'SUV',
          pricePerDay: 4200,
          available: true,
          fuelType: 'Diesel',
          transmission: 'Automatic',
          seatingCapacity: 5,
          imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=60'
        }
      ]);

      const today = new Date();
      await Booking.create({
        customerId: customers[0]._id,
        vehicleId: vehicles[3]._id,
        pickupDate: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        returnDate: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        status: 'reserved',
        totalDays: 3,
        totalPrice: 9000
      });

      console.log('[Database] Auto-seeded demo accounts and vehicles successfully.');
    }
  } catch (err) {
    console.warn('[Database] Auto-seed check warning:', err.message);
  }
};

// Start Server and Connect Database
const startServer = async (customPort) => {
  const listenPort = customPort || PORT;
  try {
    await connectDB();
    await autoSeedIfEmpty();
    const server = app.listen(listenPort, () => {
      console.log(`===============================================`);
      console.log(` DriveEasy Backend running on port ${listenPort}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Base URL: http://localhost:${listenPort}/api/v1`);
      console.log(`===============================================`);
    });
    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
