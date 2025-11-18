# Quick Fix Test - Certificate Persistence

## The Problem
Certificates are created (status 200) but can't be queried. Blockchain height increases, so transactions are committed, but state isn't queryable.

## Quick Diagnostic Test

### Test 1: Check if ANY state exists
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network

# Try to query with a very broad range
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

### Test 2: Check chaincode logs for query
```bash
# Check what the query function is doing
docker logs dev-peer0.org1.example.com-certificate_1.0-... --tail 100 | grep -E "queryAllCertificates|Found key|Total keys"
```

### Test 3: Create and immediately query
```bash
# Create a certificate
docker exec -e CORE_PEER_LOCALMSPID=Org1MSP \
  -e CORE_PEER_TLS_ENABLED=false \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp \
  -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
  cli peer chaincode invoke \
  -o orderer.example.com:7050 \
  -C certificatechannel \
  -n certificate \
  --peerAddresses peer0.org1.example.com:7051 \
  -c '{"function":"createCertificate","Args":["{\"id\":\"IMMEDIATE_TEST\",\"studentId\":\"STU001\",\"studentName\":\"Immediate Test\",\"course\":\"Test\",\"grade\":\"A\",\"issuedAt\":\"2025-01-15T00:00:00.000Z\"}"]}'

# Wait for commit
sleep 5

# Query immediately
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

## Most Likely Issue

Based on the symptoms:
1. ✅ Transaction commits (height increases)
2. ❌ State not queryable
3. ❌ Query returns empty

**This suggests the state IS being written, but the query is filtering it out or looking in the wrong place.**

### Possible Causes:
1. **Role-based filtering** - The query might be filtering out certificates based on caller role
2. **Key namespace** - State might be in a different namespace than expected
3. **CouchDB index** - CouchDB might need an index for the query to work
4. **State range** - `getStateByRange('', '')` might not work as expected

## Quick Fix to Try

### Option 1: Bypass Role Filtering (Temporary)
Modify `queryAllCertificates` to return ALL certificates regardless of role, just to test:

```javascript
// In chaincode/certificate/index.js, temporarily comment out role filtering:
// if (callerRole === 'student') {
//     ... filtering code ...
// } else {
    allResults.push({ Key: key, Record: record });
// }
```

### Option 2: Check CouchDB Directly
```bash
# Try to access CouchDB directly (if port is exposed)
curl http://localhost:5984/certificatechannel/_all_docs
```

### Option 3: Query from Different Peer
```bash
# Query from Org2 peer
docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 \
  -e CORE_PEER_LOCALMSPID=Org2MSP \
  -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
  cli peer chaincode query \
  -C certificatechannel \
  -n certificate \
  -c '{"function":"queryAllCertificates","Args":[]}'
```

## Next Steps

1. Run the diagnostic tests above
2. Check chaincode logs for the enhanced logging
3. If still empty, try bypassing role filtering temporarily
4. If that works, the issue is role-based filtering logic
5. If still empty, the issue is with state storage itself

The enhanced logging I added will show exactly what's happening in the query function.





