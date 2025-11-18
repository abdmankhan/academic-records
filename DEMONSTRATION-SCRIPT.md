# Demonstration Script for Professor

## 🎯 Quick Demo Flow

### Step 1: Show It's a Private Blockchain (2 minutes)

```bash
cd /home/abdmankhan/academic-certificates-platform/fabric-network
./scripts/blockchainProof.sh
```

**What to say:**
- "This is a **private/consortium blockchain** with 3 organizations"
- "Only authorized organizations (University, Student Registry, Verification Authority) can join"
- "Unlike public blockchains like Bitcoin, this is permissioned"

### Step 2: Show Certificate Creation on Blockchain (3 minutes)

1. **Login as University** (university/universitypw)
2. **Create a certificate** via UI
3. **Immediately show it on blockchain:**

```bash
# In terminal, run:
cd /home/abdmankhan/academic-certificates-platform/fabric-network
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'
```

**What to say:**
- "The certificate is now stored on the blockchain"
- "It's distributed across 6 peers in 3 organizations"
- "It cannot be deleted or altered"

### Step 3: Show Blockchain Explorer (2 minutes)

1. **Open "Blockchain Explorer"** in the UI (new menu item)
2. **Show real-time certificate count**
3. **Explain:**
   - "This shows all certificates on the blockchain"
   - "Updates in real-time as new certificates are added"
   - "Each certificate has a unique blockchain key"

### Step 4: Show Certificate History (Immutability) (2 minutes)

1. **Click on any certificate** in the browse page
2. **Show transaction history:**
   - Every create/update transaction
   - Timestamps
   - Transaction IDs
   - Immutable audit trail

**What to say:**
- "Every transaction is permanently recorded"
- "You can see the complete history"
- "This proves immutability - nothing can be deleted"

### Step 5: Show Multi-Organization Consensus (2 minutes)

```bash
# Query from different organization peers
# Show they all have the same data
docker exec -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
  -e CORE_PEER_LOCALMSPID=Org1MSP cli \
  peer chaincode query -C certificatechannel -n certificate \
  -c '{"function":"queryAllCertificates","Args":[]}'

docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 \
  -e CORE_PEER_LOCALMSPID=Org2MSP cli \
  peer chaincode query -C certificatechannel -n certificate \
  -c '{"function":"queryAllCertificates","Args":[]}'
```

**What to say:**
- "All organizations have the same data"
- "This is distributed consensus"
- "If one peer fails, others have the data"

## 🔍 Troubleshooting: Certificates Not Showing

### Issue: Created certificates don't appear in UI

**Possible Causes:**
1. Backend not connected to blockchain
2. Chaincode not installed
3. Response parsing issue

**Quick Fix:**
```bash
# 1. Check if chaincode is installed
docker exec cli peer lifecycle chaincode querycommitted \
    -C certificatechannel -n certificate

# 2. Test direct blockchain query
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'

# 3. Check backend logs
cd /home/abdmankhan/academic-certificates-platform/backend
tail -f backend.log
```

**If blockchain returns empty:**
- Certificates might not be created on blockchain
- Check backend is using blockchain (not in-memory)
- Verify chaincode is installed and committed

## 📊 Key Points to Emphasize

1. **Private Blockchain:**
   - Only 3 authorized organizations
   - Permissioned access
   - Not public like Bitcoin

2. **Immutability:**
   - Certificates cannot be deleted
   - Full transaction history
   - Cryptographic proof

3. **Distributed:**
   - 6 peers across 3 organizations
   - Data replicated
   - Consensus mechanism

4. **Real-time:**
   - Blockchain Explorer updates live
   - New certificates appear immediately
   - All organizations see same data

## 🎬 Presentation Flow (10 minutes total)

1. **Introduction** (1 min): "This is a blockchain-based certificate system"
2. **Show Network** (2 min): Run blockchainProof.sh
3. **Create Certificate** (2 min): Via UI, show it appears on blockchain
4. **Show Explorer** (2 min): Blockchain Explorer page
5. **Show History** (2 min): Certificate transaction history
6. **Show Consensus** (1 min): Query from different peers

## ✅ Checklist Before Presentation

- [ ] Network is running (`docker ps` shows all containers)
- [ ] Channel exists (`docker exec cli peer channel list`)
- [ ] Chaincode is installed
- [ ] Backend is running (`cd backend && npm start`)
- [ ] Frontend is running (`cd frontend && npm start`)
- [ ] Test certificate creation works
- [ ] Blockchain Explorer page loads
- [ ] Certificate history shows transactions





