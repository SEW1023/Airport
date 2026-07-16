# Software Requirements Specification (SRS)
## ✈️ Airport Property Management System (APMS)

**Document Version:** 1.0  
**Last Updated:** July 16, 2026  
**Status:** Active  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for the Airport Property Management System (APMS). APMS is a comprehensive web-based platform designed to manage airport duty-free retail operations, including corporate partnerships, shop management, property allocation, lease agreements, sales transactions, and financial reporting.

### 1.2 Scope
The APMS consists of two primary components:
- **Backend Service:** Node.js/Express API providing RESTful endpoints for business logic and database operations
- **Frontend Application:** React + Vite SPA for administrative management and reporting interfaces

The system manages operations across multiple airport terminals with support for multiple companies, retail shops, properties, and transaction records.

### 1.3 Audience
- System Developers
- Business Analysts
- Quality Assurance Engineers
- Project Managers
- Airport Authority Stakeholders

---

## 2. Overall Description

### 2.1 System Overview
APMS is a duty-free retail management platform that streamlines operations for airport properties. It enables administrators to:
- Manage parent corporations and retail tenant shops
- Track property infrastructure and spatial allocation
- Establish and monitor lease agreements
- Record sales transactions
- Generate financial reports and analytics

### 2.2 System Architecture

#### 2.2.1 Technology Stack
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | LTS |
| Backend Framework | Express.js | 5.x |
| Frontend Framework | React | 19.2.7 |
| Build Tool | Vite | 8.1.0 |
| Database | MySQL | 5.7+ |
| Authentication | JWT (JSON Web Tokens) | 9.0.3 |
| UI Styling | Tailwind CSS | 4.3.1 |
| Database Driver | mysql2 | 3.22.5 |
| CORS Support | cors | 2.8.6 |
| Environment Config | dotenv | 17.4.2 |

#### 2.2.2 System Architecture Diagram
```
┌─────────────────────┐
│   React Frontend    │
│   (Vite + React)    │
└──────────┬──────────┘
           │ REST API
           │ HTTP/HTTPS
┌──────────▼──────────┐
│   Express Backend   │
│   Node.js Service   │
└──────────┬──────────┘
           │ JDBC
           │ Connection Pool
┌──────────▼──────────┐
│   MySQL Database    │
│   dbdutyfreepos     │
└─────────────────────┘
```

### 2.3 User Classes
1. **System Administrator** - Full system access, user management
2. **Corporate Manager** - Company and shop management
3. **Sales Manager** - Transaction entry and monitoring
4. **Finance Manager** - Report generation and analytics
5. **Property Manager** - Property and agreement management

---

## 3. Specific Requirements

### 3.1 Functional Requirements

#### 3.1.1 Authentication Module (`/api/auth`)

**FR-AUTH-001: User Login**
- **Description:** Authenticate users with username and password
- **Endpoint:** `POST /api/auth/login`
- **Input:** Username, Password
- **Output:** JWT Token (valid for 1 hour), User metadata
- **Validation:** Required fields validation, credential verification
- **Error Handling:** Invalid username/password responses

**FR-AUTH-002: JWT Token Management**
- **Description:** Generate and validate JWT tokens for secured endpoints
- **Token Expiration:** 1 hour
- **Token Claims:** User ID, Username, User Type
- **Required Header:** `Authorization: Bearer <JWT_TOKEN>`

---

#### 3.1.2 Company Management Module (`/api/companies`)

**FR-COMP-001: Retrieve All Companies**
- **Description:** Fetch all registered parent corporations
- **Endpoint:** `GET /api/companies`
- **Output:** List of companies with ID, name, address, contact, email, status
- **Sorting:** Descending order by company ID
- **Authentication:** Required

**FR-COMP-002: Register New Company**
- **Description:** Add a new parent corporation to the system
- **Endpoint:** `POST /api/companies`
- **Input:** Company name, address, contact number, email address
- **Output:** Success message
- **Validation:** Required fields, email format validation
- **Authentication:** Required

