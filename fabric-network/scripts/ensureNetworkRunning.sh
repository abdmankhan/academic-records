#!/bin/bash

# Script to ensure all Fabric network containers are running
# Specifically for Docker Desktop on Windows/WSL2

echo "🔍 Checking Fabric network status..."

cd "$(dirname "$0")/.."

# Check if containers exist
if ! docker ps -a | grep -q "orderer.example.com"; then
    echo "❌ Network containers not found. Please run: ./scripts/startNetwork.sh"
    exit 1
fi

# Start all containers
echo "🚀 Starting all containers..."
docker-compose up -d

# Wait for containers to be ready
echo "⏳ Waiting for containers to start..."
sleep 15

# Check which containers are running
echo ""
echo "📊 Container Status:"
docker-compose ps

# Check if CLI container is running
if ! docker ps | grep -q "cli"; then
    echo ""
    echo "⚠️  CLI container is not running. Starting it..."
    docker start cli || docker-compose up -d cli
    sleep 5
fi

# Verify CLI is running
if docker ps | grep -q "cli"; then
    echo "✅ CLI container is running"
else
    echo "❌ CLI container failed to start"
    echo "Try manually: docker start cli"
    exit 1
fi

# Check if peers are running
PEER_COUNT=$(docker ps | grep -c "peer.*example.com")
if [ "$PEER_COUNT" -lt 6 ]; then
    echo "⚠️  Warning: Only $PEER_COUNT peers are running (expected 6)"
    echo "Some peers may still be starting. Wait a few more seconds."
else
    echo "✅ All 6 peers are running"
fi

echo ""
echo "✅ Network is ready!"
echo ""
echo "To test the network:"
echo "  docker exec -it cli bash"
echo "  peer chaincode query -C certificatechannel -n certificate -c '{\"function\":\"GetAllCertificates\",\"Args\":[]}'"





