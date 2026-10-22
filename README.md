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

---

## 🎓 Complete Viva Preparation & Code Explanation Guide

Use this section to confidently explain every aspect of the project during your practical viva.

---

### 1. High-Level Architecture & Request Lifecycle

```
[Browser / React Client]
       │
       ▼  (HTTP Request with Bearer Token in Authorization header)
[Express Backend - server.js]
       │
       ├─► 1. CORS & Body Parsers (express.json())
       ├─► 2. requestLogger Middleware ([METHOD] [PATH] [TIMESTAMP])
       ├─► 3. Public Routes (/api/v1/auth/login, GET /api/v1/vehicles)
       │
       ▼
[authGuard Middleware] ─── (Missing / Invalid Token? ──► Returns 401 JSON)
       │
       ▼  (Attaches decoded customer info to req.customer)
[Protected Controllers]
       ├─► bookingController.createBooking (Checks vehicle.available === true)
       ├─► bookingController.getMyBookings (Applies .populate())
       └─► bookingController.updateBookingStatus (PATCH status)
       │
       ▼
[MongoDB via Mongoose Models] (Customer, Vehicle, Booking)
       │
       ▼  (If an error occurs)
[errorHandler Middleware] (Catches error, returns structured JSON without raw stack)
```

---

### 2. Task-by-Task Viva Explanation

#### 🔹 Task 1: React Component Architecture
- **File:** `frontend/src/components/VehicleCard.jsx`
- **What to explain:**
  - The component is a pure, reusable functional component receiving 4 primary props: `model`, `type`, `pricePerDay`, and `available`.
  - It uses a **clean ternary expression** (`!available ? <Badge> : <Button>`) to dynamically swap between displaying a `"Not Available"` red badge and an active `"Book Now"` button.
  - When `"Book Now"` is clicked, an optional callback prop `onBookNow` transmits the selected vehicle object back up to the parent `FleetPage`.

#### 🔹 Task 2: React Routing & State Management
- **Files:** `frontend/src/App.jsx`, `frontend/src/context/AuthContext.jsx`, `frontend/src/components/ProtectedRoute.jsx`
- **What to explain:**
  - **Routing:** Configured with React Router DOM (`<BrowserRouter>`, `<Routes>`, `<Route>`).
  - **Lazy Loading:** `AdminPanel` is loaded dynamically using `const AdminPanel = React.lazy(() => import('./pages/AdminPanel'))` wrapped in `<Suspense fallback={<Spinner />}>`. This splits the admin bundle into a separate JavaScript chunk, reducing initial page load time.
  - **AuthContext:** Provides centralized authentication state (`customer`, `token`, `login`, `logout`) via React Context API (`createContext` + `useContext`). Stores token and customer profile in both component state and `localStorage` for session persistence.
  - **ProtectedRoute:** Higher-order route wrapper that verifies `isAuthenticated`. If unauthenticated, it returns `<Navigate to="/" replace />` to redirect the user to the Login page.
  - **Form State in FleetPage:** Uses React's `useState` hook to manage `selectedVehicle`, `pickupDate`, and `returnDate`. When a user selects a vehicle or changes dates, the UI dynamically re-renders to show the selected vehicle's name and calculated estimated rental cost.

#### 🔹 Task 3: Express REST API & Middleware
- **Files:** `backend/server.js`, `backend/middleware/requestLogger.js`, `backend/middleware/authGuard.js`, `backend/middleware/errorHandler.js`
- **What to explain:**
  - **`requestLogger`:** Global middleware applied before routes:
    ```javascript
    console.log(`[${req.method}] [${req.originalUrl}] [${new Date().toISOString()}]`);
    ```
  - **`authGuard`:** Protects private endpoints. Reads `req.headers.authorization`. If the `Bearer <token>` is missing or verification with `jwt.verify(token, JWT_SECRET)` fails, it halts the request lifecycle immediately with `401 Unauthorized`. Upon success, it attaches the decoded customer payload to `req.customer` and calls `next()`.
  - **Global `errorHandler`:** Placed as the very last middleware with 4 arguments `(err, req, res, next)`. It intercepts errors (such as Mongoose `ValidationError`, `CastError`, and duplicate key errors) and returns a uniform JSON response (`{ success: false, message, details }`), strictly avoiding raw call stacks that expose server internals.
  - **REST Endpoints:** Exposes standard endpoints conforming to REST principles:
    - `POST /api/v1/auth/login` (Auth)
    - `GET /api/v1/vehicles` (Public listing)
    - `POST /api/v1/bookings` (Protected booking creation, returns 201)
    - `GET /api/v1/bookings/my` (Protected user bookings)
    - `PATCH /api/v1/bookings/:id/status` (Protected status patch)

