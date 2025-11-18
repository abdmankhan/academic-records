# 🎯 ROOT CAUSE FOUND: Endorsement Policy Failure

## The Real Problem

Peer logs show:
```
ENDORSEMENT_POLICY_FAILURE
'1 sub-policies were satisfied, but this policy requires 2'
```

**The backend is only invoking with 1 peer (Org1), but the endorsement policy requires 2 endorsements from different organizations!**

## What Was Happening

1. ✅ Certificate creation succeeds (status 200)
2. ✅ Transaction is sent to orderer
3. ❌ **Transaction marked as INVALID** during validation (endorsement policy failure)
4. ❌ State is NOT committed (transaction rejected)
5. ❌ Certificates don't persist

## The Fix

Updated backend to invoke with **multiple peers from different organizations**:

**Before:**
```javascript
--peerAddresses peer0.org1.example.com:7051
```

**After:**
```javascript
--peerAddresses peer0.org1.example.com:7051 --peerAddresses peer0.org2.example.com:9051
```

## Solution Applied

Updated `/backend/fabric-client/simpleFabricClient.js` to invoke with:
- `peer0.org1.example.com:7051` (Org1)
- `peer0.org2.example.com:9051` (Org2)

This satisfies the endorsement policy requirement of 2 endorsements.

## Next Steps

1. **Restart Backend:**
   ```bash
   cd /home/abdmankhan/academic-certificates-platform/backend
   npm start
   ```

2. **Create Certificate via UI:**
   - Login as university
   - Create a certificate
   - Check backend logs - should see successful creation

3. **Verify on Blockchain:**
   ```bash
   cd /home/abdmankhan/academic-certificates-platform/fabric-network
   docker exec cli peer chaincode query \
       -C certificatechannel \
       -n certificate \
       -c '{"function":"queryAllCertificates","Args":[]}'
   ```

4. **Check Frontend:**
   - Certificates should now appear in Browse Certificates
   - Blockchain Explorer should show certificates

## Expected Behavior After Fix

1. ✅ Backend invokes with **2 peers** (Org1 + Org2)
2. ✅ **2 endorsements** received
3. ✅ Endorsement policy **satisfied**
4. ✅ Transaction **validated successfully**
5. ✅ State **committed** to blockchain
6. ✅ Certificates **persist** and appear in frontend

## Why This Happened

Hyperledger Fabric's default endorsement policy for a channel with 3 organizations typically requires:
- **Majority of organizations** to endorse
- With 3 orgs, that's **2 out of 3** endorsements required

The backend was only getting 1 endorsement (from Org1), so the policy failed and the transaction was rejected.

## Files Modified
- `/backend/fabric-client/simpleFabricClient.js` - Updated to invoke with multiple peers





