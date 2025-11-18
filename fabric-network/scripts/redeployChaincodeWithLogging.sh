#!/bin/bash

# Quick script to redeploy chaincode with enhanced logging
# This will update the chaincode to include putState verification

echo "🔄 Redeploying Chaincode with Enhanced Logging"
echo "=============================================="

cd "$(dirname "$0")/.."

# Install dependencies
echo ""
echo "1️⃣  Installing chaincode dependencies..."
cd chaincode/certificate
npm install
cd ../..

# Package chaincode
echo ""
echo "2️⃣  Packaging chaincode..."
docker exec cli peer lifecycle chaincode package certificate_2.0.tar.gz \
    --path /opt/gopath/src/github.com/chaincode/certificate \
    --lang node \
    --label certificate_2.0

# Install on Org1 peer0
echo ""
echo "3️⃣  Installing chaincode on peer0.org1..."
docker exec cli peer lifecycle chaincode install certificate_2.0.tar.gz

# Get package ID
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep "certificate_2.0" | cut -d' ' -f3 | cut -d',' -f1)
echo "Package ID: $PACKAGE_ID"

# Approve for Org1
echo ""
echo "4️⃣  Approving chaincode for Org1..."
docker exec cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID certificatechannel \
    --name certificate \
    --version 2.0 \
    --package-id $PACKAGE_ID \
    --sequence 2

# Approve for Org2
echo ""
echo "5️⃣  Approving chaincode for Org2..."
docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 \
    -e CORE_PEER_LOCALMSPID=Org2MSP \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp \
    cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID certificatechannel \
    --name certificate \
    --version 2.0 \
    --package-id $PACKAGE_ID \
    --sequence 2

# Approve for Org3
echo ""
echo "6️⃣  Approving chaincode for Org3..."
docker exec -e CORE_PEER_ADDRESS=peer0.org3.example.com:11051 \
    -e CORE_PEER_LOCALMSPID=Org3MSP \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp \
    cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID certificatechannel \
    --name certificate \
    --version 2.0 \
    --package-id $PACKAGE_ID \
    --sequence 2

# Commit
echo ""
echo "7️⃣  Committing chaincode..."
docker exec cli peer lifecycle chaincode commit \
    -o orderer.example.com:7050 \
    --channelID certificatechannel \
    --name certificate \
    --version 2.0 \
    --sequence 2 \
    --peerAddresses peer0.org1.example.com:7051 \
    --peerAddresses peer0.org2.example.com:9051 \
    --peerAddresses peer0.org3.example.com:11051

echo ""
echo "✅ Chaincode redeployed! Wait 10 seconds for containers to restart..."
sleep 10

echo ""
echo "🧪 Testing certificate creation..."
docker exec -e CORE_PEER_LOCALMSPID=Org1MSP \
    -e CORE_PEER_TLS_ENABLED=false \
    -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp \
    -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 \
    cli peer chaincode invoke \
    -o orderer.example.com:7050 \
    -C certificatechannel \
    -n certificate \
    --peerAddresses peer0.org1.example.com:7051 \
    -c '{"function":"createCertificate","Args":["{\"id\":\"REDEPLOY_TEST\",\"studentId\":\"STU001\",\"studentName\":\"Redeploy Test\",\"course\":\"Test\",\"grade\":\"A\",\"issuedAt\":\"2025-01-15T00:00:00.000Z\"}"]}'

sleep 3

echo ""
echo "🔍 Querying certificate..."
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"queryAllCertificates","Args":[]}'

echo ""
echo "✅ Done! Check chaincode logs for putState verification:"
echo "   docker logs dev-peer0.org1.example.com-certificate_2.0-... | grep putState"





