#!/bin/bash

# Script to test chaincode invoke after ensuring network is running
# For Windows/WSL2 Docker Desktop

echo "🧪 Testing chaincode invoke..."

cd "$(dirname "$0")/.."

# Check if CLI is running
if ! docker ps | grep -q "cli"; then
    echo "❌ CLI container is not running. Starting it..."
    docker-compose up -d cli
    sleep 10
fi

# Check if channel exists
echo "🔍 Checking if channel exists..."
CHANNEL_EXISTS=$(docker exec cli peer channel list 2>&1 | grep -c "certificatechannel" || echo "0")

if [ "$CHANNEL_EXISTS" -eq "0" ]; then
    echo "⚠️  Channel 'certificatechannel' not found. Creating it..."
    ./scripts/createChannel.sh
    sleep 5
fi

# Test chaincode query first
echo ""
echo "📋 Testing chaincode query..."
docker exec cli peer chaincode query \
    -C certificatechannel \
    -n certificate \
    -c '{"function":"GetAllCertificates","Args":[]}' 2>&1 | head -30

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Chaincode query successful!"
    echo ""
    echo "🧪 Now testing chaincode invoke..."
    
    # Test create certificate
    CERT_ID="TEST_$(date +%s)"
    CERT_DATA='{"id":"'$CERT_ID'","studentId":"STU001","studentName":"Test Student","course":"Test Course","grade":"A","issuedAt":"2025-01-15T00:00:00.000Z"}'
    
    echo "Creating certificate: $CERT_ID"
    docker exec cli peer chaincode invoke \
        -o orderer.example.com:7050 \
        -C certificatechannel \
        -n certificate \
        --peerAddresses peer0.org1.example.com:7051 \
        -c '{"function":"createCertificate","Args":["'$(echo $CERT_DATA | sed 's/"/\\"/g')'"]}' 2>&1 | tail -20
    
    echo ""
    echo "✅ Test complete!"
else
    echo ""
    echo "❌ Chaincode query failed. Make sure:"
    echo "   1. Channel is created: ./scripts/createChannel.sh"
    echo "   2. Chaincode is installed and committed"
    echo "   3. All peers are running: docker ps"
fi





