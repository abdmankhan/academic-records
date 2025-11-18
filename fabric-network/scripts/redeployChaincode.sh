#!/bin/bash

# Script to redeploy chaincode with latest code
# This ensures the chaincode has the latest role-based access control

echo "🔄 Redeploying Chaincode with Latest Code"
echo "=========================================="

cd "$(dirname "$0")/.."

# Install chaincode dependencies
echo ""
echo "1️⃣  Installing chaincode dependencies..."
cd chaincode/certificate
npm install
cd ../..

# Package chaincode
echo ""
echo "2️⃣  Packaging chaincode..."
docker exec cli peer lifecycle chaincode package certificate.tar.gz \
    --path /opt/gopath/src/github.com/chaincode/certificate \
    --lang node \
    --label certificate_2.0

# Install on all peers
echo ""
echo "3️⃣  Installing chaincode on all peers..."

# Org1
docker exec cli peer lifecycle chaincode install certificate.tar.gz
docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 cli peer lifecycle chaincode install certificate.tar.gz

# Org2
docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz
docker exec -e CORE_PEER_ADDRESS=peer1.org2.example.com:10051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz

# Org3
docker exec -e CORE_PEER_ADDRESS=peer0.org3.example.com:11051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz
docker exec -e CORE_PEER_ADDRESS=peer1.org3.example.com:12051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz

# Get package ID
echo ""
echo "4️⃣  Getting package ID..."
PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep "certificate_2.0" | cut -d' ' -f3 | cut -d',' -f1)
echo "Package ID: $PACKAGE_ID"

# Approve for all orgs
echo ""
echo "5️⃣  Approving chaincode for all organizations..."

# Org1
docker exec cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID certificatechannel \
    --name certificate \
    --version 2.0 \
    --package-id $PACKAGE_ID \
    --sequence 2

# Org2
docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID certificatechannel \
    --name certificate \
    --version 2.0 \
    --package-id $PACKAGE_ID \
    --sequence 2

# Org3
docker exec -e CORE_PEER_ADDRESS=peer0.org3.example.com:11051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer lifecycle chaincode approveformyorg \
    -o orderer.example.com:7050 \
    --channelID certificatechannel \
    --name certificate \
    --version 2.0 \
    --package-id $PACKAGE_ID \
    --sequence 2

# Commit
echo ""
echo "6️⃣  Committing chaincode..."
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
echo "✅ Chaincode redeployed successfully!"
echo ""
echo "Test with:"
echo "  docker exec cli peer chaincode query -C certificatechannel -n certificate -c '{\"function\":\"queryAllCertificates\",\"Args\":[]}'"





