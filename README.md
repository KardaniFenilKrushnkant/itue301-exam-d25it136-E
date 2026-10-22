# DriveEasy Car Rental System

**Course Code:** ITUE301: Advanced Web Development Frameworks  
**Practical Examination:** Set E  
**Institution:** Chandubhai S. Patel Institute of Technology (CSPIT), CHARUSAT  
**Tech Stack:** React (Frontend) + Express.js (Backend) + MongoDB with Mongoose (Database)

---

## 🚗 Project Overview

DriveEasy runs a self-drive car rental fleet. To resolve issues with phone-call bookings and vehicle double-bookings, this centralized web application provides customer self-service booking, real-time availability tracking, and role-based views for Customers, Fleet Managers, and Admins.

---

## 📁 Repository Structure

```
.
├── .env.example                # Root environment configuration template
├── .gitignore                  # Git ignore rules for node_modules, build & env
├── SetE.docx                   # Exam problem statement file
├── README.md                   # Complete documentation and setup guide
├── backend/
│   ├── .env.example            # Backend environment template
│   ├── config/
│   │   └── db.js               # MongoDB connection with Mongoose & in-memory fallback
│   ├── controllers/
│   │   ├── authController.js   # Customer login, registration & profile
│   │   ├── bookingController.js# Booking creation with availability checks & populate
│   │   └── vehicleController.js# Vehicle catalog retrieval and admin management
│   ├── middleware/
│   │   ├── authGuard.js        # JWT Bearer token authentication middleware
│   │   ├── errorHandler.js     # Global structured JSON error handler
│   │   └── requestLogger.js    # Global request logger: [METHOD] [PATH] [TIMESTAMP]
│   ├── models/
│   │   ├── Booking.js          # Booking Mongoose schema with status enum & refs
│   │   ├── Customer.js         # Customer Mongoose schema with uniqueness & validation
│   │   └── Vehicle.js          # Vehicle Mongoose schema with min price & availability
│   ├── routes/
│   │   ├── authRoutes.js       # /api/v1/auth routes
│   │   ├── bookingRoutes.js    # /api/v1/bookings routes (protected)
│   │   └── vehicleRoutes.js    # /api/v1/vehicles routes (public catalog)
│   ├── seed.js                 # Sample database seeder
│   ├── server.js               # Main Express application entrypoint
│   ├── test-api.js             # Automated API test suite verifying all 5 tasks
│   └── package.json
└── frontend/
    ├── index.html              # HTML shell with Google Fonts (Inter + Outfit)
    ├── vite.config.js          # Vite build configuration
    ├── package.json
    └── src/
        ├── App.jsx             # React Router setup with lazy-loaded AdminPanel
        ├── index.css           # Vanilla CSS design system & responsive styling
        ├── main.jsx            # React root mount
        ├── components/
        │   ├── Navbar.jsx      # Navigation links with active indicators & user badge
        │   ├── ProtectedRoute.jsx # Authentication guard redirecting to /
        │   └── VehicleCard.jsx # Reusable vehicle card with conditional badge/button
        ├── context/
        │   └── AuthContext.jsx # Global auth state ({ customer, token, login, logout })
        ├── pages/
        │   ├── AdminPanel.jsx  # Lazy-loaded admin console with fleet metrics
        │   ├── FleetPage.jsx   # Vehicle fleet catalog, client filter & booking form
        │   ├── LoginPage.jsx   # Authentication with demo quick-login buttons
        │   └── MyBookingsPage.jsx # Customer rental history & status management
        └── services/
            └── api.js          # Centralized API service using fetch/REST calls
```

---

## 🛠️ Prerequisites & Installation

- **Node.js:** v18.0.0 or later (v26 tested)
- **MongoDB:** Local MongoDB daemon at `mongodb://localhost:27017` or MongoDB Atlas URI (Note: The backend also includes an automatic in-memory MongoDB fallback so the app can run out-of-the-box in any environment).

### 1. Environment Configuration

Copy `.env.example` in `backend/` to `backend/.env`:

```bash
cd backend
cp .env.example .env
```

Contents of `backend/.env`:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/driveeasy
JWT_SECRET=driveeasy_super_secret_jwt_key_2026
CLIENT_URL=http://localhost:5173
```

---

## 🚀 Running the Project

### Start the Backend Server

```bash
cd backend
npm install
npm run seed       # Seeds sample customers, vehicles, and reservations
npm start          # Or: node server.js
```
The backend starts at: `http://localhost:5001/api/v1`

### Start the React Frontend

Open a new terminal window:

```bash
cd frontend
npm install
npm run dev
```
The frontend starts at: `http://localhost:5173`

---

## 🧪 Automated API Test Suite

The repository includes a self-contained automated test suite verifying all endpoints, middleware, validations, and population logic:

```bash
cd backend
npm run test:api
```

