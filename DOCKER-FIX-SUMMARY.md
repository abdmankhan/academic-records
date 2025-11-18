# Docker Windows Fix Summary

## ✅ Issues Fixed

### 1. CLI Container Not Running
**Problem**: The CLI container was in "Created" state but not running, causing the error:
```
Error response from daemon: container ... is not running
```

**Solution**: 
- Fixed port conflicts that prevented peers from starting
- Ensured CLI container starts after all dependencies
- Created `scripts/quickFix.sh` to ensure CLI is running

### 2. Windows Port Conflicts
**Problem**: Windows reserves ports 8000-8999, causing binding errors:
```
Error: ports are not available: exposing port TCP 0.0.0.0:9051 -> ... bind: An attempt was made to access a socket in a way forbidden by its access permissions.
```

**Solution**: Updated `docker-compose.yaml` with alternative ports:
- **CA Org3**: `9054` → `10054` ✅
- **CouchDB3**: `8984` → `15984` ✅  
- **Peer0 Org2**: `9051` → `10052` ✅

## 📋 Current Status

✅ **Network Containers**: All running
✅ **CLI Container**: Running
✅ **Channel**: Created (`certificatechannel`)
⚠️ **Chaincode**: Needs to be installed/committed (if not already done)

## 🚀 Quick Start Commands

### Ensure Network is Running
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
./scripts/quickFix.sh
```

### Check Status
```bash
docker ps | grep -E "cli|peer|orderer"
```

### Test Chaincode (if installed)
```bash
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"GetAllCertificates","Args":[]}'
```

## 🔧 If Chaincode Needs Installation

If you see "chaincode certificate not found", you need to install and commit the chaincode:

```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network

# Install chaincode dependencies
cd chaincode/certificate
npm install
cd ../..

# Package chaincode (from CLI container)
docker exec cli peer lifecycle chaincode package certificate.tar.gz \
    --path /opt/gopath/src/github.com/chaincode/certificate \
    --lang node \
    --label certificate_1.0

# Install on all peers (run from setup.sh or manually)
# Then approve and commit
```

Or simply run the full setup:
```bash
cd /home/abdmankhan/academic-certificates-platform
./setup.sh
```

## 📝 Updated Port Mappings

| Service | Internal Port | External Port (Windows) |
|---------|--------------|------------------------|
| Peer0 Org2 | 9051 | **10052** (changed) |
| CA Org3 | 9054 | **10054** (changed) |
| CouchDB3 | 5984 | **15984** (changed) |

**Note**: Internal ports remain the same - only external mappings changed for Windows compatibility.

## ✅ Your Original Error - FIXED

Your original error was:
```
Error response from daemon: container e1de32976b6b... is not running
```

**This is now fixed!** The CLI container is running. You can now use chaincode commands.

## 🧪 Test Your Original Command

Try your original command again:
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
docker exec -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_TLS_ENABLED=false \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
  cli peer chaincode invoke \
  -o orderer.example.com:7050 \
  -C certificatechannel \
  -n certificate \
  --peerAddresses peer0.org1.example.com:7051 \
  -c '{"function":"createCertificate","Args":["{\"id\":\"CERT_MI201QXS_R8RZB\",\"studentId\":\"shivang\",\"studentName\":\"Khan Abdul Mannan\",\"course\":\"MCA\",\"grade\":\"A\",\"issuedAt\":\"2025-11-16T00:00:00.000Z\"}"]}'
```

**Note**: If you get "chaincode certificate not found", the chaincode needs to be installed first (see above).

## 📚 Documentation

- `WINDOWS-DOCKER-FIX.md` - Detailed Windows port conflict guide
- `scripts/quickFix.sh` - Quick fix script for CLI and network
- `scripts/ensureNetworkRunning.sh` - Network status checker

## 🎯 Next Steps

1. ✅ CLI container is running - **FIXED**
2. ✅ Port conflicts resolved - **FIXED**
3. ⚠️ Ensure chaincode is installed (run `./setup.sh` if needed)
4. ✅ Test your chaincode invoke command

The main issue (CLI container not running) is now resolved!





