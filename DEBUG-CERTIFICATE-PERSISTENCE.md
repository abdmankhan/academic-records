# Debug Certificate Persistence Issue

## Problem
Certificates are created successfully (status 200) but:
- Not found when queried directly
- `queryAllCertificates` returns empty `[]`
- Backend shows "No certificates found on blockchain"

## Investigation

### 1. Certificate Creation Works
```bash
# Create succeeds
docker exec cli peer chaincode invoke ... -c '{"function":"createCertificate",...}'
# Result: status:200 payload:"{...certificate data...}"
```

### 2. But Certificate Not Persisted
```bash
# Query returns empty
docker exec cli peer chaincode query -C certificatechannel -n certificate -c '{"function":"queryAllCertificates","Args":[]}'
# Result: []
```

### 3. Chaincode Logs Show Execution
```
============= START : Create Certificate ===========
============= END : Create Certificate ===========
```

But no `putState` confirmation logs.

## Possible Causes

### 1. Transaction Not Committed
- Invoke succeeds but transaction not committed to ledger
- Check if all peers are endorsing
- Check if orderer is processing transactions

### 2. putState Not Working
- Chaincode `putState` call might be failing silently
- Check chaincode error logs
- Verify `putState` is being called

### 3. Query Filtering Issue
- `queryAllCertificates` might be filtering out results
- Role-based access might be blocking
- Check chaincode query logic

### 4. State Database Issue
- CouchDB might not be syncing
- Check CouchDB logs
- Verify CouchDB is accessible

## Debugging Steps

### Step 1: Check if Transaction is Committed
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
docker exec peer0.org1.example.com peer channel getinfo -c certificatechannel
# Check if height increases after create
```

### Step 2: Check Chaincode putState
```bash
# Add more logging to chaincode
# In chaincode/certificate/index.js, add:
console.info('Putting state for:', certificate.id);
await ctx.stub.putState(certificate.id, Buffer.from(JSON.stringify(certificate)));
console.info('State put successfully for:', certificate.id);
```

### Step 3: Query Directly by Key
```bash
# Try to query the specific certificate
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryCertificate","Args":["CERT_ID"]}'
```

### Step 4: Check CouchDB
```bash
# Check CouchDB directly
curl http://localhost:5984/certificatechannel/_all_docs
```

### Step 5: Check All Peers
```bash
# Query from different peers
docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 \
  -e CORE_PEER_LOCALMSPID=Org2MSP \
  cli peer chaincode query \
  -C certificatechannel \
  -n certificate \
  -c '{"function":"queryAllCertificates","Args":[]}'
```

## Fix Applied

1. **Removed silent fallback to memory** - Backend now throws errors instead
2. **Enhanced logging** - Shows exactly what blockchain returns
3. **Better error messages** - User knows when blockchain fails

## Next Steps

1. Restart backend with enhanced logging
2. Create a certificate via UI
3. Check backend logs for:
   - "Querying all certificates from blockchain"
   - "Blockchain query result: ..."
   - Any errors

4. If still empty, check:
   - Chaincode logs for putState
   - CouchDB directly
   - Transaction commit status