**FR-COMP-003: Update Company Information**
- **Description:** Modify existing company details
- **Endpoint:** `PUT /api/companies/:id`
- **Input:** Company ID, updated fields (name, address, contact, email, status)
- **Output:** Success message
- **Authentication:** Required

**FR-COMP-004: Delete Company Record**
- **Description:** Remove company from system
- **Endpoint:** `DELETE /api/companies/:id`
- **Input:** Company ID
- **Output:** Success message
- **Constraints:** Cascade delete associated shops and agreements
- **Authentication:** Required

---

#### 3.1.3 Shop Management Module (`/api/shops`)

**FR-SHOP-001: Retrieve All Shops**
- **Description:** Fetch all retail tenant shops with company associations
- **Endpoint:** `GET /api/shops`
- **Output:** List of shops with ID, name, company info, contact, integration type, document count, status
- **Sorting:** Descending order by shop ID
- **Authentication:** Required

**FR-SHOP-002: Register New Shop**
- **Description:** Add new retail shop to system
- **Endpoint:** `POST /api/shops`
- **Input:** Shop name, Company ID, contact, email, integration type, document count
- **Integration Types:** `POS_Integration`, `Manual_Entry`
- **Output:** Success message
- **Validation:** Company ID existence, required fields
- **Authentication:** Required

**FR-SHOP-003: Update Shop Configuration**
- **Description:** Modify existing shop information
- **Endpoint:** `PUT /api/shops/:id`
- **Input:** Shop ID, updated fields
- **Output:** Success message
- **Authentication:** Required

**FR-SHOP-004: Delete Shop Record**
- **Description:** Remove shop from system
- **Endpoint:** `DELETE /api/shops/:id`
- **Input:** Shop ID
- **Output:** Success message
- **Constraints:** Cascade delete associated agreements and transactions
- **Authentication:** Required

---

#### 3.1.4 Property Management Module (`/api/properties`)

**FR-PROP-001: Retrieve All Properties**
- **Description:** Fetch all terminal properties and spatial allocations
- **Endpoint:** `GET /api/properties`
- **Output:** List of properties with ID, name, square footage, location ID, lease status, color code
- **Authentication:** Required

**FR-PROP-002: Get Unique Locations**
- **Description:** Retrieve distinct location identifiers
- **Endpoint:** `GET /api/properties/unique-locations`
- **Output:** Array of unique location IDs (e.g., T1-A, T2-B, T3-A1)
- **Authentication:** Required

**FR-PROP-003: Add New Property**
- **Description:** Register new terminal property
- **Endpoint:** `POST /api/properties/add`
- **Input:** Property name, square footage, location ID, lease status, proposed property flag, chart color
- **Output:** Success message
- **Validation:** Location ID format, required fields
- **Authentication:** Required

**FR-PROP-004: Update Property Details**
- **Description:** Modify existing property information
- **Endpoint:** `PUT /api/properties/:id`
- **Input:** Property ID, updated fields
- **Output:** Success message
- **Authentication:** Required

**FR-PROP-005: Delete Property Record**
- **Description:** Remove property from system
- **Endpoint:** `DELETE /api/properties/:id`
- **Input:** Property ID
- **Output:** Success message
- **Constraints:** Cascade delete associated agreements
- **Authentication:** Required

---

#### 3.1.5 Agreement Management Module (`/api/agreements`)

**FR-AGREE-001: Retrieve All Agreements**
- **Description:** Fetch all lease agreements with full details
- **Endpoint:** `GET /api/agreements`
- **Output:** List of agreements including shop, company, property, dates, financial terms, status
- **Fields:** Agreement ID, shop info, company info, property info, start/end dates, minimum STO level, conference rate, bank deposit, status, location, currency
- **Authentication:** Required

**FR-AGREE-002: Create New Agreement**
- **Description:** Register new lease agreement
- **Endpoint:** `POST /api/agreements`
- **Input:**
  - Shop ID, Company ID, Property ID
  - Start Date, End Date
  - Minimum STO Level (Minimum Sales Target Override)
  - Conference Rate (%)
  - Bank Deposit Amount
  - Agreement Status
  - Location ID
  - STO Currency
