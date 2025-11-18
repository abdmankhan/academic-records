#!/bin/bash

echo "🚀 Starting Academic Certificates Platform Setup"
echo "================================================"

# Get the absolute path of the project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FABRIC_NETWORK_DIR="$PROJECT_ROOT/fabric-network"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

echo "✅ Docker is running"

# Function to check if Fabric binaries are available
check_fabric_binaries() {
    if ! command -v cryptogen >/dev/null 2>&1 || ! command -v configtxgen >/dev/null 2>&1; then
        echo "⚠️  Fabric binaries not found. Attempting to download..."
        
        # Download and extract Fabric binaries
        cd "$PROJECT_ROOT"
        if [ ! -d "fabric-samples/bin" ]; then
            echo "📥 Downloading Hyperledger Fabric binaries..."
            curl -sSL https://bit.ly/2ysbOFE | bash -s -- 2.4.9 1.5.6
        fi
        
        # Add to PATH
        export PATH="$PROJECT_ROOT/fabric-samples/bin:$PATH"
        
        if ! command -v cryptogen >/dev/null 2>&1; then
            echo "❌ Failed to download Fabric binaries. Please install manually:"
            echo "   https://hyperledger-fabric.readthedocs.io/en/release-2.4/install.html"
            exit 1
        fi
    fi
    echo "✅ Fabric binaries are available"
}

# Function to generate crypto material
generate_crypto_material() {
    echo "🔐 Generating crypto material..."
    cd "$FABRIC_NETWORK_DIR"
    
    # Clean up any existing crypto material
    rm -rf crypto-config
    
    # Set environment variables
    export PATH="$PROJECT_ROOT/fabric-samples/bin:$PATH"
    export FABRIC_CFG_PATH="$FABRIC_NETWORK_DIR/config"
    
    # Run the generate script
    chmod +x scripts/generate.sh
    ./scripts/generate.sh
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to generate crypto material"
        exit 1
    fi
    
    echo "✅ Crypto material generated successfully"
}

# Function to start Fabric network
start_fabric_network() {
    echo "🌐 Starting Hyperledger Fabric network..."
    cd "$FABRIC_NETWORK_DIR"
    
    # Clean up any existing containers
    docker-compose down -v
    docker system prune -f
    
    # Start the network
    chmod +x scripts/startNetwork.sh
    ./scripts/startNetwork.sh
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to start Fabric network"
        exit 1
    fi
    
    echo "✅ Fabric network started successfully"
}

