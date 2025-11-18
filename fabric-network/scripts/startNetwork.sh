#!/bin/bash

echo "Starting Fabric network..."
docker-compose up -d

echo "Waiting for network to start..."
sleep 10

echo "Network started successfully!"
echo "Orderer: localhost:7050"
echo "Peer0 Org1: localhost:7051"
echo "Peer1 Org1: localhost:8051"
echo "Peer0 Org2: localhost:9051"
echo "Peer1 Org2: localhost:10051"
echo "Peer0 Org3: localhost:11051"
echo "Peer1 Org3: localhost:12051"