- **Output:** Success message
- **Validation:** Date range validation, required fields
- **Authentication:** Required

**FR-AGREE-003: Update Agreement Terms**
- **Description:** Modify existing lease agreement
- **Endpoint:** `PUT /api/agreements/:id`
- **Input:** Agreement ID, updated fields
- **Output:** Success message
- **Authentication:** Required

**FR-AGREE-004: Delete Agreement**
- **Description:** Remove agreement from system
- **Endpoint:** `DELETE /api/agreements/:id`
- **Input:** Agreement ID
- **Output:** Success message
- **Authentication:** Required

**FR-AGREE-005: Get Locations List**
- **Description:** Retrieve distinct locations used in agreements
- **Endpoint:** `GET /api/agreements/locations-list`
- **Output:** Array of location objects with location ID
- **Authentication:** Required

---

#### 3.1.6 Sales Transaction Module (`/api/sales`)

**FR-SALES-001: Get Available Shops**
- **Description:** Retrieve shops for transaction assignment
- **Endpoint:** `GET /api/sales/shops`
- **Output:** List of shops with ID, name, company ID
- **Authentication:** Required

**FR-SALES-002: Get Available Companies**
- **Description:** Retrieve companies for transaction association
- **Endpoint:** `GET /api/sales/companies`
- **Output:** List of companies with ID, name
- **Authentication:** Required

**FR-SALES-003: Get Available Locations**
- **Description:** Retrieve locations for transaction filtering
- **Endpoint:** `GET /api/sales/locations`
- **Output:** List of locations with location ID and name
- **Authentication:** Required

**FR-SALES-004: Retrieve Recent Transactions**
- **Description:** Fetch last 50 sales transactions with complete details
- **Endpoint:** `GET /api/sales/recent`
- **Output:** Array of transactions with 40+ data fields
- **Transaction Fields:**
  - Identifiers: dayId, shopId, invoice number
  - DateTime: transaction date/time, flight date/time
  - Product: name, category, sub-category, brand
  - Quantities: quantity, unit price
  - Pricing: total before/after discount, sales tax
  - Payment: method, currency, actual payment currency
  - Flight Info: flight number, origin/destination airports
  - Passenger: name, nationality, passport ID, birthdate, gender
  - System: database name, till number, duplicate flag
- **Authentication:** Required

**FR-SALES-005: Add Single Transaction**
- **Description:** Record new sales transaction
- **Endpoint:** `POST /api/sales/add`
- **Input:** Transaction data (40+ fields)
- **Output:** Success message
- **Validation:** Required fields (shopId, INVOICE_NUMBER, NET_SALES), shop existence validation
- **Authentication:** Required

**FR-SALES-006: Add Batch Transactions**
- **Description:** Import multiple transactions in single request
- **Endpoint:** `POST /api/sales/add`
- **Input:** Array of transaction objects
- **Output:** Success message with count of successful imports and error list
- **Partial Success:** Supported - continue processing on individual transaction failures
- **Authentication:** Required

**FR-SALES-007: Update Transaction Record**
- **Description:** Modify existing transaction
- **Endpoint:** `PUT /api/sales/update/:id`
- **Input:** Transaction ID, updated fields
- **Output:** Success message with transaction ID
- **Authentication:** Required

**FR-SALES-008: Delete Transaction Record**
- **Description:** Remove transaction from system
- **Endpoint:** `DELETE /api/sales/delete/:id`
- **Input:** Transaction ID
- **Output:** Success message
- **Authentication:** Required

---

#### 3.1.7 Reporting Module (`/api/sales`)

**FR-REPORT-001: Daily Sales Report**
- **Description:** Generate sales data for specific date
- **Endpoint:** `GET /api/sales/report`
- **Query Parameters:** Date (YYYY-MM-DD format)
- **Output:** Sales data grouped by company/shop with minimum limits
- **Fields:** Min limit, company name, shop name, sale amount, currency
- **Authentication:** Required

