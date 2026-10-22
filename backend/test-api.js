require('dotenv').config();
const http = require('http');
const { app, startServer } = require('./server');
const Customer = require('./models/Customer');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

// Simple request helper using native Node.js http
function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({ statusCode: res.statusCode, headers: res.headers, body: parsed });
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('========================================================');
  console.log('   DriveEasy Car Rental System - Backend API Test Suite ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(` \x1b[32m✔ PASS\x1b[0m : ${testName}`);
      passed++;
    } else {
      console.error(` \x1b[31m✖ FAIL\x1b[0m : ${testName}`);
      failed++;
    }
  }

  const server = await startServer(5055);
  const PORT = server.address().port;

  try {
    // 0. Seed test database data
    console.log('\n--- 1. Setting up fresh test data ---');
    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Booking.deleteMany({});

    const customer = await Customer.create({
      name: 'Test Customer',
      email: 'test.customer@driveeasy.com',
      phone: '+91 98765 00000',
      licenseNumber: 'GJ-01-TEST-001',
      role: 'Customer',
      password: 'password123'
    });

    const availableVehicle = await Vehicle.create({
      model: 'Tata Harrier XZA+',
      type: 'SUV',
      pricePerDay: 4200,
      available: true
    });

    const unavailableVehicle = await Vehicle.create({
      model: 'Hyundai Verna SX',
      type: 'Sedan',
      pricePerDay: 3000,
      available: false
    });

    console.log('Test data created.');

    // 1. Health check
    console.log('\n--- 2. Health Check ---');
    const healthRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/health',
      method: 'GET'
    });
    assert(healthRes.statusCode === 200 && healthRes.body.status === 'ok', 'GET /api/health returns 200 OK');

    // 2. AuthGuard Middleware Protection (Without Token)
    console.log('\n--- 3. Testing authGuard Middleware ---');
    const unauthRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/v1/bookings/my',
      method: 'GET'
    });
    assert(
      unauthRes.statusCode === 401 && unauthRes.body.success === false,
      'authGuard blocks request without Bearer token with 401 Unauthorized'
    );

    // 3. POST /api/v1/auth/login
    console.log('\n--- 4. POST /api/v1/auth/login ---');
    const loginRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      { email: 'test.customer@driveeasy.com', password: 'password123' }
    );
    assert(
      loginRes.statusCode === 200 && loginRes.body.token && loginRes.body.customer.name === 'Test Customer',
      'POST /api/v1/auth/login authenticates customer and returns token'
    );
    const token = loginRes.body.token;

    // 4. GET /api/v1/vehicles (Public)
    console.log('\n--- 5. GET /api/v1/vehicles (Public) ---');
    const vehiclesRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/v1/vehicles',
      method: 'GET'
    });
    assert(
      vehiclesRes.statusCode === 200 && Array.isArray(vehiclesRes.body.vehicles) && vehiclesRes.body.vehicles.length >= 2,
      'GET /api/v1/vehicles returns all vehicles without authentication'
    );

    // 5. Validation Demonstration: Booking an already-unavailable vehicle
    console.log('\n--- 6. Validation Test: Attempt booking unavailable vehicle ---');
    const failBookingRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      {
        vehicleId: unavailableVehicle._id.toString(),
        pickupDate: '2026-09-01',
        returnDate: '2026-09-05'
      }
    );
    assert(
      failBookingRes.statusCode === 400 &&
        failBookingRes.body.success === false &&
        failBookingRes.body.message.includes('not available'),
      'POST /api/v1/bookings rejects unavailable vehicle with 400 and structured error JSON'
    );

    // 6. POST /api/v1/bookings (Successful Booking)
    console.log('\n--- 7. POST /api/v1/bookings (Successful Booking) ---');
    const successBookingRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/v1/bookings',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      {
        vehicleId: availableVehicle._id.toString(),
        pickupDate: '2026-09-10',
        returnDate: '2026-09-14'
      }
    );
    assert(
      successBookingRes.statusCode === 201 &&
        successBookingRes.body.success === true &&
        successBookingRes.body.booking.status === 'reserved',
      'POST /api/v1/bookings creates booking record with status reserved and returns 201 Created'
    );

    const bookingId = successBookingRes.body.booking._id;

    // Verify vehicle availability became false
    const updatedVehicle = await Vehicle.findById(availableVehicle._id);
    assert(updatedVehicle.available === false, 'Vehicle available flag was updated to false after booking');

    // 7. GET /api/v1/bookings/my (Customer Own Bookings with Population)
    console.log('\n--- 8. GET /api/v1/bookings/my ---');
    const myBookingsRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/v1/bookings/my',
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert(
      myBookingsRes.statusCode === 200 &&
        myBookingsRes.body.bookings.length > 0 &&
        myBookingsRes.body.bookings[0].vehicleId.model === 'Tata Harrier XZA+' &&
        myBookingsRes.body.bookings[0].customerId.name === 'Test Customer',
      'GET /api/v1/bookings/my returns customer bookings with populated customerId and vehicleId'
    );

    // 8. PATCH /api/v1/bookings/:id/status
    console.log('\n--- 9. PATCH /api/v1/bookings/:id/status ---');
    const patchRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/bookings/${bookingId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      { status: 'completed' }
    );
    assert(
      patchRes.statusCode === 200 &&
        patchRes.body.booking.status === 'completed',
      'PATCH /api/v1/bookings/:id/status updates booking status to completed'
    );

    // Verify vehicle becomes available again upon completion
    const vehicleAfterCompletion = await Vehicle.findById(availableVehicle._id);
    assert(
      vehicleAfterCompletion.available === true,
      'Vehicle availability reset to true after booking status set to completed'
    );

    // 9. Error Handler: Invalid Status
    console.log('\n--- 10. Global Error Handler Validation ---');
    const invalidStatusRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/v1/bookings/${bookingId}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      },
      { status: 'invalid_status_value' }
    );
    assert(
      invalidStatusRes.statusCode === 400 && invalidStatusRes.body.success === false,
      'Invalid enum status returns 400 with structured JSON error'
    );

    console.log('\n========================================================');
    console.log(` Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('========================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error during test suite execution:', err);
    process.exit(1);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTestSuite();
