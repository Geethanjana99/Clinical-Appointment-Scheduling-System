# LOGIN TEST CREDENTIALS

## Test Users for Login Testing

### Patient Account
- **Email:** patient@test.com
- **Password:** password123
- **Role:** Patient

### Doctor Account  
- **Email:** doctor@test.com
- **Password:** password123
- **Role:** Doctor

### Admin Account
- **Email:** admin@test.com  
- **Password:** password123
- **Role:** Admin

### Billing Account
- **Email:** billing@test.com
- **Password:** password123  
- **Role:** Billing

## API Endpoints

- **Backend URL:** http://localhost:5000
- **Frontend URL:** http://localhost:5173
- **API Base:** http://localhost:5000/api

## Authentication Endpoints

- **Login:** POST /api/auth/login
- **Register:** POST /api/auth/register
- **Profile:** GET /api/auth/profile
- **Logout:** POST /api/auth/logout

## Features Tested

✅ **Backend Integration Complete:**
- MySQL database connection
- User registration with automatic patient profile creation
- User authentication with JWT tokens
- Role-based access control
- Doctor registration with profile data

✅ **Frontend Integration Complete:**
- Real API service layer
- Authentication store with real backend calls
- Login form connected to backend
- Registration form with role-specific fields
- Automatic token management
- Protected routes based on user roles

## Testing Instructions

1. **Start Backend:** `cd backend && npm start`
2. **Start Frontend:** `cd Clinical-Appointment-Scheduling-System && npm run dev`
3. **Test Registration:** Create new accounts via /register
4. **Test Login:** Use created accounts via /login
5. **Test Navigation:** Verify role-based dashboard redirection

## Database Integration

- **Patient Registration:** Automatically creates patient profile
- **Doctor Registration:** Creates doctor profile with specialization data
- **Authentication:** JWT tokens with 7-day expiry
- **Profile Data:** Stored in MySQL with relational structure
