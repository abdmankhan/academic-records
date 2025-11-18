# 🎯 ROOT CAUSE FOUND!

## The Problem
Certificates are created successfully but NOT persisting on the blockchain.

## Root Cause: Non-Deterministic Timestamps

The chaincode uses:
```javascript
certificate.createdAt = new Date().toISOString();
certificate.lastModified = new Date().toISOString();
```

**This is NON-DETERMINISTIC!** Different peers generate different timestamps, causing:
1. **Endorsement mismatches** - Each peer creates different certificate data
2. **Transaction invalidation** - Orderer rejects mismatched endorsements
3. **State not persisted** - Transaction never commits

## The Fix

Use the transaction timestamp instead (deterministic across all peers):
```javascript
const txTimestamp = ctx.stub.getTxTimestamp();
const txDate = new Date(txTimestamp.seconds.toNumber() * 1000);
certificate.createdAt = txDate.toISOString();
certificate.lastModified = txDate.toISOString();
```

## Solution Steps

### Step 1: Redeploy Chaincode
```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
./scripts/redeployChaincodeWithLogging.sh
```

This will redeploy with:
- ✅ Deterministic timestamps (using `getTxTimestamp()`)
- ✅ Enhanced logging
- ✅ Better error handling

### Step 2: Test Certificate Creation
After redeploy, create a certificate via UI. It should now:
- ✅ Be created successfully
- ✅ Persist on blockchain
- ✅ Appear in Browse Certificates
- ✅ Be queryable

### Step 3: Verify
```bash
# Query all certificates
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'

# Should show your certificates!
```

## Why This Happens

In Hyperledger Fabric:
1. **Transaction is sent to multiple peers** for endorsement
2. **Each peer executes chaincode independently**
3. **If results differ** → Endorsement mismatch → Transaction rejected
4. **State never written** → Certificates don't persist

Using `new Date()` causes each peer to generate a different timestamp, leading to different certificate data and endorsement mismatch.

## Expected Behavior After Fix

1. ✅ All peers generate **same timestamp** (from transaction)
2. ✅ All peers create **same certificate data**
3. ✅ Endorsements **match**
4. ✅ Transaction **commits successfully**
5. ✅ State **persists** on blockchain
6. ✅ Certificates **appear** in frontend

## Files Modified
- `/fabric-network/chaincode/certificate/index.js` - Changed to use `getTxTimestamp()`





