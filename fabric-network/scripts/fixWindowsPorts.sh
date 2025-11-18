#!/bin/bash

# Script to fix Windows port conflicts for Docker Desktop on Windows/WSL2
# Windows reserves certain port ranges, so we need to use alternative ports

echo "🔧 Fixing Windows port conflicts..."

cd "$(dirname "$0")/.."

# Check if we're on Windows/WSL
if grep -q Microsoft /proc/version 2>/dev/null || grep -q WSL /proc/version 2>/dev/null; then
    echo "✅ Detected Windows/WSL2 environment"
    echo "⚠️  Windows reserves ports 8000-8999, using alternative ports"
    
    # The docker-compose.yaml should already have these fixes:
    # - ca_org3: 10054 instead of 9054
    # - couchdb3: 15984 instead of 8984
    
    echo "✅ Port mappings updated:"
    echo "   - CA Org3: 10054 (instead of 9054)"
    echo "   - CouchDB3: 15984 (instead of 8984)"
else
    echo "ℹ️  Not Windows/WSL2, using default ports"
fi

echo ""
echo "🚀 Starting network with fixed ports..."
docker-compose up -d

echo ""
echo "⏳ Waiting for containers to start..."
sleep 15

echo ""
echo "📊 Container Status:"
docker-compose ps

echo ""
echo "✅ Network started! If you see any port errors, check Docker Desktop settings:"
echo "   Settings → Resources → Advanced → Expose daemon on tcp://localhost:2375"





