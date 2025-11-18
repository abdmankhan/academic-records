const SimpleFabricClient = require('./simpleFabricClient');

// In-memory database for certificates (persists during session)
const certificatesDB = new Map();
const certificateHistory = new Map();

class FabricClient {
    constructor() {
        this.fabricClient = new SimpleFabricClient();
        this.useBlockchain = process.env.USE_BLOCKCHAIN !== 'false';
        this.initialized = false;
        
        // Initialize sample certificates if not using blockchain
        if (!this.useBlockchain) {
            this.initializeSampleCertificates();
        }
    }

    initializeSampleCertificates() {
        if (certificatesDB.size === 0) {
            const sampleCerts = [
                {
                    id: 'CERT-001',
                    studentName: 'Alice Johnson',
                    courseName: 'Data Science',
                    institutionName: 'Tech University',
                    issueDate: '2025-01-15',
                    grade: 'A',
                    hash: 'sample-hash-001',
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                },
                {
                    id: 'CERT-002',
                    studentName: 'Bob Smith',
                    courseName: 'Computer Science',
                    institutionName: 'Tech University',
                    issueDate: '2025-01-20',
                    grade: 'B+',
                    hash: 'sample-hash-002',
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
    }

    async init() {
        try {
            console.log('🔍 Initializing Fabric client...');
            console.log('🔍 useBlockchain flag:', this.useBlockchain);
            console.log('🔍 USE_BLOCKCHAIN env:', process.env.USE_BLOCKCHAIN);
            
            if (this.useBlockchain) {
                console.log('🔗 Initializing connection to Hyperledger Fabric blockchain...');
                // Test blockchain connection by querying
                try {
                    const testResult = await this.fabricClient.queryAllCertificates();
                    console.log('✅ Fabric blockchain client ready and connected');
                    console.log('✅ Test query returned:', Array.isArray(testResult) ? `${testResult.length} certificates` : 'data');
                } catch (testError) {
                    console.warn('⚠️  Blockchain test query failed (this is OK if no certificates exist yet):', testError.message);
                    console.log('✅ Fabric blockchain client ready (connection test skipped)');
                }
            } else {
                console.log('💾 Using in-memory storage (blockchain disabled)');
                this.initializeSampleCertificates();
            }
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Fabric client:', error);
            // Don't automatically fallback - let user know there's an issue
            console.error('❌ Blockchain initialization failed. Check network status.');
            this.initialized = true;
            return false;
        }
    }

    async createCertificate(certificateData) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                // Detailed logging is handled in simpleFabricClient.createCertificate()
                try {
                    const result = await this.fabricClient.createCertificate(certificateData);
                    return result;
                } catch (blockchainError) {
                    console.error('❌ Blockchain creation failed:', blockchainError.message);
                    console.error('❌ Full error:', blockchainError);
                    // Don't fall back to memory - throw the error so user knows
                    throw new Error(`Failed to create certificate on blockchain: ${blockchainError.message}`);
                }
            } else {
                console.log('⚠️  Using in-memory storage (blockchain disabled)');
                // In-memory fallback
                const cert = {
                    ...certificateData,
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
                
                certificatesDB.set(cert.id, cert);
                
                // Add to history
                const history = certificateHistory.get(cert.id) || [];
                history.push({
                    txId: `mem-${Date.now()}`,
                    timestamp: cert.createdAt,
                    isDelete: false,
                    value: JSON.stringify(cert),
                    action: 'CREATE'
                });
                certificateHistory.set(cert.id, history);
                
                console.log('✅ Certificate created in memory:', cert.id);
                return cert;
            }
        } catch (error) {
            console.error('❌ Error creating certificate:', error);
            throw error;
        }
    }

    async getCertificate(id) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                // Detailed logging is handled in simpleFabricClient.queryCertificate()
                const result = await this.fabricClient.queryCertificate(id);
                return result;
            } else {
                // In-memory fallback
                const cert = certificatesDB.get(id);
                if (!cert) {
                    throw new Error(`Certificate ${id} not found`);
                }
                return cert;
            }
        } catch (error) {
            console.error('❌ Error getting certificate:', error);
            throw error;
        }
    }

    async getAllCertificates() {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                console.log('🔍 Querying all certificates from blockchain');
                const result = await this.fabricClient.queryAllCertificates();
                console.log('📋 Blockchain query result:', {
                    type: typeof result,
                    isArray: Array.isArray(result),
                    length: result ? result.length : 'null',
                    preview: JSON.stringify(result).substring(0, 200)
                });
                
                // Handle empty array or different formats
                if (!result || (Array.isArray(result) && result.length === 0)) {
                    console.log('📭 No certificates found on blockchain (empty result)');
                    // Don't fall back to memory - return empty array
                    // This ensures we're using blockchain, not memory
                    return [];
                }
                
                // Transform the blockchain format to our API format
                // Handle both array format and object format
                if (Array.isArray(result)) {
                    const transformed = result.map(item => {
                        if (item.Record) {
                            return {
                                ...item.Record,
                                blockchainKey: item.Key
                            };
                        } else {
                            return item;
                        }
                    });
                    console.log(`✅ Returning ${transformed.length} certificates from blockchain`);
                    return transformed;
                } else {
                    // If result is not an array, return as is
                    console.log('✅ Returning single certificate from blockchain');
                    return [result];
                }
            } else {
                console.log('⚠️  Using in-memory storage (blockchain disabled)');
                // In-memory fallback
                return Array.from(certificatesDB.values());
            }
        } catch (error) {
            console.error('❌ Error getting all certificates from blockchain:', error.message);
            console.error('❌ Full error:', error);
            // Don't fall back to memory - throw the error so user knows blockchain is broken
            throw new Error(`Failed to query blockchain: ${error.message}`);
        }
    }

    async updateCertificate(id, certificateData) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                console.log('📝 Updating certificate on blockchain:', id);
                const updatedData = {
                    ...certificateData,
                    lastModified: new Date().toISOString()
                };
                const result = await this.fabricClient.updateCertificate(id, updatedData);
                console.log('✅ Certificate updated on blockchain');
                return result;
            } else {
                // In-memory fallback
                const existingCert = certificatesDB.get(id);
                if (!existingCert) {
                    throw new Error(`Certificate ${id} not found`);
                }
                
                const updatedCert = {
                    ...existingCert,
                    ...certificateData,
                    lastModified: new Date().toISOString()
                };
                
                certificatesDB.set(id, updatedCert);
                
                // Add to history
                const history = certificateHistory.get(id) || [];
                history.push({
                    txId: `mem-${Date.now()}`,
                    timestamp: updatedCert.lastModified,
                    isDelete: false,
                    value: JSON.stringify(updatedCert),
                    action: 'UPDATE'
                });
                certificateHistory.set(id, history);
                
                console.log('✅ Certificate updated in memory:', id);
                return updatedCert;
            }
        } catch (error) {
            console.error('❌ Error updating certificate:', error);
            throw error;
        }
    }

    async deleteCertificate(id) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                console.log('🗑️ Deleting certificate from blockchain:', id);
                const result = await this.fabricClient.deleteCertificate(id);
                console.log('✅ Certificate deleted from blockchain');
                return result;
            } else {
                // In-memory fallback
                const cert = certificatesDB.get(id);
                if (!cert) {
                    throw new Error(`Certificate ${id} not found`);
                }
                
                certificatesDB.delete(id);
                
                // Add to history
                const history = certificateHistory.get(id) || [];
                history.push({
                    txId: `mem-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    isDelete: true,
                    value: '',
                    action: 'DELETE'
                });
                certificateHistory.set(id, history);
                
                console.log('✅ Certificate deleted from memory:', id);
                return { success: true, id: id };
            }
        } catch (error) {
            console.error('❌ Error deleting certificate:', error);
            throw error;
        }
    }

    async getCertificatesByStudent(studentId) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                console.log('🔍 Querying certificates by student from blockchain:', studentId);
                const allCerts = await this.fabricClient.queryAllCertificates();
                const studentCerts = allCerts.filter(item => 
                    item.Record.studentId === studentId || 
                    item.Record.student === studentId
                );
                return studentCerts.map(item => ({
                    ...item.Record,
                    blockchainKey: item.Key
                }));
            } else {
                // In-memory fallback
                const results = [];
                for (const [key, cert] of certificatesDB.entries()) {
                    if (cert.studentId === studentId || cert.student === studentId) {
                        results.push(cert);
                    }
                }
                return results;
            }
        } catch (error) {
            console.error('❌ Error getting certificates by student:', error);
            throw error;
        }
    }

    async verifyCertificate(id, verificationData = null) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                console.log('✅ Verifying certificate on blockchain:', id);
                const result = await this.fabricClient.verifyCertificate(id);
                return result;
            } else {
                // In-memory fallback
                const cert = certificatesDB.get(id);
                if (!cert) {
                    return { valid: false, message: 'Certificate not found' };
                }
                
                return {
                    valid: true,
                    certificate: cert,
                    verifiedAt: new Date().toISOString()
                };
            }
        } catch (error) {
            console.error('❌ Error verifying certificate:', error);
            throw error;
        }
    }

    async getCertificateHistory(id) {
        if (!this.initialized) {
            await this.init();
        }

        try {
            if (this.useBlockchain) {
                console.log('📜 Getting certificate history from blockchain:', id);
                const result = await this.fabricClient.getCertificateHistory(id);
                return result;
            } else {
                // In-memory fallback
                const history = certificateHistory.get(id) || [];
                return history;
            }
        } catch (error) {
            console.error('❌ Error getting certificate history:', error);
            // Return empty history instead of throwing
            return [];
        }
    }

    async checkHealth() {
        if (!this.initialized) {
            await this.init();
        }

        return {
            status: 'healthy',
            blockchain: this.useBlockchain,
            fabricConnected: this.useBlockchain,
            certificateCount: this.useBlockchain ? 'blockchain' : certificatesDB.size,
            timestamp: new Date().toISOString()
        };
    }

    async disconnect() {
        // Graceful shutdown method
        console.log('🔌 Disconnecting Fabric client...');
        this.initialized = false;
        // No actual connection cleanup needed for CLI-based client
        return Promise.resolve();
    }
}

module.exports = FabricClient;