#### 🔹 Task 4: REST API Consumption in React
- **Files:** `frontend/src/pages/FleetPage.jsx`, `frontend/src/services/api.js`
- **What to explain:**
  - Uses `useEffect(() => { fetchVehicles(); }, [])` to trigger the HTTP `GET` request on component mount.
  - Tracks 3 distinct state variables:
    1. `vehicles`: The array of vehicle objects received from the API.
    2. `loading`: Boolean state controlling the loading spinner while the request is in flight.
    3. `error`: Error state capturing friendly error messages if the server is unreachable or fails.
  - **Client-Side Filter:** The user can filter cars by type (`All`, `Hatchback`, `Sedan`, `SUV`). Rather than making a redundant network request on every click, the component preserves the master `vehicles` array in state and computes the derived list using JavaScript's `.filter()` method:
    ```javascript
    const filteredVehicles = vehicles.filter((v) =>
      selectedTypeFilter === 'All' ? true : v.type === selectedTypeFilter
    );
    ```

#### 🔹 Task 5: MongoDB + Mongoose Schemas & Double-Booking Prevention
- **Files:** `backend/models/Customer.js`, `backend/models/Vehicle.js`, `backend/models/Booking.js`, `backend/controllers/bookingController.js`
- **What to explain:**
  - **Schemas & Constraints:**
    - `Customer`: Unique index on `email` and `licenseNumber`; required fields.
    - `Vehicle`: Required `model`, `type` (enum), `pricePerDay` (min: 0), and boolean `available` (default: true).
    - `Booking`: References `Customer` (`customerId`) and `Vehicle` (`vehicleId`), required dates, and a strict `status` enum (`reserved`, `ongoing`, `completed`, `cancelled`).
  - **Double-Booking Prevention Algorithm:**
    In `bookingController.createBooking`:
    1. Look up the requested vehicle using `Vehicle.findById(vehicleId)`.
    2. Check `if (vehicle.available !== true)`: if already booked, immediately reject with `400 Bad Request` and message: `"Vehicle is currently not available for booking."`
    3. If available, create the `Booking` document.
    4. Immediately update `vehicle.available = false` and save to MongoDB.
  - **Mongoose Populate:**
    In `getMyBookings`:
    ```javascript
    await Booking.find({ customerId })
      .populate('customerId', 'name email')
      .populate('vehicleId', 'model type');
    ```
    This automatically joins and replaces the referenced ObjectIDs with the actual Customer name/email and Vehicle model/type in a single response.

---

### 3. Top 5 Frequently Asked Viva Questions & Answers

1. **Q: Why do we use `React.lazy()` and `<Suspense>` for the Admin Panel?**  
   *A:* It implements code-splitting. Instead of bundling the Admin Panel code into the main client bundle downloaded by every customer, it loads the Admin Panel chunk on demand only when an authorized administrator navigates to `/admin`.

2. **Q: How does `authGuard` verify that a customer is authorized?**  
   *A:* It inspects the `Authorization` HTTP header for a `Bearer <token>` format. It decrypts and verifies the JWT signature using `jwt.verify(token, secret)`. If valid, it attaches `req.customer` to the request object and calls `next()`; otherwise, it returns `401 Unauthorized`.

3. **Q: How does your code solve the double-booking problem?**  
   *A:* In `POST /api/v1/bookings`, the backend performs an explicit validation check on `vehicle.available === true`. If the vehicle is already booked, the request is rejected with HTTP 400. Once reserved, the backend marks `vehicle.available = false` in MongoDB.

4. **Q: What is the difference between client-side filtering and server-side filtering? Why use client-side here?**  
   *A:* Server-side filtering sends a new HTTP query (e.g. `?type=SUV`) on every filter click. Client-side filtering fetches the fleet once on mount into state and applies `.filter()` in memory. This provides an instantaneous UI response and avoids unnecessary network overhead.

5. **Q: What is the purpose of Mongoose `.populate()`?**  
   *A:* In MongoDB, references are stored as `ObjectId`s. `.populate()` performs a referenced document lookup (similar to a SQL JOIN) to embed specific fields (e.g. customer's name and vehicle's model) directly into the query result without requiring multiple manual database queries.
