# 🔴 CRITICAL: Certificate Persistence Issue

## Problem
- Certificates are created successfully (status 200)
- Blockchain height increases (transaction committed)
- But certificates **cannot be queried** - they don't exist in state

## Root Cause Analysis

### What's Working
✅ Certificate creation succeeds  
✅ Transaction is committed (blockchain height increases)  
✅ Chaincode executes (logs show "Create Certificate")  

### What's NOT Working
❌ Certificates not queryable after creation  
❌ `queryAllCertificates` returns empty `[]`  
❌ `queryCertificate` returns "does not exist"  

## Possible Causes

### 1. Chaincode putState Not Working
- `putState` might be failing silently
- State might be written to wrong namespace
- Buffer encoding issue

### 2. Transaction Not Actually Committed
- Transaction succeeds but state not persisted
- CouchDB sync issue
- State database corruption

### 3. Query Filtering Issue
- `getStateByRange` might be filtering out results
- Role-based access blocking queries
- Key namespace mismatch

## Fix Applied

### 1. Enhanced Chaincode Logging
Added detailed logging to verify `putState`:
```javascript
console.info('📝 Putting state for certificate ID:', certificate.id);
await ctx.stub.putState(certificate.id, certBuffer);
console.info('✅ State put successfully for:', certificate.id);

// Verify it was written
const verifyState = await ctx.stub.getState(certificate.id);
if (verifyState && verifyState.length > 0) {
    console.info('✅ Verified: Certificate state exists after putState');
} else {
    console.error('❌ ERROR: Certificate state NOT found after putState!');
}
```

### 2. Redeploy Chaincode
The chaincode needs to be redeployed with the new logging to see what's happening.

## Solution Steps

### Step 1: Redeploy Chaincode with Logging
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
./scripts/redeployChaincodeWithLogging.sh
```

This will:
- Package new chaincode with enhanced logging
- Install and approve on all orgs
- Commit new version
- Test certificate creation
- Show chaincode logs

### Step 2: Check Chaincode Logs
```bash
# Find the chaincode container
docker ps | grep certificate

# Check logs for putState verification
docker logs dev-peer0.org1.example.com-certificate_2.0-... | grep -E "putState|Verified|ERROR"
```

### Step 3: Test Certificate Creation
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
  -c '{"function":"createCertificate","Args":["{\"id\":\"TEST_AFTER_REDEPLOY\",\"studentId\":\"STU001\",\"studentName\":\"Test\",\"course\":\"Test\",\"grade\":\"A\",\"issuedAt\":\"2025-01-15T00:00:00.000Z\"}"]}'

# Wait a moment
sleep 3

# Query
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

### Step 4: Check CouchDB Directly
```bash
# Check if certificates are in CouchDB
curl http://localhost:5984/certificatechannel/_all_docs?include_docs=true | python3 -m json.tool
```

## Expected Results After Fix

1. **Chaincode logs show:**
   ```
   📝 Putting state for certificate ID: TEST_AFTER_REDEPLOY
   ✅ State put successfully for: TEST_AFTER_REDEPLOY
   ✅ Verified: Certificate state exists after putState
   ```

2. **Query returns certificate:**
   ```json
   [{"Key":"TEST_AFTER_REDEPLOY","Record":{...}}]
   ```

3. **Frontend shows certificate** in Browse Certificates page

## If Still Not Working

If certificates still don't persist after redeploy:

1. **Check CouchDB directly** - certificates might be there but query is wrong
2. **Check chaincode namespace** - state might be in wrong namespace
3. **Check transaction commit** - verify transaction is actually committed
4. **Check state database** - might need to reset CouchDB

## Alternative: Quick Test Without Redeploy

If redeploy takes too long, test with current chaincode:

```bash
# Create certificate
# ... (use existing command)

# Check chaincode logs immediately after
docker logs dev-peer0.org1.example.com-certificate_1.0-... --tail 50 | grep -E "Create|putState|ERROR"
```

The enhanced logging will help identify exactly where the issue is.





