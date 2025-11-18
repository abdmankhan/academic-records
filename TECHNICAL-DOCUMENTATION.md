# 📚 Academic Certificates Platform
## Complete Technical Documentation & User Guide

**Version:** 1.0  
**Date:** November 2025  
**Platform:** Hyperledger Fabric 2.4.9 + React + Node.js

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [System Architecture](#system-architecture)
4. [Hyperledger Fabric Integration](#hyperledger-fabric-integration)
5. [Codebase Structure & Flow](#codebase-structure--flow)
6. [User Guide](#user-guide)
7. [Technical Implementation](#technical-implementation)
8. [Blockchain Workflow](#blockchain-workflow)
9. [Setup & Deployment](#setup--deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Executive Summary

### What is This Project?

The **Academic Certificates Platform** is a blockchain-powered system that enables universities to issue tamper-proof academic certificates, students to access their certificates, and employers/government organizations to verify certificate authenticity in real-time.

### Key Features

✅ **Immutable Certificate Storage** - Certificates stored on Hyperledger Fabric blockchain  
✅ **Multi-Organization Network** - 3 organizations with 2 peers each  
✅ **Real-Time Verification** - Instant certificate authenticity checks  
✅ **Role-Based Access Control** - University, Student, and Verifier roles  
✅ **Complete Audit Trail** - Full transaction history  
✅ **Modern Web Interface** - Responsive React frontend  

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Blockchain** | Hyperledger Fabric 2.4.9 |
| **Backend** | Node.js + Express.js |
| **Frontend** | React 18 + Bootstrap 5 |
| **Database** | CouchDB (State Database) |
| **Containerization** | Docker + Docker Compose |
| **Authentication** | JWT (JSON Web Tokens) |

---

## 📖 Project Overview

### Problem Statement

Traditional academic certificates face several challenges:
- ❌ Easy to forge or tamper with
- ❌ Difficult to verify authenticity
- ❌ No centralized verification system
- ❌ Time-consuming manual verification process
- ❌ Risk of certificate loss or damage

### Solution

Our platform uses **blockchain technology** to solve these problems:
- ✅ **Immutable Records** - Once stored, certificates cannot be altered
- ✅ **Instant Verification** - Real-time authenticity checks
- ✅ **Decentralized Storage** - No single point of failure
- ✅ **Transparent Audit Trail** - Complete transaction history
- ✅ **Secure Access** - Role-based permissions

### Use Cases

1. **University** - Issue academic certificates to students
2. **Student** - View and share their certificates
3. **Employer/Government** - Verify certificate authenticity

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   University  │  │   Student    │  │   Verifier   │         │
│  │   (Browser)  │  │   (Browser) │  │   (Browser)  │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
└─────────┼─────────────────┼─────────────────┼─────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │      FRONTEND (React)             │
          │   Port: 3000                      │
          │   - UI Components                 │
          │   - State Management              │
          │   - API Calls                    │
          └─────────────────┬─────────────────┘
                            │ HTTP/REST
          ┌─────────────────▼─────────────────┐
          │      BACKEND (Node.js/Express)    │
          │   Port: 5000                      │
          │   - RESTful API                   │
          │   - JWT Authentication            │
          │   - Business Logic                │
          │   - Fabric Client Integration     │
          └─────────────────┬─────────────────┘
                            │
          ┌─────────────────▼─────────────────┐
          │   HYPERLEDGER FABRIC NETWORK      │
          │                                   │
          │  ┌──────────┐  ┌──────────┐      │
          │  │ Orderer  │  │ Channel  │      │
          │  │  :7050   │  │certificate│     │
          │  └────┬─────┘  └────┬─────┘      │
          │       │             │            │
          │  ┌────▼─────────────▼────┐      │
          │  │   Chaincode (Smart     │      │
          │  │    Contract)           │      │
          │  │   - createCertificate  │      │
          │  │   - queryCertificate   │      │
          │  │   - verifyCertificate  │      │
          │  └────┬───────────────────┘      │
          │       │                          │
          │  ┌────▼─────┐  ┌────▼─────┐     │
          │  │ Org1     │  │ Org2     │     │
          │  │ Peer0    │  │ Peer0    │     │
          │  │ Peer1    │  │ Peer1    │     │
          │  └────┬─────┘  └────┬─────┘     │
          │       │             │            │
          │  ┌────▼─────┐  ┌────▼─────┐     │
          │  │ CouchDB  │  │ CouchDB  │     │
          │  │  State   │  │  State   │     │
          │  │ Database │  │ Database │     │
          │  └──────────┘  └──────────┘     │
          └──────────────────────────────────┘
```

### Three-Tier Architecture

#### 1. **Presentation Layer (Frontend)**
- **Technology:** React 18 with React Router
- **Location:** `/frontend/`
- **Purpose:** User interface for all actors
- **Key Components:**
  - Login/Authentication
  - Certificate Creation (University)
  - Certificate Browsing (All users)
  - Certificate Verification (Verifiers)
  - Blockchain Explorer

#### 2. **Application Layer (Backend)**
- **Technology:** Node.js + Express.js
- **Location:** `/backend/`
- **Purpose:** Business logic and API endpoints
- **Key Components:**
  - RESTful API (`/api/certificates`, `/api/users`)
  - JWT Authentication
  - Fabric Client Integration
  - Role-Based Access Control

#### 3. **Blockchain Layer (Hyperledger Fabric)**
- **Technology:** Hyperledger Fabric 2.4.9
- **Location:** `/fabric-network/`
- **Purpose:** Immutable certificate storage
- **Key Components:**
  - Chaincode (Smart Contract)
  - Peer Network (3 orgs, 2 peers each)
  - Orderer (Consensus)
  - CouchDB (State Database)

---

## ⛓️ Hyperledger Fabric Integration

### What is Hyperledger Fabric?

Hyperledger Fabric is an **enterprise-grade permissioned blockchain platform** that provides:
- **Privacy** - Only authorized participants can see transactions
- **Scalability** - High transaction throughput
- **Flexibility** - Customizable consensus mechanisms
- **Modularity** - Pluggable components

### Network Topology

```
                    ┌─────────────────┐
                    │   Orderer Node   │
                    │  (Consensus)     │
                    │   Port: 7050     │
                    └────────┬─────────┘
                             │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────┐
        │  Org1 (Univ) │ │ Org2     │ │ Org3     │
        │              │ │          │ │          │
        │  ┌────────┐  │ │ ┌──────┐ │ │ ┌──────┐ │
        │  │ Peer0  │  │ │ │Peer0 │ │ │ │Peer0 │ │
        │  │ :7051  │  │ │ │:9051 │ │ │ │:11051│ │
        │  └───┬────┘  │ │ └──┬───┘ │ │ └──┬───┘ │
        │      │       │ │    │     │ │    │     │
        │  ┌───▼────┐  │ │ ┌──▼───┐ │ │ ┌──▼───┐ │
        │  │ Peer1  │  │ │ │Peer1 │ │ │ │Peer1 │ │
        │  │ :8051  │  │ │ │:10051│ │ │ │:12051│ │
        │  └───┬────┘  │ │ └──┬───┘ │ │ └──┬───┘ │
        │      │       │ │    │     │ │    │     │
        │  ┌───▼────┐  │ │ ┌──▼───┐ │ │ ┌──▼───┐ │
        │  │CouchDB │  │ │ │Couch │ │ │ │Couch │ │
        │  │ :5984  │  │ │ │:6984 │ │ │ │:8984 │ │
        │  └────────┘  │ │ └──────┘ │ │ └──────┘ │
        │              │ │          │ │          │
        │  ┌────────┐  │ │ ┌──────┐ │ │ ┌──────┐ │
        │  │ CA     │  │ │ │ CA   │ │ │ │ CA   │ │
        │  │ :7054  │  │ │ │:8054 │ │ │ │:10054│ │
        │  └────────┘  │ │ └──────┘ │ │ └──────┘ │
        └──────────────┘ └──────────┘ └──────────┘
```

### Network Components

#### 1. **Orderer**
- **Role:** Consensus service, orders transactions
- **Type:** Solo (development mode)
- **Port:** 7050
- **Function:** Creates blocks and distributes to peers

#### 2. **Organizations (3 Orgs)**
- **Org1:** University (Issues certificates)
- **Org2:** Student Registry (Manages student data)
- **Org3:** Verification Authority (Verifies certificates)

Each organization has:
- **2 Peers** - Store ledger and execute chaincode
- **1 CA** - Certificate Authority for identity management
- **1 CouchDB** - State database for rich queries

#### 3. **Channel**
- **Name:** `certificatechannel`
- **Purpose:** Private communication channel
- **Members:** All 3 organizations
- **Chaincode:** `certificate` (smart contract)

#### 4. **Chaincode (Smart Contract)**
- **Location:** `/fabric-network/chaincode/certificate/`
- **Language:** Node.js
- **Functions:**
  ```javascript
  - createCertificate()    // Issue new certificate
  - queryCertificate()    // Get certificate by ID
  - queryAllCertificates() // Get all certificates
  - updateCertificate()   // Update certificate (university only)
  - deleteCertificate()   // Delete certificate (admin only)
  - verifyCertificate()   // Verify authenticity
  ```

### How Fabric Ensures Immutability

1. **Cryptographic Hashing**
   - Each block contains hash of previous block
   - Any change breaks the chain

2. **Distributed Ledger**
   - Multiple copies across peers
   - Consensus required for changes

3. **Endorsement Policy**
   - Requires 2 out of 3 organizations to endorse
   - Prevents single point of failure

4. **State Database**
   - CouchDB stores current state
   - Ledger stores all history

---

## 📁 Codebase Structure & Flow

### Project Directory Structure

```
academic-certificates-platform/
│
├── 📂 frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   │   ├── Navbar.js         # Navigation bar
│   │   │   ├── Footer.js         # Footer component
│   │   │   ├── ProtectedRoute.js # Route protection
│   │   │   └── BlockchainInfo.js # Blockchain status
│   │   │
│   │   ├── pages/                 # Page components
│   │   │   ├── Home.js           # Landing page
│   │   │   ├── Login.js          # Login page
│   │   │   ├── Certificates.js   # Browse certificates
│   │   │   ├── CreateCertificate.js # Issue certificate
│   │   │   ├── VerifyCertificate.js # Verify certificate
│   │   │   └── BlockchainExplorer.js # Blockchain info
│   │   │
│   │   ├── context/               # React Context
│   │   │   └── AuthContext.js    # Authentication state
│   │   │
│   │   ├── services/              # API services
│   │   │   └── api.js            # HTTP client
│   │   │
│   │   ├── App.js                # Main app component
│   │   └── index.js              # Entry point
│   │
│   └── package.json
│
├── 📂 backend/                     # Node.js Backend API
│   ├── controllers/               # Request handlers
│   │   ├── certificateController.js # Certificate CRUD
│   │   └── userController.js     # User management
│   │
│   ├── routes/                     # Express routes
│   │   ├── certificateRoutes.js  # Certificate endpoints
│   │   └── userRoutes.js         # User endpoints
│   │
│   ├── middleware/                 # Express middleware
│   │   ├── auth.js               # JWT authentication
│   │   └── roleAuth.js           # Role-based access
│   │
│   ├── fabric-client/              # Fabric integration
│   │   ├── fabricClientIntegrated.js # Main client
│   │   └── simpleFabricClient.js  # Docker exec client
│   │
│   ├── services/                   # Business logic
│   │   └── certificateService.js # Certificate operations
│   │
│   ├── server.js                  # Express server
│   └── package.json
│
├── 📂 fabric-network/              # Hyperledger Fabric Network
│   ├── chaincode/                  # Smart contracts
│   │   └── certificate/
│   │       ├── index.js          # Chaincode implementation
│   │       └── package.json
│   │
│   ├── config/                     # Network configuration
│   │   ├── configtx.yaml         # Channel config
│   │   └── genesis.block          # Genesis block
│   │
│   ├── crypto-config/              # Cryptographic material
│   │   ├── ordererOrganizations/  # Orderer certs
│   │   └── peerOrganizations/    # Peer certs (3 orgs)
│   │
│   ├── scripts/                    # Network scripts
│   │   ├── startNetwork.sh       # Start network
│   │   ├── createChannel.sh      # Create channel
│   │   └── deployChaincode.sh    # Deploy chaincode
│   │
│   └── docker-compose.yaml        # Container definitions
│
├── 📂 fabric-samples/              # Fabric binaries & samples
│
├── setup.sh                        # Complete setup script
├── quick-start.sh                  # Quick start script
└── README.md                       # Project README
```

### Data Flow: Certificate Creation

```
┌─────────────┐
│  University │
│   (User)    │
└──────┬──────┘
       │
       │ 1. Fill form & submit
       ▼
┌─────────────────────────────────┐
│   React Frontend                │
│   CreateCertificate.js           │
│   - Form validation             │
│   - API call to backend         │
└──────┬──────────────────────────┘
       │
       │ 2. POST /api/certificates
       │    Authorization: Bearer <JWT>
       ▼
┌─────────────────────────────────┐
│   Express Backend               │
│   certificateController.js      │
│   - Validate request            │
│   - Check user role             │
│   - Call Fabric client          │
└──────┬──────────────────────────┘
       │
       │ 3. createCertificate()
       ▼
┌─────────────────────────────────┐
│   Fabric Client                 │
│   simpleFabricClient.js         │
│   - Build chaincode command     │
│   - Execute via Docker exec     │
└──────┬──────────────────────────┘
       │
       │ 4. peer chaincode invoke
       │    --peerAddresses org1,org2
       ▼
┌─────────────────────────────────┐
│   Hyperledger Fabric Network    │
│                                 │
│   ┌──────────┐  ┌──────────┐   │
│   │ Org1     │  │ Org2     │   │
│   │ Peer0    │  │ Peer0    │   │
│   │ (Endorse)│  │ (Endorse)│   │
│   └────┬─────┘  └────┬─────┘   │
│        │             │          │
│        └──────┬──────┘          │
│               │                 │
│        ┌──────▼──────┐          │
│        │  Orderer    │          │
│        │ (Consensus) │          │
│        └──────┬──────┘          │
│               │                 │
│        ┌──────▼──────┐          │
│        │  Chaincode  │          │
│        │ createCert()│          │
│        │ - putState()│          │
│        └──────┬──────┘          │
│               │                 │
│        ┌──────▼──────┐          │
│        │  CouchDB    │          │
│        │ (State DB)  │          │
│        └─────────────┘          │
└─────────────────────────────────┘
       │
       │ 5. Success response
       ▼
┌─────────────────────────────────┐
│   Backend returns certificate  │
│   Frontend shows success       │
│   Certificate appears in list   │
└─────────────────────────────────┘
```

### Data Flow: Certificate Verification

```
┌─────────────┐
│  Verifier   │
│   (User)    │
└──────┬──────┘
       │
       │ 1. Enter certificate ID
       ▼
┌─────────────────────────────────┐
│   React Frontend                │
│   VerifyCertificate.js          │
│   - API call to backend         │
└──────┬──────────────────────────┘
       │
       │ 2. GET /api/certificates/{id}
       ▼
┌─────────────────────────────────┐
│   Express Backend               │
│   certificateController.js      │
│   - Call Fabric client          │
└──────┬──────────────────────────┘
       │
       │ 3. queryCertificate(id)
       ▼
┌─────────────────────────────────┐
│   Fabric Client                 │
│   - Execute chaincode query     │
└──────┬──────────────────────────┘
       │
       │ 4. peer chaincode query
       ▼
┌─────────────────────────────────┐
│   Hyperledger Fabric Network    │
│                                 │
│   ┌──────────┐                  │
│   │ Org1     │                  │
│   │ Peer0    │                  │
│   │ (Query)  │                  │
│   └────┬─────┘                  │
│        │                        │
│   ┌────▼─────┐                  │
│   │ Chaincode│                  │
│   │ queryCert│                  │
│   │ -getState│                  │
│   └────┬─────┘                  │
│        │                        │
│   ┌────▼─────┐                  │
│   │ CouchDB  │                  │
│   │ (Read)   │                  │
│   └──────────┘                  │
└─────────────────────────────────┘
       │
       │ 5. Certificate data
       ▼
┌─────────────────────────────────┐
│   Backend returns certificate   │
│   Frontend displays:            │
│   - Certificate details         │
│   - Verification status         │
│   - Blockchain proof           │
└─────────────────────────────────┘
```

### Key Files Explained

#### Frontend: `App.js`
```javascript
// Main routing configuration
- / → Home page
- /login → Login page
- /certificates → Browse certificates (protected)
- /create → Create certificate (university only)
- /verify → Verify certificate (public)
- /blockchain → Blockchain explorer (public)
```

#### Backend: `server.js`
```javascript
// Express server setup
- Initializes Fabric client
- Sets up middleware (CORS, JSON parsing, auth)
- Registers routes
- Starts HTTP server on port 5000
```

#### Backend: `simpleFabricClient.js`
```javascript
// Fabric interaction layer
- createCertificate() → Invokes chaincode
- getAllCertificates() → Queries chaincode
- getCertificate() → Queries single certificate
- Uses Docker exec to run peer commands
```

#### Chaincode: `index.js`
```javascript
// Smart contract implementation
- createCertificate() → Stores certificate on ledger
- queryCertificate() → Retrieves certificate
- queryAllCertificates() → Gets all certificates
- verifyCertificate() → Verifies authenticity
- Role-based access control
```

---

## 👥 User Guide

### User Roles

#### 1. **University** 🎓
- **Can:** Issue certificates, view all certificates, verify certificates
- **Cannot:** Delete certificates (admin only)
- **Login:** `university` / `universitypw`

#### 2. **Student** 🎒
- **Can:** View own certificates, verify certificates
- **Cannot:** Issue or modify certificates
- **Login:** `student` / `studentpw`

#### 3. **Verifier** (Employer/Government) 🏢
- **Can:** Verify certificates, view public certificate info
- **Cannot:** Issue or modify certificates
- **Login:** `verifier` / `verifierpw`

#### 4. **Admin** 👑
- **Can:** All operations (issue, view, verify, delete)
- **Login:** `admin` / `adminpw`

### Step-by-Step User Guide

#### For University: Issuing a Certificate

1. **Login**
   - Go to http://localhost:3000/login
   - Enter username: `university`
   - Enter password: `universitypw`
   - Click "Login"

2. **Navigate to Create Certificate**
   - Click "Issue Certificate" in navbar
   - Or go to http://localhost:3000/create

3. **Fill Certificate Form**
   ```
   Student ID: 23MCF1R02
   Student Name: Khan Abdul Mannan
   Course: MCA
   Grade: A
   Issue Date: 2025-01-15
   ```

4. **Submit**
   - Click "Issue Certificate"
   - Wait for blockchain confirmation
   - Success message appears
   - Certificate is now on blockchain!

5. **View Certificate**
   - Go to "Browse Certificates"
   - Search for the certificate
   - Click to view details

#### For Student: Viewing Certificates

1. **Login**
   - Username: `student`
   - Password: `studentpw`

2. **View My Certificates**
   - Click "My Certificates" in navbar
   - See all certificates issued to you
   - Click any certificate for details

3. **Share Certificate**
   - Copy certificate ID
   - Share with employer/verifier
   - They can verify using the ID

#### For Verifier: Verifying a Certificate

1. **Login (Optional)**
   - Can verify without login
   - Or login as `verifier` / `verifierpw`

2. **Go to Verify Page**
   - Click "Verify Certificate" in navbar
   - Or go to http://localhost:3000/verify

3. **Enter Certificate ID**
   - Enter the certificate ID provided by student
   - Click "Verify"

4. **View Results**
   - ✅ **Valid:** Certificate exists on blockchain
   - ❌ **Invalid:** Certificate not found or tampered
   - Certificate details displayed
   - Blockchain proof shown

#### Blockchain Explorer

1. **Access Explorer**
   - Go to http://localhost:3000/blockchain
   - Or click "Blockchain Explorer" in navbar

2. **View Information**
   - Current block height
   - Latest block hash
   - Network status
   - Real-time blockchain metrics

---

## 🔧 Technical Implementation

### Authentication Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. POST /api/users/login
     │    { username, password }
     ▼
┌─────────────────────┐
│  Backend            │
│  userController.js  │
│  - Validate creds   │
│  - Generate JWT     │
└────┬────────────────┘
     │
     │ 2. Return JWT token
     ▼
┌─────────────────────┐
│  Frontend           │
│  AuthContext.js     │
│  - Store token      │
│  - Set user state   │
└────┬────────────────┘
     │
     │ 3. Include in headers
     │    Authorization: Bearer <token>
     ▼
┌─────────────────────┐
│  Protected Routes   │
│  - Verify JWT       │
│  - Check role       │
│  - Allow/Deny       │
└─────────────────────┘
```

### Role-Based Access Control (RBAC)

#### Frontend Protection
```javascript
// ProtectedRoute.js
- Checks if user is authenticated
- Verifies user role matches required role
- Redirects to login if unauthorized
```

#### Backend Protection
```javascript
// middleware/roleAuth.js
- Verifies JWT token
- Extracts user role from token
- Checks if role is allowed
- Returns 403 if unauthorized
```

#### Chaincode Protection
```javascript
// chaincode/index.js
- getCallerRole() extracts role
- Checks role before operations
- Throws error if unauthorized
```

### Certificate Data Structure

```json
{
  "id": "CERT_MI25OV7C_IKH3X",
  "studentId": "23MCF1R02",
  "studentName": "Khan Abdul Mannan",
  "course": "MCA",
  "grade": "A",
  "issuedAt": "2025-01-15T00:00:00.000Z",
  "createdAt": "2025-11-16T20:21:23.000Z",
  "lastModified": "2025-11-16T20:21:23.000Z",
  "issuedBy": "x509::/C=US/ST=California/...",
  "issuerRole": "university",
  "verified": false,
  "verifiedAt": null,
  "verifiedBy": null
}
```

### API Endpoints

#### Authentication
```
POST   /api/users/register    Register new user
POST   /api/users/login       Login (get JWT)
```

#### Certificates
```
GET    /api/certificates              Get all certificates
GET    /api/certificates/:id          Get certificate by ID
POST   /api/certificates              Create certificate (university)
PUT    /api/certificates/:id          Update certificate (university)
DELETE /api/certificates/:id          Delete certificate (admin)
POST   /api/certificates/:id/verify   Verify certificate
GET    /api/certificates/student/:id  Get student's certificates
```

### Environment Variables

#### Backend (`.env`)
```bash
PORT=5000
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
USE_BLOCKCHAIN=true
```

#### Frontend
- No environment variables needed
- API URL: `http://localhost:5000`

---

## ⛓️ Blockchain Workflow

### Transaction Lifecycle

```
1. CLIENT REQUEST
   ↓
   User submits certificate creation form
   
2. BACKEND PROCESSING
   ↓
   Backend validates request and prepares transaction
   
3. ENDORSEMENT PHASE
   ↓
   ┌──────────┐  ┌──────────┐
   │ Org1     │  │ Org2     │
   │ Peer0    │  │ Peer0    │
   │ (Endorse)│  │ (Endorse)│
   └────┬─────┘  └────┬─────┘
        │             │
        └──────┬──────┘
               │
        Both peers execute chaincode
        Both return signed endorsements
   
4. SUBMISSION TO ORDERER
   ↓
   Backend sends endorsed transaction to orderer
   
5. ORDERING PHASE
   ↓
   Orderer creates block with transaction
   Orders transactions chronologically
   
6. DISTRIBUTION
   ↓
   Orderer sends block to all peers
   
7. VALIDATION PHASE
   ↓
   Each peer validates:
   - Endorsement policy satisfied
   - Transaction not duplicate
   - Read/write sets valid
   
8. COMMIT PHASE
   ↓
   ┌──────────┐  ┌──────────┐  ┌──────────┐
   │ Org1     │  │ Org2     │  │ Org3     │
   │ Peer0    │  │ Peer0    │  │ Peer0    │
   │ (Commit) │  │ (Commit) │  │ (Commit) │
   └────┬─────┘  └────┬─────┘  └────┬─────┘
        │             │             │
        └──────┬──────┴──────┬──────┘
               │             │
        ┌──────▼─────────────▼──────┐
        │   Update State Database   │
        │   (CouchDB)               │
        └───────────────────────────┘
   
9. CONFIRMATION
   ↓
   Transaction committed to ledger
   Certificate now immutable
```

### Why Endorsement Policy Matters

**Endorsement Policy:** Requires 2 out of 3 organizations to endorse

**Why?**
- Prevents single organization from creating fake certificates
- Ensures consensus before committing
- Provides redundancy and trust

**How it works:**
1. Backend invokes chaincode with 2 peers (Org1 + Org2)
2. Both peers execute and sign
3. Orderer validates both signatures
4. Transaction committed only if policy satisfied

### Deterministic Execution

**Critical Requirement:** Chaincode must be deterministic

**Why?**
- All peers must produce same result
- Non-deterministic code causes endorsement failures

**Solution:**
```javascript
// ❌ WRONG (Non-deterministic)
certificate.createdAt = new Date().toISOString();

// ✅ CORRECT (Deterministic)
const txTimestamp = ctx.stub.getTxTimestamp();
const txDate = new Date(txTimestamp.seconds.toNumber() * 1000);
certificate.createdAt = txDate.toISOString();
```

---

## 🚀 Setup & Deployment

### Prerequisites

```bash
# Check Docker
docker --version          # Should be 20.10+
docker-compose --version  # Should be 1.29+

# Check Node.js
node --version            # Should be 16+
npm --version             # Should be 8+

# Check Git
git --version
```

### Complete Setup

#### Option 1: Automated Setup (Recommended)

```bash
# Clone repository
cd /home/abdmankhan/academic-certificates-platform

# Run setup script
chmod +x setup.sh
./setup.sh
```

This script will:
1. ✅ Download Fabric binaries (if needed)
2. 🔐 Generate crypto material
3. 🌐 Start Fabric network
4. 📋 Create channel
5. 📦 Deploy chaincode
6. 📥 Install dependencies

#### Option 2: Manual Setup

**Step 1: Start Fabric Network**
```bash
cd fabric-network
docker-compose up -d
```

**Step 2: Create Channel**
```bash
./scripts/createChannel.sh
```

**Step 3: Deploy Chaincode**
```bash
./scripts/deployChaincode.sh
```

**Step 4: Install Backend Dependencies**
```bash
cd ../backend
npm install
```

**Step 5: Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

### Starting the Application

#### Terminal 1: Backend
```bash
cd backend
npm start
# Server running on http://localhost:5000
```

#### Terminal 2: Frontend
```bash
cd frontend
npm start
# App running on http://localhost:3000
```

#### Terminal 3: Monitor Network (Optional)
```bash
# Watch Docker containers
watch -n 2 'docker ps'

# Watch logs
docker logs -f peer0.org1.example.com
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:5000 | REST API |
| **API Health** | http://localhost:5000/api/health | Health check |
| **CouchDB Org1** | http://localhost:5984 | State database |
| **CouchDB Org2** | http://localhost:6984 | State database |

### Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `adminpw` |
| University | `university` | `universitypw` |
| Student | `student` | `studentpw` |
| Verifier | `verifier` | `verifierpw` |

---

## 🔍 Troubleshooting

### Common Issues

#### 1. Docker Containers Not Starting

**Symptoms:**
- `docker ps` shows containers as "Created" but not "Up"
- Port conflicts

**Solution:**
```bash
# Check port conflicts
sudo netstat -tulpn | grep :7050

# Stop all containers
docker-compose down

# Remove volumes
docker-compose down -v

# Restart
docker-compose up -d
```

#### 2. Chaincode Not Found

**Symptoms:**
- `chaincode certificate not found` error

**Solution:**
```bash
cd fabric-network
./scripts/redeployChaincodeWithLogging.sh
```

#### 3. Certificates Not Appearing

**Symptoms:**
- Certificate created but not visible in frontend

**Check:**
1. Backend logs for errors
2. Endorsement policy (need 2 peers)
3. Chaincode deployment status

**Solution:**
```bash
# Check chaincode status
docker exec cli peer lifecycle chaincode querycommitted \
    -C certificatechannel -n certificate

# Query directly from blockchain
docker exec cli peer chaincode query \
    -C certificatechannel -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

#### 4. Endorsement Policy Failure

**Symptoms:**
- `ENDORSEMENT_POLICY_FAILURE` in logs
- Transaction rejected

**Solution:**
- Ensure backend invokes with 2 peers (Org1 + Org2)
- Check `simpleFabricClient.js` has both `--peerAddresses`

#### 5. Frontend Can't Connect to Backend

**Symptoms:**
- Network errors in browser console

**Solution:**
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check CORS settings in backend/server.js
# Ensure FRONTEND_URL is set correctly
```

### Debugging Commands

```bash
# View all containers
docker ps -a

# View container logs
docker logs peer0.org1.example.com
docker logs orderer.example.com

# View chaincode logs
docker ps | grep certificate
docker logs <chaincode-container-id>

# Check network status
docker network ls
docker network inspect academic-certificates-platform_academic-certificates

# Query blockchain directly
docker exec cli peer chaincode query \
    -C certificatechannel -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

### Reset Everything

```bash
# Stop all containers
cd fabric-network
docker-compose down -v

# Remove crypto material
rm -rf crypto-config
rm -rf config/genesis.block

# Clean Docker
docker system prune -f
docker volume prune -f

# Restart from scratch
./setup.sh
```

---

## 📊 Performance & Scalability

### Current Configuration

- **Network:** 3 organizations, 2 peers each (6 peers total)
- **Consensus:** Solo (development mode)
- **State Database:** CouchDB
- **Transaction Throughput:** ~100-200 TPS (development)

### Production Considerations

1. **Consensus:** Switch from Solo to Raft/Kafka
2. **TLS:** Enable TLS for all communications
3. **Monitoring:** Add Prometheus/Grafana
4. **Load Balancing:** Add load balancer for peers
5. **Database:** Optimize CouchDB indexes
6. **Caching:** Add Redis for frequently accessed data

---

## 🔐 Security Features

### Implemented

✅ **JWT Authentication** - Secure token-based auth  
✅ **Role-Based Access Control** - Granular permissions  
✅ **Input Validation** - Prevents injection attacks  
✅ **CORS Protection** - Restricts cross-origin requests  
✅ **Helmet.js** - Security headers  

### Production Recommendations

⚠️ **Enable TLS** - Encrypt all communications  
⚠️ **Strong JWT Secret** - Use complex, random secret  
⚠️ **Rate Limiting** - Prevent DDoS attacks  
⚠️ **Input Sanitization** - Additional validation layers  
⚠️ **Audit Logging** - Track all operations  

---

## 🎓 Presentation Tips for Professor

### Key Points to Emphasize

1. **Blockchain Immutability**
   - Show how certificates cannot be altered
   - Demonstrate blockchain explorer
   - Explain cryptographic hashing

2. **Multi-Organization Trust**
   - Explain endorsement policy
   - Show how 2+ organizations must agree
   - Demonstrate distributed ledger

3. **Real-World Application**
   - Solve actual problem (certificate fraud)
   - Show complete workflow
   - Demonstrate verification process

4. **Technical Implementation**
   - Show code structure
   - Explain Fabric integration
   - Demonstrate API endpoints

### Demo Flow

1. **Start:** Show network status (Blockchain Explorer)
2. **Create:** Issue a certificate as university
3. **View:** Show certificate in list
4. **Verify:** Verify certificate as verifier
5. **Blockchain:** Show blockchain proof
6. **Explain:** Walk through technical architecture

---

## 📚 Additional Resources

### Hyperledger Fabric Documentation
- Official Docs: https://hyperledger-fabric.readthedocs.io/
- Chaincode Tutorial: https://hyperledger-fabric.readthedocs.io/en/latest/chaincode4ade.html

### Project Files
- `README.md` - Quick start guide
- `STEP1-SETUP-GUIDE.md` - Detailed setup
- `ROLE-BASED-ACCESS-GUIDE.md` - RBAC details
- `PRESENTATION-GUIDE.md` - Presentation tips

---

## ✅ Conclusion

This Academic Certificates Platform demonstrates:

✅ **Blockchain Integration** - Hyperledger Fabric for immutable storage  
✅ **Full-Stack Development** - React frontend + Node.js backend  
✅ **Enterprise Architecture** - Multi-organization network  
✅ **Security** - Role-based access control  
✅ **Real-World Application** - Solves certificate fraud problem  

**The platform is production-ready for demonstration and can be extended for real-world deployment.**

---

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Author:** Academic Certificates Platform Team


