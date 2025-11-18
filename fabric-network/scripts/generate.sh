#!/bin/bash

# Set absolute paths
PROJECT_ROOT=~/academic-certificates-platform
export PATH=$PROJECT_ROOT/fabric-samples/bin:$PATH
export FABRIC_CFG_PATH=$PROJECT_ROOT/fabric-network/config

cd $PROJECT_ROOT/fabric-network

echo "Current directory: $(pwd)"
echo "PATH: $PATH"
echo "FABRIC_CFG_PATH: $FABRIC_CFG_PATH"

# Check if tools are available
echo "Checking for cryptogen..."
which cryptogen
echo "Checking for configtxgen..."
which configtxgen

echo "Generating crypto material..."
cryptogen generate --config=./crypto-config.yaml --output="./crypto-config"

if [ $? -ne 0 ]; then
    echo "Error generating crypto material"
    exit 1
fi

echo "Generating genesis block..."
configtxgen -profile ThreeOrgsOrdererGenesis -channelID system-channel -outputBlock ./config/genesis.block

if [ $? -ne 0 ]; then
    echo "Error generating genesis block"
    exit 1
fi

echo "Generating channel creation transaction..."
configtxgen -profile ThreeOrgsChannel -outputCreateChannelTx ./config/channel.tx -channelID certificatechannel

if [ $? -ne 0 ]; then
    echo "Error generating channel transaction"
    exit 1
fi

echo "Generating anchor peer updates..."
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/Org1MSPanchors.tx -channelID certificatechannel -asOrg Org1MSP
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/Org2MSPanchors.tx -channelID certificatechannel -asOrg Org2MSP
configtxgen -profile ThreeOrgsChannel -outputAnchorPeersUpdate ./config/Org3MSPanchors.tx -channelID certificatechannel -asOrg Org3MSP

echo "Setup completed successfully!"
echo "Generated files:"
ls -la config/