# Function to create channel and deploy chaincode
setup_channel_and_chaincode() {
    echo "📋 Creating channel and deploying chaincode..."
    cd "$FABRIC_NETWORK_DIR"
    
    # Wait for containers to be ready
    echo "⏳ Waiting for containers to be ready..."
    sleep 30
    
    # Create channel
    chmod +x scripts/createChannel.sh
    ./scripts/createChannel.sh
    
    if [ $? -ne 0 ]; then
        echo "❌ Failed to create channel"
        exit 1
    fi
    
    echo "✅ Channel created successfully"
    
    # Package and deploy chaincode
    echo "📦 Packaging chaincode..."
    
    # Install dependencies for chaincode
    cd "$FABRIC_NETWORK_DIR/chaincode/certificate"
    npm install
    cd "$FABRIC_NETWORK_DIR"
    
    # Package chaincode
    docker exec cli peer lifecycle chaincode package certificate.tar.gz \
        --path /opt/gopath/src/github.com/chaincode/certificate \
        --lang node \
        --label certificate_1.0
    
    # Install chaincode on all peers
    echo "📥 Installing chaincode on peers..."
    
    # Install on Org1 peers
    docker exec cli peer lifecycle chaincode install certificate.tar.gz
    docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 cli peer lifecycle chaincode install certificate.tar.gz
    
    # Install on Org2 peers
    docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz
    
    docker exec -e CORE_PEER_ADDRESS=peer1.org2.example.com:10051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz
    
    # Install on Org3 peers
    docker exec -e CORE_PEER_ADDRESS=peer0.org3.example.com:11051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz
    
    docker exec -e CORE_PEER_ADDRESS=peer1.org3.example.com:12051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer lifecycle chaincode install certificate.tar.gz
    
    # Get package ID
    PACKAGE_ID=$(docker exec cli peer lifecycle chaincode queryinstalled | grep "certificate_1.0" | cut -d' ' -f3 | cut -d',' -f1)
    echo "📋 Package ID: $PACKAGE_ID"
    
    # Approve chaincode for each org
    echo "✅ Approving chaincode..."
    
    # Approve for Org1
    docker exec cli peer lifecycle chaincode approveformyorg \
        -o orderer.example.com:7050 \
        --channelID certificatechannel \
        --name certificate \
        --version 1.0 \
        --package-id $PACKAGE_ID \
        --sequence 1
    
    # Approve for Org2
    docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer lifecycle chaincode approveformyorg \
        -o orderer.example.com:7050 \
        --channelID certificatechannel \
        --name certificate \
        --version 1.0 \
        --package-id $PACKAGE_ID \
        --sequence 1
    
    # Approve for Org3
    docker exec -e CORE_PEER_ADDRESS=peer0.org3.example.com:11051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer lifecycle chaincode approveformyorg \
        -o orderer.example.com:7050 \
        --channelID certificatechannel \
        --name certificate \
        --version 1.0 \
        --package-id $PACKAGE_ID \
        --sequence 1
    
    # Commit chaincode
    echo "🚀 Committing chaincode..."
    docker exec cli peer lifecycle chaincode commit \
        -o orderer.example.com:7050 \
        --channelID certificatechannel \
        --name certificate \
        --version 1.0 \
        --sequence 1 \
        --peerAddresses peer0.org1.example.com:7051 \
        --peerAddresses peer0.org2.example.com:9051 \
        --peerAddresses peer0.org3.example.com:11051
    
    # Initialize ledger
    echo "🔧 Initializing ledger..."
    docker exec cli peer chaincode invoke \
        -o orderer.example.com:7050 \
        -C certificatechannel \
        -n certificate \
        -c '{"function":"InitLedger","Args":[]}'
    
    echo "✅ Chaincode deployed and initialized successfully"
}

# Function to install backend dependencies and start
setup_backend() {
    echo "🔧 Setting up backend..."
    cd "$BACKEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing backend dependencies..."
        npm install
    fi
    
    echo "✅ Backend dependencies installed"
}

# Function to install frontend dependencies and start
setup_frontend() {
    echo "🎨 Setting up frontend..."
    cd "$FRONTEND_DIR"
    
    if [ ! -d "node_modules" ]; then
        echo "📥 Installing frontend dependencies..."
        npm install
    fi
    
    echo "✅ Frontend dependencies installed"
}

# Main execution
main() {
    echo "🏁 Starting complete platform setup..."
    
    # Step 1: Check prerequisites
    check_fabric_binaries
    
    # Step 2: Generate crypto material
    generate_crypto_material
    
    # Step 3: Start Fabric network
    start_fabric_network
    
    # Step 4: Setup channel and deploy chaincode
    setup_channel_and_chaincode
    
    # Step 5: Setup backend
    setup_backend
    
    # Step 6: Setup frontend
    setup_frontend
    
    echo ""
    echo "🎉 Academic Certificates Platform setup completed successfully!"
    echo ""
    echo "📋 Services Status:"
    echo "   • Hyperledger Fabric Network: ✅ Running"
    echo "   • Orderer: localhost:7050"
    echo "   • Org1 Peer0: localhost:7051"
    echo "   • Org2 Peer0: localhost:9051"
    echo "   • Org3 Peer0: localhost:11051"
    echo "   • CouchDB Instances: 5984, 6984, 7984, 8984, 9984, 10984"
    echo ""
    echo "🚀 To start the application servers:"
    echo "   Backend:  cd $BACKEND_DIR && npm start"
    echo "   Frontend: cd $FRONTEND_DIR && npm start"
    echo ""
    echo "🌐 Access URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:5000"
    echo "   Health:   http://localhost:5000/api/health"
}

# Run main function
main