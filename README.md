# ✈️ Airport Property Management System (APMS) - Backend

This repository contains the backend server application for the Airport Property Management System (APMS). It provides a secure RESTful API to manage parent corporations, duty-free retail shops, airport properties, lease agreements, sales logs, and analytical reports.

## 🛠️ Tech Stack & Architecture

- **Runtime Environment:** Node.js
- **Framework:** Express.js (v5.x)
- **Database Engine:** MySQL (via `mysql2`)
- **Authentication:** JSON Web Tokens (JWT)
- **Cross-Origin Resource Sharing:** CORS Middleware

---

## 🚀 System Architecture & API Endpoints

The backend handles the core routing and relational database communication injectively mapping the following route modules:

### 1. Authentication Router (`/api/auth`)
*   `POST /api/auth/login` - Authenticates administrative user credentials and returns a secure JWT payload valid for 1 hour.

### 2. Corporate Ledger Router (`/api/companies`)
*   Handles the operational lifecycle and record bookkeeping for main Parent Corporations inside the duty-free zone terminal.

### 3. Shop Profiling Router (`/api/shops`)
*   Manages the identity specifications, categorizations, and linking configurations for individual retail tenant shops.

### 4. Property Infrastructure Router (`/api/properties`)
*   Tracks terminal structural properties, physical dimensions, zone boundaries, and spatial allocation statuses.

### 5. Agreement Engine Router (`/api/agreements`)
*   Governs corporate contract legs, monthly financial rental rates, and lease execution matrices.

### 6. Transaction & Audit Routers (`/api/sales`)
*   `app.use('/api/sales', salesRoutes)` - Captures and registers terminal transaction points.
*   `app.use('/api/sales', reportRoutes)` - Fetches data metrics and analytics filtered by timeline structures.

---

## 💻 Local Workspace Installation Guide

### 1. Core System Prerequisites
Ensure the following software components are activated in your environment:
*   **Node.js (LTS Version):** Engine to manage runtime dependencies.
*   **XAMPP Control Panel:** Software stack providing the local Apache and MySQL instance environment.

### 2. Database Creation & Schema Configuration
1. Spin up the **XAMPP Control Panel** and execute the **Apache** and **MySQL** server layers.
2. Load the administration dashboard interface: `http://localhost/phpmyadmin/`.
3. Select **New** to structure a fresh relational schema database. Name it precisely: **`dbdutyfreepos`**.
4. Import your designated structural database backup `.sql` file inside the import command engine layout.

### 3. Backend Deployment Execution
Open your local VS Code application window, navigate to the target backend repository terminal console, and execute the configuration steps:

1. Step down into the runtime context workspace path:
   ```bash
   cd backend


1.Retrieve and bundle the exact locked architecture module components from the npm registry:
npm install
2.Establish a standard configuration file named exactly .env inside the root directory block of your backend workspace, and define your local ecosystem variables:
PORT=5000
DB_HOST=localhost
DB_USER=root
JWT_SECRET=your_custom_secure_jwt_secret_key_string
3.Boot up the local web service server pipeline thread:
node server.js
Server is running on port 5000
Connected to the MySQL database.

System Configuration Metadata (package.json)
Execution Type: CommonJS

Core Native Modules:

express (^5.2.1) - HTTP routing interface framework.

mysql2 (^3.22.5) - Connection pool connector.

jsonwebtoken (^9.0.3) - Route verification algorithms.

dotenv (^17.4.2) - Local configuration hideout.

cors (^2.8.6) - Security cross-communication bridge.
