# Step 1: Hyperledger Fabric Setup Guide

This guide will help you set up the Hyperledger Fabric network for the Academic Certificates Platform on WSL2 Ubuntu 24.04 LTS.

## Prerequisites Installation

### 1. Update System Packages
```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2. Install Docker and Docker Compose

#### Install Docker
```bash
# Remove old versions if any
sudo apt-get remove docker docker-engine docker.io containerd runc

# Install prerequisites
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker installation
docker --version
docker-compose --version
```

**Important for WSL2:**
- Ensure Docker Desktop is running in Windows
- Enable WSL2 integration in Docker Desktop settings:
  - Open Docker Desktop
  - Go to Settings → Resources → WSL Integration
  - Enable integration with your Ubuntu distribution
  - Click "Apply & Restart"

### 3. Install Node.js and npm

```bash
# Install Node.js 18.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 4. Install Go (Required for Fabric tools)

```bash
# Install Go 1.20 or later
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz

# Add Go to PATH
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Verify installation
go version
```

### 5. Install Git and Other Utilities

```bash
sudo apt-get install -y git make jq
```

### 6. Install Hyperledger Fabric Binaries

```bash
cd /home/abdmankhan/academic-certificates-platform

# Download Fabric binaries and samples
curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.9 1.5.6

# Add Fabric binaries to PATH
export PATH=$PWD/fabric-samples/bin:$PATH
echo 'export PATH=$PATH:/home/abdmankhan/academic-certificates-platform/fabric-samples/bin' >> ~/.bashrc
source ~/.bashrc

# Verify installation
cryptogen version
configtxgen version
```

## Network Configuration

The network is already configured with:
- **3 Organizations**: Org1, Org2, Org3 (each representing University, Student Registry, and Verification Authority)
- **2 Peers per Organization**: 6 peers total
- **1 Orderer**: Solo consensus (for development)
- **3 Certificate Authorities**: One CA per organization
- **6 CouchDB instances**: One per peer for state database

### Network Architecture

```
Orderer (Solo)
├── Org1 (University)
│   ├── Peer0 (7051)
│   ├── Peer1 (8051)
│   └── CA (7054)
├── Org2 (Student Registry)
│   ├── Peer0 (9051)
│   ├── Peer1 (10051)
│   └── CA (8054)
└── Org3 (Verification Authority)
    ├── Peer0 (11051)
    ├── Peer1 (12051)
    └── CA (9054)
```

## Starting the Network

### Option 1: Automated Setup (Recommended)

```bash
cd /home/abdmankhan/academic-certificates-platform
chmod +x setup.sh
./setup.sh
```

This script will:
1. Check prerequisites
2. Generate crypto material
3. Start the Fabric network
4. Create channel
5. Deploy chaincode
6. Install backend and frontend dependencies

### Option 2: Manual Setup

#### Step 1: Generate Crypto Material
```bash
cd fabric-network
export FABRIC_CFG_PATH=$PWD/config
export PATH=/home/abdmankhan/academic-certificates-platform/fabric-samples/bin:$PATH

chmod +x scripts/generate.sh
./scripts/generate.sh
```

#### Step 2: Generate Genesis Block
```bash
cd fabric-network/config
export FABRIC_CFG_PATH=$PWD
export PATH=/home/abdmankhan/academic-certificates-platform/fabric-samples/bin:$PATH

configtxgen -profile ThreeOrgsOrdererGenesis -channelID system-channel -outputBlock ./genesis.block
```

#### Step 3: Start Network
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
chmod +x scripts/startNetwork.sh
./scripts/startNetwork.sh
```

#### Step 4: Create Channel
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
chmod +x scripts/createChannel.sh
./scripts/createChannel.sh
```

#### Step 5: Deploy Chaincode
The chaincode deployment is handled in the setup.sh script. If you need to deploy manually, refer to the setup.sh script for the exact commands.

## Verifying the Network

### Check Running Containers
```bash
docker ps
```

You should see:
- 1 orderer container
- 6 peer containers (2 per org)
- 6 CouchDB containers
- 3 CA containers
- 1 CLI container

### Check Network Health
```bash
# Check orderer logs
docker logs orderer.example.com

# Check peer logs
docker logs peer0.org1.example.com
docker logs peer0.org2.example.com
docker logs peer0.org3.example.com

# Check CouchDB
curl http://localhost:5984
```

### Test Chaincode
```bash
# Access CLI container
docker exec -it cli bash

# Query all certificates
peer chaincode query -C certificatechannel -n certificate -c '{"function":"GetAllCertificates","Args":[]}'
```

## Troubleshooting

### Docker Permission Issues
```bash
sudo usermod -aG docker $USER
newgrp docker
```

### Port Conflicts
```bash
# Check what's using a port
sudo netstat -tulpn | grep :7050

# Kill process if needed
sudo fuser -k 7050/tcp
```

### WSL2 Docker Issues
- Ensure Docker Desktop is running in Windows
- Restart Docker Desktop
- Check WSL2 integration is enabled

### Clean Reset
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
docker-compose down -v
docker system prune -f
rm -rf crypto-config
rm -f config/genesis.block
```

## Next Steps

Once the network is running successfully:
1. ✅ Step 1 Complete: Hyperledger Fabric Network is running
2. Proceed to Step 2: Backend API with role-based access control
3. Then Step 3: Frontend with role-based UI

## Network Endpoints

| Component | Port | Description |
|-----------|------|-------------|
| Orderer | 7050 | Fabric orderer service |
| Org1 Peer0 | 7051 | University primary peer |
| Org1 Peer1 | 8051 | University secondary peer |
| Org2 Peer0 | 9051 | Student Registry primary peer |
| Org2 Peer1 | 10051 | Student Registry secondary peer |
| Org3 Peer0 | 11051 | Verification Authority primary peer |
| Org3 Peer1 | 12051 | Verification Authority secondary peer |
| CouchDB 0-5 | 5984-10984 | State databases |
| CA Org1 | 7054 | University CA |
| CA Org2 | 8054 | Student Registry CA |
| CA Org3 | 9054 | Verification Authority CA |

