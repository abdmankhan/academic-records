#!/bin/bash

echo "Creating channel..."
docker exec cli peer channel create -o orderer.example.com:7050 -c certificatechannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/channel.tx

echo "Joining peers to channel..."
# Org1 Peers
docker exec cli peer channel join -b certificatechannel.block
docker exec -e CORE_PEER_ADDRESS=peer1.org1.example.com:8051 cli peer channel join -b certificatechannel.block

# Org2 Peers
docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer channel join -b certificatechannel.block

docker exec -e CORE_PEER_ADDRESS=peer1.org2.example.com:10051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer channel join -b certificatechannel.block

# Org3 Peers
docker exec -e CORE_PEER_ADDRESS=peer0.org3.example.com:11051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer channel join -b certificatechannel.block

docker exec -e CORE_PEER_ADDRESS=peer1.org3.example.com:12051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer channel join -b certificatechannel.block

echo "Updating anchor peers..."
docker exec cli peer channel update -o orderer.example.com:7050 -c certificatechannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/Org1MSPanchors.tx

docker exec -e CORE_PEER_ADDRESS=peer0.org2.example.com:9051 -e CORE_PEER_LOCALMSPID=Org2MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp cli peer channel update -o orderer.example.com:7050 -c certificatechannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/Org2MSPanchors.tx

docker exec -e CORE_PEER_ADDRESS=peer0.org3.example.com:11051 -e CORE_PEER_LOCALMSPID=Org3MSP -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp cli peer channel update -o orderer.example.com:7050 -c certificatechannel -f /opt/gopath/src/github.com/hyperledger/fabric/peer/config/Org3MSPanchors.tx

echo "Channel created and peers joined successfully!"