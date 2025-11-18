#!/bin/bash

# Quick fix script for Windows Docker port issues
# This ensures the CLI container is running and network is ready

echo "🔧 Quick Fix for Windows Docker Issues"
echo "======================================"

cd "$(dirname "$0")/.."

# Start all containers
echo ""
echo "1️⃣  Starting all containers..."
docker-compose up -d 2>&1 | grep -E "Starting|Started|Error" | head -10

# Wait for containers
echo ""
echo "2️⃣  Waiting for containers to be ready..."
sleep 20

# Check CLI
echo ""
echo "3️⃣  Checking CLI container..."
if docker ps | grep -q "cli"; then
    echo "✅ CLI is running"
else
    echo "⚠️  CLI not running, starting it..."
    docker-compose up -d cli
    sleep 10
fi

# Final status
echo ""
echo "4️⃣  Final Status:"
echo "=================="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|cli|peer|orderer" | head -10

echo ""
echo "✅ Done! If CLI is running, you can now use chaincode commands."
echo ""
echo "Test with:"
echo "  docker exec cli peer chaincode query -C certificatechannel -n certificate -c '{\"function\":\"GetAllCertificates\",\"Args\":[]}'"





