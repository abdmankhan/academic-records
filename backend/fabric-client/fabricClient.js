const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

// In-memory database for certificates (persists during session)
const certificatesDB = new Map();
const certificateHistory = new Map();

// Initialize with sample certificates
const initializeSampleCertificates = () => {
    if (certificatesDB.size === 0) {
        const sampleCerts = [
            {
                id: 'CERT1',
                studentId: 'STU001',
                studentName: 'Alice Johnson',
                course: 'Blockchain Development',
                grade: 'A',
                issuedAt: '2025-01-15T00:00:00.000Z',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            },
            {
                id: 'CERT2',
                studentId: 'STU002',
                studentName: 'Bob Smith',
                course: 'Data Science',
                grade: 'B',
                issuedAt: '2025-01-20T00:00:00.000Z',
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        ];
        
        sampleCerts.forEach(cert => {
            certificatesDB.set(cert.id, cert);
            certificateHistory.set(cert.id, [{
                txId: `init-${cert.id}`,
                timestamp: cert.createdAt,
                isDelete: false,
                value: JSON.stringify(cert),
                action: 'CREATE'
            }]);
        });
        
        console.log(`✅ Initialized ${sampleCerts.length} sample certificates in memory`);
    }
};

// Initialize sample data
initializeSampleCertificates();

class FabricClient {
    constructor() {
        this.gateway = new Gateway();
        this.wallet = null;
        this.network = null;
        this.contract = null;
        this.isConnected = false;
        
        // Configuration
        this.channelName = process.env.FABRIC_CHANNEL_NAME || 'certificatechannel';
        this.chaincodeName = process.env.FABRIC_CHAINCODE_NAME || 'certificate';
        this.mspId = process.env.ORG_MSP_ID || 'Org1MSP';
        this.walletPath = path.resolve(__dirname, process.env.FABRIC_WALLET_PATH || './wallet');
        this.connectionProfilePath = path.resolve(__dirname, process.env.FABRIC_CONNECTION_PROFILE || './connection-profile.yaml');
    }

    async initialize() {
        try {
            // Create wallet
            this.wallet = await Wallets.newFileSystemWallet(this.walletPath);
            
            // Check if admin user exists in wallet
            const adminIdentity = await this.wallet.get('admin');
            if (!adminIdentity) {
                console.log('Admin identity not found, creating one...');
                await this.enrollAdmin();
            }

            console.log('✅ Fabric client initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize Fabric client:', error);
            throw error;
        }
    }

    async enrollAdmin() {
        try {
            // Simple admin identity for development
            const adminIdentity = {
                credentials: {
                    certificate: '-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----',
                    privateKey: '-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----',
                },
                mspId: this.mspId,
                type: 'X.509',
            };

            await this.wallet.put('admin', adminIdentity);
            console.log('✅ Admin user enrolled and stored in wallet');
        } catch (error) {
            console.error('❌ Failed to enroll admin user:', error);
            // Don't throw error, allow to continue for development
            console.log('⚠️ Continuing without admin enrollment for development mode');
        }
    }

    async connect(userId = 'admin') {
        try {
            if (this.isConnected) {
                return;
            }

            // For development, create a simple connection profile
            const connectionProfile = {
                name: 'academic-certificates-network',
                version: '1.0.0',
                client: {
                    organization: 'org1'
                },
                organizations: {
                    org1: {
                        mspid: 'Org1MSP',
                        peers: ['peer0.org1.example.com']
                    }
                },
                peers: {
                    'peer0.org1.example.com': {
                        url: 'grpc://localhost:7051'
                    }
                }
            };

            // Create gateway connection options
            const connectionOptions = {
                wallet: this.wallet,
                identity: userId,
                discovery: { enabled: true, asLocalhost: true }
            };

            // Connect to gateway
            await this.gateway.connect(connectionProfile, connectionOptions);
            
            // Get network and contract
            this.network = await this.gateway.getNetwork(this.channelName);
            this.contract = this.network.getContract(this.chaincodeName);
            
            this.isConnected = true;
            console.log(`✅ Connected to Fabric network as ${userId}`);
        } catch (error) {
            console.error('❌ Failed to connect to Fabric network:', error);
            // For development, create mock responses
            console.log('⚠️ Running in mock mode for development');
            this.isConnected = false;
        }
    }

    async disconnect() {
        try {
            if (this.gateway && this.isConnected) {
                this.gateway.disconnect();
                this.isConnected = false;
                console.log('✅ Disconnected from Fabric network');
            }
        } catch (error) {
            console.error('❌ Failed to disconnect from Fabric network:', error);
        }
    }

    // Certificate management functions with persistent in-memory storage
    async createCertificate(certificateData) {
        try {
            if (this.isConnected && this.contract) {
                const result = await this.contract.submitTransaction('CreateCertificate', JSON.stringify(certificateData));
                return JSON.parse(result.toString());
            } else {
                // Store in memory database for development
                const now = new Date().toISOString();
                const certificate = {
                    ...certificateData,
                    createdAt: now,
                    lastModified: now
                };
                
                // Check if certificate already exists
                if (certificatesDB.has(certificate.id)) {
                    throw new Error(`Certificate ${certificate.id} already exists`);
                }
                
                certificatesDB.set(certificate.id, certificate);
                
                // Add to history
                const historyEntry = {
                    txId: `create-${certificate.id}-${Date.now()}`,
                    timestamp: now,
                    isDelete: false,
                    value: JSON.stringify(certificate),
                    action: 'CREATE'
                };
                
                if (!certificateHistory.has(certificate.id)) {
                    certificateHistory.set(certificate.id, []);
                }
                certificateHistory.get(certificate.id).push(historyEntry);
                
                console.log(`✅ Certificate ${certificate.id} stored in memory database`);
                return certificate;
            }
        } catch (error) {
            console.error('❌ Failed to create certificate:', error);
            throw error;
        }
    }

    async getCertificate(certificateId) {
        try {
            if (this.isConnected && this.contract) {
                const result = await this.contract.evaluateTransaction('GetCertificate', certificateId);
                return JSON.parse(result.toString());
            } else {
                // Retrieve from memory database
                const certificate = certificatesDB.get(certificateId);
                if (!certificate) {
                    throw new Error(`Certificate ${certificateId} does not exist`);
                }
                console.log(`📋 Retrieved certificate ${certificateId} from memory database`);
                return certificate;
            }
        } catch (error) {
            console.error('❌ Failed to get certificate:', error);
            throw error;
        }
    }

    async updateCertificate(certificateId, updateData) {
        try {
            if (this.isConnected && this.contract) {
                const result = await this.contract.submitTransaction('UpdateCertificate', certificateId, JSON.stringify(updateData));
                return JSON.parse(result.toString());
            } else {
                // Update in memory database
                const existingCert = certificatesDB.get(certificateId);
                if (!existingCert) {
                    throw new Error(`Certificate ${certificateId} does not exist`);
                }
                
                const now = new Date().toISOString();
                const updatedCert = {
                    ...existingCert,
                    ...updateData,
                    lastModified: now
                };
                
                certificatesDB.set(certificateId, updatedCert);
                
                // Add to history
                const historyEntry = {
                    txId: `update-${certificateId}-${Date.now()}`,
                    timestamp: now,
                    isDelete: false,
                    value: JSON.stringify(updatedCert),
                    action: 'UPDATE'
                };
                
                certificateHistory.get(certificateId).push(historyEntry);
                
                console.log(`✅ Certificate ${certificateId} updated in memory database`);
                return updatedCert;
            }
        } catch (error) {
            console.error('❌ Failed to update certificate:', error);
            throw error;
        }
    }

    async deleteCertificate(certificateId) {
        try {
            if (this.isConnected && this.contract) {
                await this.contract.submitTransaction('DeleteCertificate', certificateId);
                return { success: true, message: 'Certificate deleted successfully' };
            } else {
                // Delete from memory database
                if (!certificatesDB.has(certificateId)) {
                    throw new Error(`Certificate ${certificateId} does not exist`);
                }
                
                const certificate = certificatesDB.get(certificateId);
                certificatesDB.delete(certificateId);
                
                // Add to history
                const now = new Date().toISOString();
                const historyEntry = {
                    txId: `delete-${certificateId}-${Date.now()}`,
                    timestamp: now,
                    isDelete: true,
                    value: JSON.stringify(certificate),
                    action: 'DELETE'
                };
                
                if (certificateHistory.has(certificateId)) {
                    certificateHistory.get(certificateId).push(historyEntry);
                }
                
                console.log(`✅ Certificate ${certificateId} deleted from memory database`);
                return { success: true, message: 'Certificate deleted successfully' };
            }
        } catch (error) {
            console.error('❌ Failed to delete certificate:', error);
            throw error;
        }
    }

    async getAllCertificates() {
        try {
            if (this.isConnected && this.contract) {
                const result = await this.contract.evaluateTransaction('GetAllCertificates');
                return JSON.parse(result.toString());
            } else {
                // Return from memory database in Fabric format
                const certificates = Array.from(certificatesDB.entries()).map(([key, record]) => ({
                    Key: key,
                    Record: record
                }));
                console.log(`📋 Retrieved ${certificates.length} certificates from memory database`);
                return certificates;
            }
        } catch (error) {
            console.error('❌ Failed to get all certificates:', error);
            throw error;
        }
    }

    async getCertificatesByStudent(studentId) {
        try {
            if (this.isConnected && this.contract) {
                const result = await this.contract.evaluateTransaction('GetCertificatesByStudent', studentId);
                return JSON.parse(result.toString());
            } else {
                // Filter from memory database
                const studentCertificates = Array.from(certificatesDB.values())
                    .filter(cert => cert.studentId === studentId);
                console.log(`📋 Found ${studentCertificates.length} certificates for student ${studentId}`);
                return studentCertificates;
            }
        } catch (error) {
            console.error('❌ Failed to get certificates by student:', error);
            throw error;
        }
    }

    async verifyCertificate(certificateId, verificationData) {
        try {
            if (this.isConnected && this.contract) {
                const result = await this.contract.evaluateTransaction('VerifyCertificate', certificateId, JSON.stringify(verificationData));
                return JSON.parse(result.toString());
            } else {
                // Verify from memory database
                const certificate = certificatesDB.get(certificateId);
                if (!certificate) {
                    return { valid: false, reason: 'Certificate not found' };
                }
                
                // If verification fields provided, ensure they match
                for (const key of Object.keys(verificationData || {})) {
                    if (certificate[key] !== verificationData[key]) {
                        return { valid: false, reason: `${key} does not match` };
                    }
                }
                
                console.log(`✅ Certificate ${certificateId} verified from memory database`);
                return { valid: true, certificate };
            }
        } catch (error) {
            console.error('❌ Failed to verify certificate:', error);
            throw error;
        }
    }

    async getCertificateHistory(certificateId) {
        try {
            if (this.isConnected && this.contract) {
                const result = await this.contract.evaluateTransaction('GetCertificateHistory', certificateId);
                return JSON.parse(result.toString());
            } else {
                // Return history from memory database
                const history = certificateHistory.get(certificateId) || [];
                console.log(`📋 Retrieved ${history.length} history entries for certificate ${certificateId}`);
                return history;
            }
        } catch (error) {
            console.error('❌ Failed to get certificate history:', error);
            throw error;
        }
    }

    // Helper methods for development
    getStorageStats() {
        return {
            totalCertificates: certificatesDB.size,
            certificates: Array.from(certificatesDB.keys()),
            historyEntries: Array.from(certificateHistory.entries()).reduce((total, [_, history]) => total + history.length, 0)
        };
    }

    clearStorage() {
        const beforeCount = certificatesDB.size;
        certificatesDB.clear();
        certificateHistory.clear();
        initializeSampleCertificates();
        console.log(`🗑️ Cleared ${beforeCount} certificates, reinitialized with samples`);
        return this.getStorageStats();
    }
}

// Export singleton instance
module.exports = new FabricClient();
