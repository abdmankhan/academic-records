'use strict';

const { Contract } = require('fabric-contract-api');

class CertificateContract extends Contract {

    // Helper function to get caller's role from transient data or client identity
    async getCallerRole(ctx) {
        try {
            // Try to get role from transient data (passed from client)
            const transientMap = ctx.stub.getTransient();
            if (transientMap && transientMap.get('role')) {
                return transientMap.get('role').toString();
            }
            
            // Fallback: Extract from client identity (MSP ID can indicate organization)
            const clientIdentity = ctx.clientIdentity;
            const mspId = clientIdentity.getMSPID();
            
            // Map organizations to roles (can be customized)
            // Org1 = University, Org2 = Student Registry, Org3 = Verification Authority
            if (mspId === 'Org1MSP') {
                return 'university';
            } else if (mspId === 'Org2MSP') {
                return 'student';
            } else if (mspId === 'Org3MSP') {
                return 'verifier';
            }
            
            // Default role if not specified
            return 'student';
        } catch (error) {
            console.error('Error getting caller role:', error);
            return 'student'; // Default to student for safety
        }
    }

    // Helper function to get caller's user ID
    async getCallerId(ctx) {
        try {
            const transientMap = ctx.stub.getTransient();
            if (transientMap && transientMap.get('userId')) {
                return transientMap.get('userId').toString();
            }
            
            // Fallback to client identity ID
            const clientIdentity = ctx.clientIdentity;
            return clientIdentity.getID();
        } catch (error) {
            console.error('Error getting caller ID:', error);
            return 'unknown';
        }
    }

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        const certificates = [
            {
                id: 'CERT1',
                studentId: 'STU001',
                studentName: 'Alice Johnson',
                course: 'Blockchain Development',
                grade: 'A',
                issuedAt: new Date('2025-01-15').toISOString(),
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            },
            {
                id: 'CERT2',
                studentId: 'STU002',
                studentName: 'Bob Smith',
                course: 'Data Science',
                grade: 'B',
                issuedAt: new Date('2025-01-20').toISOString(),
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        ];

        for (let i = 0; i < certificates.length; i++) {
            await ctx.stub.putState(certificates[i].id, Buffer.from(JSON.stringify(certificates[i])));
            console.info('Added <--> ', certificates[i]);
        }
        
        console.info('============= END : Initialize Ledger ===========');
    }

    async createCertificate(ctx, certificateData) {
        console.info('============= START : Create Certificate ===========');
        
        // Check if caller has university role (only universities can issue certificates)
        const callerRole = await this.getCallerRole(ctx);
        if (callerRole !== 'university' && callerRole !== 'admin') {
            throw new Error(`Access denied: Only universities can issue certificates. Current role: ${callerRole}`);
        }
        
        const certificate = JSON.parse(certificateData);
        // Use transaction timestamp instead of current time for determinism
        // Get timestamp from transaction context (deterministic across all peers)
        const txTimestamp = ctx.stub.getTxTimestamp();
        const txDate = new Date(txTimestamp.seconds.toNumber() * 1000);
        certificate.createdAt = txDate.toISOString();
        certificate.lastModified = txDate.toISOString();
        
        // Add issuer information
        const callerId = await this.getCallerId(ctx);
        certificate.issuedBy = callerId;
        certificate.issuerRole = callerRole;

        // Convert certificate to buffer for storage
        const certJson = JSON.stringify(certificate);
        const certBuffer = Buffer.from(certJson, 'utf8');
        
        console.info('📝 Putting state for certificate ID:', certificate.id);
        console.info('📝 Certificate data length:', certBuffer.length);
        console.info('📝 Certificate JSON length:', certJson.length);
        console.info('📝 Buffer is Buffer:', Buffer.isBuffer(certBuffer));
        console.info('📝 Certificate JSON preview:', certJson.substring(0, 200));
        
        // Use putState to store the certificate
        // In Fabric 2.x, putState should work directly
        // putState(key: string, value: Buffer): Promise<void>
        try {
            // Ensure we're passing a proper Buffer
            if (!Buffer.isBuffer(certBuffer)) {
                throw new Error('certBuffer is not a Buffer!');
            }
            if (certBuffer.length === 0) {
                throw new Error('certBuffer is empty!');
            }
            
            // Call putState - it should return void/undefined
            // IMPORTANT: putState must be awaited and should not throw
            const putStateResult = await ctx.stub.putState(certificate.id, certBuffer);
            console.info('✅ putState call completed');
            console.info('✅ putState result:', putStateResult);
            console.info('✅ putState result type:', typeof putStateResult);
            console.info('✅ Certificate ID:', certificate.id);
            console.info('✅ Certificate key length:', certificate.id.length);
            console.info('✅ Buffer length being written:', certBuffer.length);
        } catch (putError) {
            console.error('❌ ERROR in putState:', putError);
            console.error('❌ Error message:', putError.message);
            console.error('❌ Error stack:', putError.stack);
            throw new Error(`Failed to put certificate state: ${putError.message}`);
        }
        
        // Try to read it back immediately (should work within same transaction)
        try {
            const verifyState = await ctx.stub.getState(certificate.id);
            console.info('🔍 getState returned type:', typeof verifyState);
            console.info('🔍 getState is Buffer:', Buffer.isBuffer(verifyState));
            if (verifyState) {
                console.info('🔍 getState length:', verifyState.length);
            }
            
            if (verifyState && verifyState.length > 0) {
                const verifyData = verifyState.toString('utf8');
                console.info('✅ Verified: Certificate state exists after putState');
                console.info('✅ Verified data length:', verifyData.length);
                console.info('✅ Verified data preview:', verifyData.substring(0, 200));
            } else {
                console.error('❌ ERROR: Certificate state NOT found after putState!');
                console.error('❌ verifyState value:', verifyState);
                console.error('❌ verifyState type:', typeof verifyState);
                console.error('❌ This is a CRITICAL issue - putState is not working!');
                // Still return success - let transaction commit, but log the error
            }
        } catch (getError) {
            console.error('❌ ERROR in getState verification:', getError);
            console.error('❌ getState error details:', JSON.stringify(getError));
        }
        
        console.info('============= END : Create Certificate ===========');
        
        return JSON.stringify(certificate);
    }

