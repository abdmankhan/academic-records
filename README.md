# Academic Certificates Platform

A blockchain-powered academic certificate verification system built with **Hyperledger Fabric**, **Node.js**, and **React**.

## 🚀 Features

- **Immutable Certificate Storage**: Certificates stored on Hyperledger Fabric blockchain
- **Multi-Organization Support**: 3-organization consortium network
- **Real-time Verification**: Instant certificate authenticity verification
- **Complete Audit Trail**: Full history tracking of all certificate transactions
- **Modern Web Interface**: Responsive React frontend with Bootstrap
- **RESTful API**: Node.js/Express backend with comprehensive API
- **WSL2 Compatible**: Optimized for Ubuntu on Windows with Docker Desktop

## 🏗️ Architecture

### Blockchain Network
- **Hyperledger Fabric 2.4.9**
- **3 Organizations**: Org1, Org2, Org3 (2 peers each)
- **1 Orderer**: Solo consensus for development
- **CouchDB**: State database for rich queries
- **Certificate Authority**: One CA per organization

### Backend (Node.js/Express)
- RESTful API with JWT authentication
- Fabric Gateway SDK integration
- Certificate CRUD operations
- Blockchain interaction layer

### Frontend (React)
- Modern responsive UI with React Bootstrap
- Certificate browsing and verification
- Real-time search and filtering
- Admin panel for certificate creation

## 📋 Prerequisites

### System Requirements
- **Ubuntu 24.04 LTS** (WSL2 supported)
- **Docker Desktop** (running in Windows for WSL2)
- **Node.js** 16+ and **npm**
- **Git**

### Check Prerequisites
```bash
# Verify Docker is running
docker --version
docker-compose --version

# Verify Node.js
node --version
npm --version
```

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd academic-certificates-platform
```

### 2. Run the Complete Setup
The setup script handles everything automatically:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- ✅ Download Hyperledger Fabric binaries (if needed)
- 🔐 Generate crypto material for all organizations
- 🌐 Start the Hyperledger Fabric network
- 📋 Create channel and join all peers
- 📦 Package, install, and deploy chaincode
- 🔧 Install backend dependencies
- 🎨 Install frontend dependencies

### 3. Start the Application Servers

After the setup completes, start the services:

```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
cd frontend
npm start
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main web application |
| **Backend API** | http://localhost:5000 | REST API endpoint |
| **Health Check** | http://localhost:5000/api/health | API health status |

## 🔗 Network Endpoints

| Component | Port | Description |
|-----------|------|-------------|
| **Orderer** | 7050 | Fabric orderer service |
| **Org1 Peer0** | 7051 | Organization 1 primary peer |
| **Org1 Peer1** | 8051 | Organization 1 secondary peer |
| **Org2 Peer0** | 9051 | Organization 2 primary peer |
| **Org2 Peer1** | 10051 | Organization 2 secondary peer |
| **Org3 Peer0** | 11051 | Organization 3 primary peer |
| **Org3 Peer1** | 12051 | Organization 3 secondary peer |
| **CouchDB 0-5** | 5984-10984 | State databases |
| **CA Org1-3** | 7054, 8054, 9054 | Certificate authorities |

## 📚 API Documentation

### Authentication
```bash
# Login (get JWT token)
POST /api/users/login
{
  "username": "admin",
  "password": "adminpw"
}

# Register new user
POST /api/users/register
{
  "username": "newuser",
  "password": "password123"
}
```

### Certificate Management
```bash
# Get all certificates
GET /api/certificates

# Get certificate by ID
GET /api/certificates/{id}

# Create certificate (requires auth)
POST /api/certificates
Authorization: Bearer <token>
{
  "id": "CERT123",
  "studentId": "STU001",
  "studentName": "John Doe",
  "course": "Blockchain Development",
  "grade": "A",
  "issuedAt": "2025-01-15T00:00:00Z"
}

# Verify certificate
POST /api/certificates/{id}/verify
{
  "studentName": "John Doe"  // Optional verification fields
}

# Get certificate history
GET /api/certificates/{id}/history
```

## 🔧 Manual Operations

### Start/Stop Network
```bash
# Start network
cd fabric-network
./scripts/startNetwork.sh

# Stop network
docker-compose down -v

# Clean everything
docker system prune -f
docker volume prune -f
```