**FR-REPORT-002: Monthly Sales Report**
- **Description:** Generate aggregated sales for specific month
- **Endpoint:** `GET /api/sales/report-monthly`
- **Query Parameters:** Month (YYYY-MM format)
- **Output:** Sales data grouped by company/shop
- **Authentication:** Required

**FR-REPORT-003: Shop Monthly Summary**
- **Description:** Detailed summary for specific shop in specific month
- **Endpoint:** `GET /api/sales/report-shop-monthly-summary`
- **Query Parameters:** shopId, month (YYYY-MM format)
- **Output:** Summary with agreement details, last transaction date, last invoice, total sales
- **Fields:** Report month, agreement ID, company name, shop name, last date, last invoice, sale amount
- **Authentication:** Required

**FR-REPORT-004: Monthly Invoice Count Report**
- **Description:** Invoice count and sales data by shop for specific month
- **Endpoint:** `GET /api/sales/report-monthly-invoice-count`
- **Query Parameters:** Month (YYYY-MM format)
- **Output:** Detailed invoice metrics per shop
- **Fields:** Shop ID, shop name, year, month, invoice count, sale amount, currency, min limit, company name
- **Authentication:** Required

**FR-REPORT-005: Export to PDF**
- **Description:** Export reports to PDF format
- **Technology:** jsPDF library
- **Supported Formats:** Tabular with jsPDF-AutoTable plugin

**FR-REPORT-006: Export to Excel**
- **Description:** Export reports to Excel format
- **Technology:** XLSX library
- **Features:** Multiple sheets, formatted tables

---

### 3.2 Non-Functional Requirements

#### 3.2.1 Performance Requirements
- **Response Time:** API endpoints should respond within 2 seconds under normal load
- **Database Query Optimization:** All queries indexed for <100ms response time
- **Concurrent Users:** Support minimum 50 concurrent users
- **Database Connection Pool:** Configured for optimal MySQL connection management
- **Frontend Load Time:** Initial page load <3 seconds with Vite optimization

#### 3.2.2 Security Requirements
- **Authentication:** JWT-based stateless authentication
- **Token Expiration:** 1 hour session duration
- **Authorization:** Role-based access control (RBAC) implementation
- **SQL Injection Prevention:** Parameterized queries (mysql2 support)
- **CORS:** Enabled for secure cross-origin requests
- **HTTPS:** Required for production deployment
- **Password Storage:** Bcrypt hashing recommended (implement in future version)
- **Environment Variables:** Sensitive data stored in .env files (never committed)

#### 3.2.3 Availability Requirements
- **Uptime SLA:** 99.5% monthly uptime target
- **Backup Strategy:** Daily database backups
- **Disaster Recovery:** Recovery time objective (RTO) < 4 hours
- **Recovery Point Objective (RPO):** < 1 hour

#### 3.2.4 Scalability Requirements
- **Horizontal Scaling:** Stateless backend design supports load balancing
- **Database Scaling:** Read replicas for reporting queries
- **Caching:** Redis layer recommended for high-traffic scenarios
- **API Rate Limiting:** Implement rate limiting for abuse prevention

#### 3.2.5 Compatibility Requirements
- **Browsers:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Operating Systems:** Windows 10+, macOS 10.15+, Linux (Ubuntu 18.04+)
- **Mobile Responsiveness:** Support for tablet displays (iPad, Android tablets)
- **Database Compatibility:** MySQL 5.7, 8.0

#### 3.2.6 Maintainability Requirements
- **Code Standards:** CommonJS modules (backend), ES6+ modules (frontend)
- **Documentation:** API documentation in markdown, inline code comments
- **Version Control:** Git with meaningful commit messages
- **Dependency Management:** npm with package-lock.json for reproducible builds
- **Linting:** Oxlint for code quality (frontend), ESLint recommended (backend)

#### 3.2.7 Usability Requirements
- **User Interface:** Intuitive admin dashboard with Tailwind CSS design
- **Navigation:** Clear menu structure across all modules
- **Error Messages:** User-friendly error messages
- **Data Entry:** Form validation with helpful tooltips
- **Reporting:** Exportable reports in PDF and Excel formats
- **Accessibility:** WCAG 2.1 AA standards compliance (future requirement)