    async queryCertificate(ctx, certificateId) {
        const certificateAsBytes = await ctx.stub.getState(certificateId);
        if (!certificateAsBytes || certificateAsBytes.length === 0) {
            throw new Error(`Certificate ${certificateId} does not exist`);
        }
        
        const certificate = JSON.parse(certificateAsBytes.toString());
        const callerRole = await this.getCallerRole(ctx);
        const callerId = await this.getCallerId(ctx);
        
        // Students can only query their own certificates
        if (callerRole === 'student') {
            if (certificate.studentId !== callerId && !certificate.studentId.includes(callerId)) {
                throw new Error(`Access denied: Students can only view their own certificates`);
            }
        }
        
        console.log(certificateAsBytes.toString());
        return certificateAsBytes.toString();
    }

    async queryAllCertificates(ctx) {
        const startKey = '';
        const endKey = '';
        const allResults = [];
        const callerRole = await this.getCallerRole(ctx);
        const callerId = await this.getCallerId(ctx);
        
        console.info('🔍 queryAllCertificates called');
        console.info('🔍 Caller role:', callerRole);
        console.info('🔍 Caller ID:', callerId);
        console.info('🔍 Querying state range from', startKey, 'to', endKey);
        
        let keyCount = 0;
        try {
            for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
                keyCount++;
                console.info(`🔍 Found key #${keyCount}:`, key);
                const strValue = Buffer.from(value, 'utf8').toString('utf8');
                let record;
                try {
                    record = JSON.parse(strValue);
                } catch (err) {
                    console.log('⚠️  JSON parse error for key', key, ':', err);
                    record = strValue;
                }
                
                // Students can only see their own certificates
                if (callerRole === 'student') {
                    if (record.studentId === callerId || (record.studentId && record.studentId.includes(callerId))) {
                        allResults.push({ Key: key, Record: record });
                    }
                } else {
                    // Universities and verifiers can see all certificates
                    allResults.push({ Key: key, Record: record });
                }
            }
        } catch (rangeError) {
            console.error('❌ Error in getStateByRange:', rangeError);
            throw rangeError;
        }
        console.info(`🔍 Total keys found: ${keyCount}`);
        console.info(`🔍 Total certificates after filtering: ${allResults.length}`);
        if (allResults.length > 0) {
            console.info('🔍 Sample result:', JSON.stringify(allResults[0]).substring(0, 200));
        }
        return JSON.stringify(allResults);
    }
    
    // New function: Query certificates by student ID (for students to view their own)
    async queryCertificatesByStudent(ctx, studentId) {
        const callerRole = await this.getCallerRole(ctx);
        const callerId = await this.getCallerId(ctx);
        
        // Students can only query their own certificates
        if (callerRole === 'student' && studentId !== callerId && !studentId.includes(callerId)) {
            throw new Error(`Access denied: Students can only view their own certificates`);
        }
        
        const startKey = '';
        const endKey = '';
        const results = [];
        
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value, 'utf8').toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                continue;
            }
            
            if (record.studentId === studentId || (record.studentId && record.studentId.includes(studentId))) {
                results.push({ Key: key, Record: record });
            }
        }
        
        return JSON.stringify(results);
    }

    async updateCertificate(ctx, certificateId, certificateData) {
        console.info('============= START : Update Certificate ===========');

        // Only universities can update certificates
        const callerRole = await this.getCallerRole(ctx);
        if (callerRole !== 'university' && callerRole !== 'admin') {
            throw new Error(`Access denied: Only universities can update certificates. Current role: ${callerRole}`);
        }

        const certificateAsBytes = await ctx.stub.getState(certificateId);
        if (!certificateAsBytes || certificateAsBytes.length === 0) {
            throw new Error(`Certificate ${certificateId} does not exist`);
        }

        const updatedCertificate = JSON.parse(certificateData);
        // Use transaction timestamp for determinism
        const txTimestamp = ctx.stub.getTxTimestamp();
        const txDate = new Date(txTimestamp.seconds.toNumber() * 1000);
        updatedCertificate.lastModified = txDate.toISOString();
        
        // Preserve original issuer information
        const originalCertificate = JSON.parse(certificateAsBytes.toString());
        if (originalCertificate.issuedBy) {
            updatedCertificate.issuedBy = originalCertificate.issuedBy;
        }
        if (originalCertificate.issuerRole) {
            updatedCertificate.issuerRole = originalCertificate.issuerRole;
        }

        await ctx.stub.putState(certificateId, Buffer.from(JSON.stringify(updatedCertificate)));
        console.info('============= END : Update Certificate ===========');
        
        return JSON.stringify(updatedCertificate);
    }

    async deleteCertificate(ctx, certificateId) {
        // Only universities can delete certificates
        const callerRole = await this.getCallerRole(ctx);
        if (callerRole !== 'university' && callerRole !== 'admin') {
            throw new Error(`Access denied: Only universities can delete certificates. Current role: ${callerRole}`);
        }
        
        const certificateAsBytes = await ctx.stub.getState(certificateId);
        if (!certificateAsBytes || certificateAsBytes.length === 0) {
            throw new Error(`Certificate ${certificateId} does not exist`);
        }

        await ctx.stub.deleteState(certificateId);
        return `Certificate ${certificateId} deleted successfully`;
    }

    async getCertificateHistory(ctx, certificateId) {
        try {
            let iterator = await ctx.stub.getHistoryForKey(certificateId);
            let result = [];
            let res = await iterator.next();
            
            while (!res.done) {
                if (res.value) {
                    const jsonRes = {};
                    
                    // Safely extract transaction ID
                    jsonRes.TxId = (res.value.txId && res.value.txId.toString()) || 
                                  (res.value.tx_id && res.value.tx_id.toString()) || 'Unknown';
                    
                    // Safely extract timestamp
                    if (res.value.timestamp) {
                        jsonRes.Timestamp = res.value.timestamp.seconds ? 
                            new Date(res.value.timestamp.seconds * 1000).toISOString() :
                            res.value.timestamp.toString();
                    } else {
                        jsonRes.Timestamp = new Date().toISOString();
                    }
                    
                    // Check if this is a delete operation
                    jsonRes.IsDelete = res.value.isDelete ? res.value.isDelete.toString() : 'false';

                    if (res.value.value && res.value.value.length > 0) {
                        try {
                            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
                        } catch (err) {
                            console.log('Error parsing certificate value:', err);
                            jsonRes.Value = res.value.value.toString('utf8');
                        }
                    } else {
                        jsonRes.Value = null;
                    }
                    
                    result.push(jsonRes);
                }
                res = await iterator.next();
            }
            
            await iterator.close();
            return JSON.stringify(result);
        } catch (error) {
            console.error('Error getting certificate history:', error);
            throw new Error(`Failed to get history for certificate ${certificateId}: ${error.message}`);
        }
    }

    async verifyCertificate(ctx, certificateId) {
        // Only verifiers (companies/government) and universities can verify certificates
        const callerRole = await this.getCallerRole(ctx);
        if (callerRole !== 'verifier' && callerRole !== 'university' && callerRole !== 'admin') {
            throw new Error(`Access denied: Only verifiers and universities can verify certificates. Current role: ${callerRole}`);
        }
        
        const certificateAsBytes = await ctx.stub.getState(certificateId);
        if (!certificateAsBytes || certificateAsBytes.length === 0) {
            return JSON.stringify({ valid: false, message: 'Certificate not found' });
        }

        const certificate = JSON.parse(certificateAsBytes.toString());
        const callerId = await this.getCallerId(ctx);
        
        // Use transaction timestamp for determinism
        const txTimestamp = ctx.stub.getTxTimestamp();
        const txDate = new Date(txTimestamp.seconds.toNumber() * 1000);
        
        return JSON.stringify({ 
            valid: true, 
            certificate: certificate,
            verifiedAt: txDate.toISOString(),
            verifiedBy: callerId,
            verifierRole: callerRole
        });
    }
}

module.exports = CertificateContract;