### Chaincode Operations
```bash
# Access CLI container
docker exec -it cli bash

# Query all certificates
peer chaincode query -C certificatechannel -n certificate -c '{"function":"GetAllCertificates","Args":[]}'

# Create a certificate
peer chaincode invoke -C certificatechannel -n certificate -c '{"function":"CreateCertificate","Args":["{\"id\":\"TEST1\",\"studentId\":\"STU001\",\"studentName\":\"Test Student\",\"course\":\"Test Course\",\"grade\":\"A\",\"issuedAt\":\"2025-01-15T00:00:00Z\"}"]}'
```

## 🛠️ Development

### Backend Development
```bash
cd backend
npm install
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd frontend
npm install
npm start    # React development server
```

### Chaincode Development
```bash
cd fabric-network/chaincode/certificate
npm install
# Edit lib/certificateContract.js
# Redeploy using the setup script
```

## 🚨 Troubleshooting

### Common Issues

#### 1. Docker Permission Errors
```bash
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Fabric Binaries Not Found
```bash
# Manual download
cd fabric-samples
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.9 1.5.6
export PATH=$PWD/bin:$PATH
```

#### 3. Port Conflicts
```bash
# Check port usage
sudo netstat -tulpn | grep :7050
# Kill processes if needed
sudo fuser -k 7050/tcp
```

#### 4. WSL2 Docker Issues
- Ensure Docker Desktop is running in Windows
- Enable WSL2 integration in Docker Desktop settings
- Restart Docker Desktop if needed

#### 5. Chaincode Installation Failures
```bash
# Check peer logs
docker logs peer0.org1.example.com

# Reinstall chaincode
docker exec cli peer lifecycle chaincode install certificate.tar.gz
```

### Reset Everything
```bash
# Complete reset
cd fabric-network
docker-compose down -v
docker system prune -f
rm -rf crypto-config
./setup.sh
```

## 📁 Project Structure

```
academic-certificates-platform/
├── backend/                    # Node.js/Express API
│   ├── controllers/           # API controllers
│   ├── routes/               # Express routes
│   ├── middleware/           # Auth & validation
│   ├── fabric-client/        # Fabric SDK integration
│   ├── package.json
│   └── server.js            # Main server file
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   └── services/       # API services
│   └── package.json
├── fabric-network/          # Hyperledger Fabric network
│   ├── chaincode/          # Smart contracts
│   ├── config/            # Network configuration
│   ├── scripts/           # Network scripts
│   ├── crypto-config.yaml
│   └── docker-compose.yaml
├── fabric-samples/         # Fabric binaries & samples
└── setup.sh              # Complete setup script
```

## 🎯 Usage Examples

### 1. Create a Certificate
1. Login at http://localhost:3000/login (admin/adminpw)
2. Navigate to "Create Certificate"
3. Fill in student details
4. Submit to store on blockchain

### 2. Verify a Certificate
1. Go to http://localhost:3000/verify
2. Enter certificate ID (e.g., "CERT1")
3. View verification result and details

### 3. Browse Certificates
1. Visit http://localhost:3000/certificates
2. Search by student name, course, or ID
3. Click "Verify Certificate" for any certificate

## 📊 Monitoring

### Check Network Status
```bash
# Container status
docker ps

# Network logs
docker logs orderer.example.com
docker logs peer0.org1.example.com

# API health
curl http://localhost:5000/api/health
```

### Performance Monitoring
- CouchDB interfaces available on ports 5984-10984
- Fabric peer metrics on ports 9443-9448
- Application logs in respective terminals

## 🔒 Security Notes

- **Development Setup**: Uses simplified security (no TLS, basic auth)
- **Production**: Enable TLS, use proper CA certificates, implement proper user management
- **JWT Secret**: Change JWT_SECRET in production
- **Database**: Secure CouchDB with proper authentication
- **Network**: Configure proper firewall rules

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions:
1. Check troubleshooting section
2. Review Hyperledger Fabric documentation
3. Open GitHub issue with detailed logs

---

**🎉 Your Academic Certificates Platform is now ready!**

Start exploring the blockchain-powered certificate management system at http://localhost:3000