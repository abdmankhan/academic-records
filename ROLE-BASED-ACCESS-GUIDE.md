# Role-Based Access Control Guide

This document explains the role-based access control system implemented in the Academic Certificates Platform.

## Overview

The platform supports three main actor roles:

1. **University** - Can issue and manage academic certificates
2. **Student** - Can view their own certificates
3. **Verifier** (Companies/Government) - Can verify certificate authenticity

## Role Permissions

### University Role
- ✅ **Issue Certificates**: Create new academic certificates
- ✅ **Update Certificates**: Modify existing certificates
- ✅ **Delete Certificates**: Remove certificates (if needed)
- ✅ **View All Certificates**: Browse all certificates in the system
- ✅ **Verify Certificates**: Verify certificate authenticity
- ✅ **View Certificate History**: Access full audit trail

### Student Role
- ✅ **View Own Certificates**: Access only certificates issued to them
- ✅ **Query Certificate Details**: View details of their certificates
- ✅ **View Certificate History**: See history of their certificates
- ❌ **Cannot Issue**: Students cannot create certificates
- ❌ **Cannot Verify**: Students cannot verify certificates
- ❌ **Cannot Update/Delete**: Students cannot modify certificates

### Verifier Role (Companies/Government)
- ✅ **Verify Certificates**: Verify authenticity of any certificate
- ✅ **View All Certificates**: Browse all certificates for verification
- ✅ **View Certificate Details**: Access full certificate information
- ❌ **Cannot Issue**: Verifiers cannot create certificates
- ❌ **Cannot Update/Delete**: Verifiers cannot modify certificates

### Admin Role
- ✅ **Full Access**: All permissions across all roles

## Default User Accounts

The system comes with pre-configured user accounts for testing:

| Username | Password | Role | Description |
|----------|----------|------|-------------|
| `university` | `universitypw` | University | Can issue certificates |
| `student` | `studentpw` | Student | Can view own certificates |
| `verifier` | `verifierpw` | Verifier | Can verify certificates |
| `admin` | `adminpw` | Admin | Full access |

## Implementation Details

### Backend (API Level)

Role-based access is enforced at multiple levels:

1. **Route Protection** (`backend/routes/certificateRoutes.js`):
   - Uses `requireRole()` middleware to restrict access
   - Universities can create/update/delete
   - Verifiers can verify
   - All authenticated users can query (filtered by role)

2. **User Controller** (`backend/controllers/userController.js`):
   - Supports role-based user registration
   - JWT tokens include role information
   - Default users initialized on startup

3. **Role Middleware** (`backend/middleware/roleAuth.js`):
   - `requireRole(...roles)`: Restricts to specific roles
   - `requireAuth`: Requires authentication (any role)

### Chaincode (Blockchain Level)

Role-based access is enforced in the smart contract:

1. **Role Detection** (`fabric-network/chaincode/certificate/index.js`):
   - Extracts role from transient data or MSP ID
   - Org1MSP → University
   - Org2MSP → Student
   - Org3MSP → Verifier

2. **Function-Level Protection**:
   - `createCertificate`: Only universities
   - `updateCertificate`: Only universities
   - `deleteCertificate`: Only universities
   - `verifyCertificate`: Verifiers and universities
   - `queryCertificate`: Students see only their own
   - `queryAllCertificates`: Filtered by role

### Frontend (UI Level)

Role-based UI is implemented in React:

1. **Navigation** (`frontend/src/components/Navbar.js`):
   - Universities see "Issue Certificate"
   - Students see "My Certificates"
   - Verifiers see "Verify Certificate"
   - Role badge displayed in navbar

2. **Route Protection** (`frontend/src/components/ProtectedRoute.js`):
   - Protects routes based on required role
   - Redirects unauthorized users
   - Shows access denied message

3. **Page-Level Protection**:
   - Create Certificate: University only
   - Verify Certificate: Verifier/University
   - Certificates: All authenticated (filtered by backend)

## Usage Examples

### University Workflow

1. Login as `university` / `universitypw`
2. Navigate to "Issue Certificate"
3. Fill in student details:
   - Certificate ID (auto-generated if empty)
   - Student ID
   - Student Name
   - Course
   - Grade
   - Issue Date
4. Submit to create certificate on blockchain

### Student Workflow

1. Login as `student` / `studentpw`
2. Navigate to "My Certificates"
3. View all certificates issued to you
4. Click on a certificate to view details
5. View certificate history for audit trail

### Verifier Workflow

1. Login as `verifier` / `verifierpw`
2. Navigate to "Verify Certificate"
3. Enter certificate ID
4. View verification result with:
   - Certificate validity
   - Full certificate details
   - Verification timestamp
   - Verifier information

## API Endpoints

### Public Endpoints
- `POST /api/users/register` - Register new user (specify role)
- `POST /api/users/login` - Login (returns role in token)

### Protected Endpoints

#### Certificate Management (University Only)
- `POST /api/certificates` - Create certificate (requires university role)
- `PUT /api/certificates/:id` - Update certificate (requires university role)
- `DELETE /api/certificates/:id` - Delete certificate (requires university role)

#### Certificate Query (All Authenticated)
- `GET /api/certificates` - Get all certificates (filtered by role)
- `GET /api/certificates/:id` - Get certificate by ID (students see only their own)
- `GET /api/certificates/student/:studentId` - Get certificates by student ID
- `GET /api/certificates/:id/history` - Get certificate history

#### Verification (Verifier/University)
- `POST /api/certificates/:id/verify` - Verify certificate (requires verifier/university role)

## Security Considerations

1. **JWT Tokens**: Include role information, expire after 24 hours
2. **Chaincode Validation**: Role checked at blockchain level
3. **API Middleware**: Role checked before processing requests
4. **Frontend Protection**: UI elements hidden based on role
5. **Student Data Isolation**: Students can only see their own certificates

## Testing Role-Based Access

### Test University Access
```bash
# Login as university
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"university","password":"universitypw"}'

# Use token to create certificate
curl -X POST http://localhost:5000/api/certificates \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "CERT-TEST-001",
    "studentId": "STU001",
    "studentName": "Test Student",
    "course": "Test Course",
    "grade": "A",
    "issuedAt": "2025-01-15T00:00:00Z"
  }'
```

### Test Student Access
```bash
# Login as student
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student","password":"studentpw"}'

# Query certificates (will only see own)
curl -X GET http://localhost:5000/api/certificates \
  -H "Authorization: Bearer <token>"
```

### Test Verifier Access
```bash
# Login as verifier
curl -X POST http://localhost:5000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"verifier","password":"verifierpw"}'

# Verify certificate
curl -X POST http://localhost:5000/api/certificates/CERT-TEST-001/verify \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

## Network Organization Mapping

The Hyperledger Fabric network uses three organizations:

- **Org1 (Org1MSP)**: Represents Universities
- **Org2 (Org2MSP)**: Represents Student Registry
- **Org3 (Org3MSP)**: Represents Verification Authority

When transactions are submitted through different organization peers, the chaincode automatically detects the role based on the MSP ID.

## Future Enhancements

Potential improvements:
1. Fine-grained permissions (e.g., read-only university users)
2. Role-based certificate fields (e.g., sensitive data only for universities)
3. Multi-role users (e.g., university admin who can also verify)
4. Certificate sharing permissions
5. Audit logs with role information