---

## 4. Data Requirements

### 4.1 Data Entities

#### 4.1.1 Login Table (tbllogin)
```
Columns:
- loginID (PK) - Auto-increment primary key
- username - Unique username
- password - Hashed password (MD5/Bcrypt)
- shopId - Associated shop reference
- userType - User role/type
```

#### 4.1.2 Companies Table
```
Columns:
- companyID (PK) - Auto-increment
- companyName - Company name (required)
- address - Physical address
- contact - Phone number
- email - Email address (email format)
- Status - Active/Inactive/Suspended
- createdAt - Timestamp
- updatedAt - Timestamp
```

#### 4.1.3 Shops Table
```
Columns:
- shopId (PK) - Auto-increment
- shopName - Shop name (required)
- companyId (FK) - Reference to companies table
- contact - Shop contact number
- email - Email address
- integrationType - POS_Integration or Manual_Entry
- lastDocCount - Document count
- Status - Active/Inactive
- createdAt - Timestamp
- updatedAt - Timestamp
```

#### 4.1.4 Properties Table
```
Columns:
- propertyID (PK) - Auto-increment
- PropertyName - Property name (required)
- sqft - Square footage (required)
- locationId - Location identifier (required)
- leased - Yes/No status
- proposedProperty - Boolean flag
- chartColor - Color code for UI display
- createdAt - Timestamp
- updatedAt - Timestamp
```

#### 4.1.5 Agreements Table
```
Columns:
- agreementId (PK) - Auto-increment
- shopId (FK) - Reference to shops table (required)
- companyId (FK) - Reference to companies table (required)
- propertyID (FK) - Reference to properties table (required)
- startDate - Contract start date (required)
- endDate - Contract end date (required)
- minimumSTOLevel - Minimum sales target override amount
- confeeRate - Conference/fee rate percentage
- BankDepositAmount - Deposit required
- agreementStatus - Active/Expired/Terminated
- locationId - Location reference
- stoCurrency - Currency code (e.g., LKR, USD)
- createdAt - Timestamp
- updatedAt - Timestamp
```

#### 4.1.6 Sales Transactions Table
```
Columns (40+ fields):
- dayId (PK) - Auto-increment transaction ID
- shopId (FK) - Associated shop
- companyId (FK) - Associated company
- CONCESSIONAR_NAME - Company name
- shopName - Shop name
- LOCATION - Location ID
- INVOICE_NUMBER - Invoice reference (required)
- TRANSACTION_DATE - Date of transaction (required)
- TRANSACTION_TIME - Time of transaction
- PRODUCT_NAME - Product name
- PRODUCT_CATEGORY - Category
- PRODUCT_SUB_CATEGORY - Sub-category
- BRAND_NAME - Brand
- QUANTITY - Item quantity
- UNIT_PRICE - Price per unit
- TOTAL_AMOUNT_BEFORE_DISCOUNT - Gross amount
- DISCOUNT_AMOUNT - Discount value
- DISCOUNT_TYPE - Discount method (Percentage/Fixed/None)
- TOTAL_AMOUNT_AFTER_DISCOUNT - Net amount (required)
- SALES_TAX_PERCENTAGE - Tax rate
- SALES_TAX - Tax amount
- NET_SALES - Final sales amount (required)
- MINUS_TAX - Amount before tax
- PAYMENT_METHOD - Card/Cash/Cheque
- CURRENCY - Transaction currency
- ACTUAL_PAYMENT_CURRENCY_TYPE - Payment currency type
- TRANSACTION_TYPE - SAL/RET/ADJ
- VOID_CANCELATION_TYPE - NONE/VOID/CANCEL
- FLIGHT - Flight number
- FLIGHT_DATE_TIME - Flight departure datetime
- AIRPORT_ORG - Origin airport code
- AIRPORT_DES - Destination airport code
- PASSENGER_ID_NAME - Passenger name
- NATIONALITY - Passenger nationality
- PASSPORT_ID - Passport number
- NATIONAL_ID - National ID
- BIRTHDATE - Passenger birthdate
- GENDER - M/F
- dbn - Database name (LIVE/TEST)
- tillNo - Till/Cash register number
- is_duplicate - Duplicate flag (0/1)
- createdAt - Timestamp
- updatedAt - Timestamp
```