### Verified Test Results:
- `[METHOD] [PATH] [TIMESTAMP]` logged for every request via `requestLogger`
- `authGuard` blocks unauthorized requests with `401 Unauthorized`
- `POST /api/v1/auth/login` issues valid JWT token
- `GET /api/v1/vehicles` returns public vehicle catalog
- **Validation Test:** Attempting to book an already-unavailable vehicle returns `400 Bad Request` with structured error JSON:
  `{"success": false, "message": "Validation Error: Vehicle 'Hyundai Verna SX' is currently not available for booking."}`
- `POST /api/v1/bookings` creates booking record (`201 Created`) and marks vehicle `available: false`
- `GET /api/v1/bookings/my` returns customer's bookings with populated `customerId` (`name`, `email`) and `vehicleId` (`model`, `type`)
- `PATCH /api/v1/bookings/:id/status` updates booking status to `completed` and resets vehicle `available: true`
- Global error handler catches invalid enum values and returns structured JSON

---

## 📋 Task-by-Task Implementation Details

### Task 1: React Component Architecture (4 Marks)
- Reusable `VehicleCard` located at `frontend/src/components/VehicleCard.jsx`.
- Accepts required props: `model`, `type`, `pricePerDay`, `available`.
- Displays all four values clearly.
- Uses clean ternary logic:
  - If `available === false`, renders a `"Not Available"` badge.
  - If `available === true`, renders a `"Book Now"` button.
- Clean component structure, props passing, and styling.

### Task 2: React Routing and State Management (4 Marks)
- Configured React Router (`frontend/src/App.jsx`) with required routes:
  - `/` → `LoginPage`
  - `/fleet` → `FleetPage` (protected)
  - `/my-bookings` → `MyBookingsPage` (protected)
  - `/admin` → `AdminPanel` (lazy-loaded using `React.lazy` + `Suspense`)
- Navigation component (`Navbar.jsx`) uses React Router `<NavLink>` elements without full-page reloads.
- In `FleetPage`, the booking form uses `useState` to manage:
  - `selectedVehicle`
  - `pickupDate`
  - `returnDate`
- Selected vehicle and calculated total price dynamically update on the page as state changes.
- `AuthContext` provides `{ customer, token, login, logout, isAuthenticated }`.
- `ProtectedRoute` redirects unauthenticated users to `/` using `<Navigate to="/" />`.

### Task 3: Express REST API + Middleware (4 Marks)
- Implemented REST endpoints mounted at `/api/v1/`:
  1. `POST /api/v1/auth/login`: Authenticate customer and issue JWT token.
  2. `GET /api/v1/vehicles`: Return all vehicles (public).
  3. `POST /api/v1/bookings`: Create new booking (protected).
  4. `GET /api/v1/bookings/my`: Return customer's own bookings (protected).
  5. `PATCH /api/v1/bookings/:id/status`: Update booking status (protected).
- Custom `requestLogger` logs `[METHOD] [PATH] [TIMESTAMP]` globally for every request.
- Custom `authGuard` validates Bearer token and returns `401` on missing/invalid tokens.
- Global `errorHandler` returns structured JSON responses without exposing raw error stacks.
- Standard HTTP status codes used: `200`, `201`, `400`, `401`, `404`, `500`.

### Task 4: REST API Consumption in React (4 Marks)
- In `FleetPage`, retrieves vehicles from `GET /api/v1/vehicles` using `useEffect()` on mount.
- Maintains three states:
  - `vehicles`: Array of vehicle objects from API
  - `loading`: Boolean loading indicator
  - `error`: Friendly error message string or null
- Displays spinner while fetching, error banner on failure, and grid of `VehicleCard` components on success.
- Client-side type filter (`All` | `Hatchback` | `Sedan` | `SUV`) filters the already-fetched array using `.filter()` without re-triggering network requests.

### Task 5: MongoDB + Mongoose Schema Design and Validation (4 Marks)
- Three Mongoose schemas:
  - `Customer`: `name` (required), `email` (required, unique), `phone` (required), `licenseNumber` (required, unique), `role` (enum: Customer, Fleet Manager, Admin).
  - `Vehicle`: `model` (required), `type` (required, enum: Hatchback, Sedan, SUV), `pricePerDay` (min: 0, required), `available` (Boolean, default: true).
  - `Booking`: `customerId` (ref: Customer, required), `vehicleId` (ref: Vehicle, required), `pickupDate` (required), `returnDate` (required), `status` (enum: reserved, ongoing, completed, cancelled, default: 'reserved').
- `POST /api/v1/bookings` checks that `vehicle.available === true` before booking (returns `400` if unavailable), creates booking, and marks vehicle `available: false`.
- `GET /api/v1/bookings/my` populates customer (`name email`) and vehicle (`model type`).
- Demonstrated validation failure on unavailable vehicles returning structured JSON error.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Customer** | `rahul.sharma@example.com` | `password123` |
| **Customer 2** | `priya.patel@example.com` | `password123` |
| **Fleet Manager** | `fleet.manager@driveeasy.com` | `password123` |
| **System Admin** | `admin@driveeasy.com` | `password123` |

*(Quick-fill buttons are also available on the Login Page for convenience).*
