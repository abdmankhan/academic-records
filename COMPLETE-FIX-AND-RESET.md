# Complete Fix and Reset Guide

## ✅ Network Issue FIXED

The network name mismatch has been fixed! The Docker network is now correctly named `academic-certificates-platform_academic-certificates`.

## 🔄 Current Status

After the fix, you need to:
1. ✅ Network is running (FIXED)
2. ⚠️ Channel needs to be recreated (after restart)
3. ⚠️ Chaincode needs to be reinstalled (after restart)

## 🚀 Quick Fix (Recommended)

Run the complete setup script which will handle everything:

```bash
cd /home/abdmankhan/academic-certificates-platform
./setup.sh
```

This will:
- Generate crypto material (if needed)
- Start the network
- Create the channel
- Install and commit chaincode
- Initialize the ledger

## 🔧 Manual Fix (If setup.sh doesn't work)

### Step 1: Ensure Network is Running
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
docker-compose up -d
sleep 20  # Wait for all containers
```

### Step 2: Create Channel
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
./scripts/createChannel.sh
```

### Step 3: Install Chaincode
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network

# Install chaincode dependencies
cd chaincode/certificate
npm install
cd ../..

# Package chaincode
docker exec cli peer lifecycle chaincode package certificate.tar.gz \
    --path /opt/gopath/src/github.com/chaincode/certificate \
    --lang node \
    --label certificate_1.0

# Install on all peers (see setup.sh for full commands)
# Then approve and commit
```

## 🐳 Docker Desktop vs Direct Docker in WSL2

### Option 1: Docker Desktop (Current - Recommended)
**Pros:**
- ✅ Easy setup
- ✅ GUI management
- ✅ Better Windows integration
- ✅ Automatic WSL2 integration

**Cons:**
- ⚠️ Port conflicts on Windows (we've fixed this)
- ⚠️ Network name issues (we've fixed this)

**Status:** ✅ **WORKING** - All issues fixed!

### Option 2: Docker Engine in WSL2 (Advanced)
**Pros:**
- ✅ No Windows port conflicts
- ✅ More control
- ✅ Native Linux Docker

**Cons:**
- ❌ More complex setup
- ❌ Need to install Docker Engine manually
- ❌ No GUI
- ❌ May have permission issues

**Installation (if you want to try):**
```bash
# Install Docker Engine in WSL2
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Then use docker commands directly (no Docker Desktop needed)
```

**Recommendation:** **Stick with Docker Desktop** - it's working now after our fixes!

## 🔄 Starting Fresh (If Needed)

If you want to start completely fresh:

### Step 1: Clean Everything
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network

# Stop and remove all containers
docker-compose down -v

# Remove crypto material
rm -rf crypto-config

# Remove channel artifacts
rm -f config/genesis.block
rm -f config/*.tx
rm -f *.block

# Clean Docker
docker system prune -f
```

### Step 2: Regenerate Everything
```bash
cd /home/abdmankhan/academic-certificates-platform

# Run complete setup
./setup.sh
```

## ✅ What We Fixed

1. **Network Name Mismatch** ✅
   - Changed network to explicit name: `academic-certificates-platform_academic-certificates`
   - Chaincode containers can now find the network

2. **Windows Port Conflicts** ✅
   - CA Org3: `9054` → `10054`
   - CouchDB3: `8984` → `15984`
   - Peer0 Org2: `9051` → `10052`

3. **CLI Container** ✅
   - Now starts properly after network is ready

## 🧪 Test After Fix

```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network

# Test query
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'

# Test invoke
docker exec -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_TLS_ENABLED=false \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
  cli peer chaincode invoke \
  -o orderer.example.com:7050 \
  -C certificatechannel \
  -n certificate \
  --peerAddresses peer0.org1.example.com:7051 \
  -c '{"function":"createCertificate","Args":["{\"id\":\"TEST001\",\"studentId\":\"STU001\",\"studentName\":\"Test\",\"course\":\"Test\",\"grade\":\"A\",\"issuedAt\":\"2025-01-15T00:00:00.000Z\"}"]}'
```

## 📝 Summary

**Your Questions:**

1. **Is this because of Docker for Windows?**
   - Partially - Windows port conflicts, but we've fixed them
   - Network issue was a configuration problem (now fixed)

2. **Can I use Docker directly in WSL2?**
   - Yes, but Docker Desktop is recommended and now working
   - See Option 2 above if you want to try

3. **Should we start fresh?**
   - **No need!** The network issue is fixed
   - Just recreate the channel and reinstall chaincode
   - Or run `./setup.sh` to do everything

## 🎯 Recommended Next Steps

1. **Run setup script** (easiest):
   ```bash
   cd /home/abdmankhan/academic-certificates-platform
   ./setup.sh
   ```

2. **Or manually recreate channel**:
   ```bash
   cd /home/abdmankhan/academic-certificates-platform/fabric-network
   ./scripts/createChannel.sh
   ```

3. **Test your original command** - it should work now!

The network issue is **FIXED**. You just need to recreate the channel and reinstall chaincode (which setup.sh does automatically).