### 4.2 Data Storage Requirements
- **Database:** MySQL 5.7 or higher
- **Character Set:** UTF8MB4 for international character support
- **Collation:** utf8mb4_unicode_ci
- **Backup:** Daily automated backups
- **Retention:** 7-year transaction history retention

### 4.3 Data Access Patterns
- **Read-Heavy:** Sales reporting generates significant read load
- **Write Operations:** Transaction inserts during business hours
- **Query Optimization:** Indexes on frequently queried fields (dates, shop IDs, company IDs)

---

## 5. External Interface Requirements

### 5.1 User Interfaces

#### 5.1.1 Frontend Application Components
- **Login Page** - Credential authentication
- **Dashboard** - Overview of system status
- **Company Manager** - CRUD operations for companies
- **Shop Manager** - Retail shop management interface
- **Property Manager** - Property and location management
- **Agreement Manager** - Lease contract management
- **Sales Manager** - Transaction entry and editing
- **Sales Report Manager** - Report generation and export

#### 5.1.2 UI Framework & Styling
- **Framework:** React 19.2.7
- **Styling:** Tailwind CSS 4.3.1
- **Build Tool:** Vite 8.1.0 with HMR support
- **Linting:** Oxlint for code quality

### 5.2 API Interfaces

#### 5.2.1 RESTful API Specification
- **Base URL:** `http://localhost:5000` (development)
- **Protocol:** HTTP/HTTPS
- **Data Format:** JSON for request/response bodies
- **Authentication Header:** `Authorization: Bearer <JWT_TOKEN>`

#### 5.2.2 API Response Format
```json
Success Response (200):
{
  "message": "Operation successful!",
  "data": {}
}

Error Response (4xx/5xx):
{
  "message": "Error description"
}
```

#### 5.2.3 HTTP Status Codes
- **200:** OK - Request successful
- **400:** Bad Request - Invalid input parameters
- **401:** Unauthorized - Invalid/expired token or invalid credentials
- **404:** Not Found - Resource not found
- **500:** Internal Server Error - Database or server error

### 5.3 Hardware Interfaces
- **Server Requirements:**
  - CPU: Minimum 2 cores for development, 4+ cores for production
  - RAM: Minimum 2GB for development, 8GB+ for production
  - Storage: Minimum 50GB for database and logs

---

## 6. System Features

### 6.1 Core Features
1. **Multi-User Authentication** - JWT-based secure login
2. **Company Management** - Register and manage parent corporations
3. **Shop Management** - Manage retail tenant shops with multiple integration types
4. **Property Management** - Track terminal properties and spatial allocation
5. **Agreement Management** - Create and monitor lease contracts
6. **Sales Transaction Recording** - Capture transaction data with 40+ fields
7. **Batch Transaction Import** - Support for bulk transaction uploads
8. **Financial Reporting** - Daily, monthly, and custom report generation
9. **Report Export** - PDF and Excel export capabilities
10. **Role-Based Access Control** - Different user types with specific permissions

### 6.2 Advanced Features
- **Transaction Duplicate Detection** - Flag duplicate transactions
- **Multi-Currency Support** - Handle transactions in multiple currencies
- **Airport-Specific Tracking** - Flight and passenger information recording
- **Lease Agreement Analytics** - Monitor minimum STO levels and conference rates

---

## 7. Constraints and Assumptions

### 7.1 Constraints
- **Database:** MySQL-only, no NoSQL alternatives currently supported
- **Authentication:** JWT tokens expire after 1 hour (no refresh token mechanism)
- **Browser Support:** Modern browsers only (IE 11 and below not supported)
- **API Rate Limiting:** Not yet implemented (recommended for production)
- **Timezone:** All timestamps in UTC format

