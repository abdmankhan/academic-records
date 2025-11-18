# Certificate Display Fix

## Issue
Certificates created via UI show "Certificate created successfully!" but don't appear in:
- Browse Certificates page
- Blockchain Explorer page

## Root Cause
The backend is using **in-memory storage** instead of blockchain. The logs show:
- "✅ Certificate stored in memory database"
- "📋 Retrieved from memory database"

## Fix Applied

1. **Enhanced Error Logging**: Added detailed logging to see why blockchain isn't being used
2. **Removed Silent Fallback**: Backend will now throw errors instead of silently falling back to memory
3. **Better Initialization**: Added blockchain connection test on startup

## Steps to Fix

### 1. Restart Backend with Enhanced Logging

```bash
cd /home/abdmankhan/academic-certificates-platform/backend
npm start
```

Watch the startup logs. You should see:
- "🔍 useBlockchain flag: true"
- "🔗 Initializing connection to Hyperledger Fabric blockchain..."
- "✅ Fabric blockchain client ready"

If you see "💾 Using in-memory storage", then `USE_BLOCKCHAIN` is set to false.

### 2. Check Environment Variable

```bash
cd /home/abdmankhan/academic-certificates-platform/backend
# Check if USE_BLOCKCHAIN is set to false
echo $USE_BLOCKCHAIN
# Or check .env file
cat .env | grep USE_BLOCKCHAIN
```

If it's set to `false`, either:
- Remove it (defaults to true)
- Or set it to `true` or `1`

### 3. Test Certificate Creation

1. **Create a certificate via UI** (university login)
2. **Check backend logs** - you should see:
   - "📝 Creating certificate on blockchain: CERT_ID"
   - "✅ Certificate created on blockchain"

If you see "✅ Certificate created in memory", the backend is still using memory.

### 4. Verify on Blockchain

After creating a certificate:

```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

If this returns empty `[]`, the certificate wasn't stored on blockchain.

## Debugging

### Check Backend Logs
```bash
cd /home/abdmankhan/academic-certificates-platform/backend
tail -f backend.log
```

Look for:
- "Creating certificate on blockchain" (good)
- "Certificate created in memory" (bad - using memory)
- "Error creating certificate" (blockchain call failed)

### Test Blockchain Directly
```bash
# Create certificate directly on blockchain
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
  -c '{"function":"createCertificate","Args":["{\"id\":\"DIRECT_TEST\",\"studentId\":\"STU001\",\"studentName\":\"Direct Test\",\"course\":\"Test\",\"grade\":\"A\",\"issuedAt\":\"2025-01-15T00:00:00.000Z\"}"]}'

# Then query
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

If direct creation works but UI doesn't, the issue is in the backend API.

## Expected Behavior After Fix

1. **Create certificate via UI** → Backend logs show "Creating certificate on blockchain"
2. **Certificate appears in Blockchain Explorer** (auto-refreshes every 5 seconds)
3. **Certificate appears in Browse Certificates** page
4. **Query blockchain directly** → Certificate is there

## If Still Not Working

1. Check backend is actually calling blockchain (not memory)
2. Check blockchain network is running (`docker ps`)
3. Check chaincode is installed and committed
4. Check backend logs for errors
5. Verify `USE_BLOCKCHAIN` environment variable





