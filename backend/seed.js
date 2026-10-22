require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const Customer = require('./models/Customer');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});

    console.log('[Seed] Seeding Customers...');
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

    console.log(`[Seed] Created ${customers.length} customers.`);

    console.log('[Seed] Seeding Vehicles...');
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
        available: false, // Intentionally marked unavailable for validation test demonstration
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

    console.log(`[Seed] Created ${vehicles.length} vehicles.`);

    console.log('[Seed] Seeding sample Bookings...');
    const today = new Date();
    const pickup1 = new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000);
    const return1 = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);

    const booking1 = await Booking.create({
      customerId: customers[0]._id, // Rahul Sharma
      vehicleId: vehicles[3]._id,   // Hyundai Verna (which is unavailable)
      pickupDate: pickup1,
      returnDate: return1,
      status: 'reserved',
      totalDays: 3,
      totalPrice: 9000
    });

    console.log(`[Seed] Created initial booking for ${customers[0].name} (Booking ID: ${booking1._id}).`);
    console.log('[Seed] Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding database:', err);
    process.exit(1);
  }
};

seedData();