### 7.2 Assumptions
- XAMPP or standalone MySQL is available for local development
- Users have modern browser capabilities
- Admin users are trusted (minimal input validation in password field)
- Network connectivity is stable
- Database backups are managed externally
- SSL/TLS certificates are properly configured for HTTPS

---

## 8. Acceptance Criteria

### 8.1 Functional Acceptance
- [ ] All CRUD operations for companies, shops, properties, agreements function correctly
- [ ] Authentication returns valid JWT tokens with 1-hour expiration
- [ ] Sales transactions can be recorded and retrieved with all 40+ fields
- [ ] Batch transaction import supports arrays of 100+ transactions
- [ ] Reports generate accurate data for specified date/month ranges
- [ ] PDF and Excel exports preserve data formatting and accuracy
- [ ] API responses include appropriate HTTP status codes

### 8.2 Performance Acceptance
- [ ] API endpoints respond within 2 seconds under normal load
- [ ] Database queries execute within 100ms for indexed operations
- [ ] Frontend initial load completes within 3 seconds
- [ ] Support 50+ concurrent users without performance degradation

### 8.3 Security Acceptance
- [ ] Authentication required for all endpoints except login
- [ ] JWT tokens properly validated on all protected endpoints
- [ ] SQL injection prevention verified through parameterized queries
- [ ] CORS properly configured for secure cross-origin access
- [ ] Sensitive data not exposed in error messages

### 8.4 Usability Acceptance
- [ ] All frontend components display correctly on different screen sizes
- [ ] Form validation provides clear error messages
- [ ] Navigation is intuitive and consistent across modules
- [ ] Reports can be exported in both PDF and Excel formats

---

## 9. Testing Requirements

### 9.1 Unit Testing
- Backend route handlers
- Database query functions
- Validation logic

### 9.2 Integration Testing
- End-to-end API workflows
- Database integration
- Frontend-to-backend communication

### 9.3 Performance Testing
- Load testing with 50+ concurrent users
- Database query performance benchmarking
- API response time verification

### 9.4 Security Testing
- JWT token validation
- SQL injection attempts
- CORS policy verification
- Authorization bypass attempts

---

## 10. Deployment Requirements

### 10.1 Development Environment
```bash
# Backend Setup
cd backend
npm install
# Create .env file with:
# PORT=5000
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# JWT_SECRET=your_secret_key
node server.js

# Frontend Setup
cd frontend
npm install
npm run dev
```

### 10.2 Production Environment
- Use production-grade MySQL server
- Implement proper SSL/TLS certificates
- Configure environment variables securely
- Implement database connection pooling
- Enable CORS for production domain only
- Implement rate limiting middleware
- Set up logging and monitoring

### 10.3 Database Setup
```sql
CREATE DATABASE dbdutyfreepos;
USE dbdutyfreepos;
-- Import schema from provided SQL backup file
```

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| APMS | Airport Property Management System |
| JWT | JSON Web Token - Stateless authentication mechanism |
| CORS | Cross-Origin Resource Sharing - Security policy |
| POS | Point of Sale system integration |
| STO | Minimum Sales Target Override - Lease agreement minimum |
| Conference Rate | Fee rate percentage in lease agreements |
| DBN | Database Name identifier (LIVE/TEST) |
| Till Number | Cash register identifier |
| Concessionaire | Retail operator/company holding lease |
| RESTful API | Representational State Transfer API architecture |

---

## 12. References and Notes

- **API Documentation:** See API_DOCUMENTATION.md for detailed endpoint specifications
- **Database Schema:** SQL backup file provided separately
- **Frontend Components:** React component files in frontend/src/
- **Backend Routes:** Express route handlers in backend/routes/
- **Environment Configuration:** .env file setup required before deployment

---

**End of Software Requirements Specification**

Document prepared for: SEW1023/Airport  
Version: 1.0 | Date: July 16, 2026  
Status: ✅ Active and Ready for Development/Implementation
