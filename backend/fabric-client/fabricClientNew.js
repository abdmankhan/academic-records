const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');

class FabricClient {
    constructor() {
        this.gateway = null;
        this.network = null;
        this.contract = null;
        this.wallet = null;
        this.connectionProfilePath = path.join(__dirname, 'connection-profile.yaml');
        this.walletPath = path.join(__dirname, 'wallet');
    }

    async init() {
        try {
            // Create wallet
            this.wallet = await Wallets.newFileSystemWallet(this.walletPath);
            
            // Check if admin identity exists
            const adminExists = await this.wallet.get('admin');
            if (!adminExists) {
                await this.enrollAdmin();
            }

            // Connect to gateway
            const connectionProfile = yaml.load(fs.readFileSync(this.connectionProfilePath, 'utf8'));
            this.gateway = new Gateway();
            
            await this.gateway.connect(connectionProfile, {
                wallet: this.wallet,
                identity: 'admin',
                discovery: { enabled: true, asLocalhost: true }
            });

            // Get network and contract
            this.network = await this.gateway.getNetwork('certificatechannel');
            this.contract = this.network.getContract('certificate');

            console.log('Successfully connected to Fabric network');
            return true;
        } catch (error) {
            console.error('Failed to connect to Fabric network:', error);
            return false;
        }
    }

    async enrollAdmin() {
        try {
            // For now, let's use the in-memory approach until we can properly handle the CA enrollment
            // Create a mock admin identity
            const identity = {
                credentials: {
                    certificate: 'mock-cert',
                    privateKey: 'mock-key',
                },
                mspId: 'Org1MSP',
                type: 'X.509',
            };

            await this.wallet.put('admin', identity);
            console.log('Successfully created mock admin identity');
        } catch (error) {
            console.error('Failed to create admin identity:', error);
            throw error;
        }
    }

    async createCertificate(certificateData) {
        try {
            // Submit transaction with JSON string parameter
            const result = await this.contract.submitTransaction(
                'createCertificate',
                JSON.stringify(certificateData)
            );
            
            console.log('Certificate created successfully');
            return JSON.parse(result.toString());
        } catch (error) {
            console.error('Error creating certificate:', error);
            throw error;
        }
    }

    async queryCertificate(id) {
        try {
            const result = await this.contract.evaluateTransaction('queryCertificate', id);
            return JSON.parse(result.toString());
        } catch (error) {
            console.error('Error querying certificate:', error);
            throw error;
        }
    }

    async queryAllCertificates() {
        try {
            const result = await this.contract.evaluateTransaction('queryAllCertificates');
            return JSON.parse(result.toString());
        } catch (error) {
            console.error('Error querying all certificates:', error);
            throw error;
        }
    }

    async disconnect() {
        if (this.gateway) {
            await this.gateway.disconnect();
            console.log('Disconnected from Fabric network');
        }
    }
}

module.exports = FabricClient;