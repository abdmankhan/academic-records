const FabricClient = require('./fabric-client/fabricClientNew');

async function testConnection() {
    const client = new FabricClient();
    
    try {
        console.log('Initializing Fabric client...');
        const connected = await client.init();
        
        if (!connected) {
            console.log('Failed to connect to Fabric network');
            return;
        }

        console.log('Testing certificate creation...');
        
        // Create a test certificate
        const testCertificate = {
            id: 'CERT-TEST-001',
            studentName: 'John Doe',
            courseName: 'Computer Science',
            institutionName: 'Test University', 
            issueDate: new Date().toISOString(),
            grade: 'A',
            hash: 'test-hash-123'
        };

        const result = await client.createCertificate(testCertificate);
        console.log('Certificate created:', result);

        // Query the certificate back
        console.log('Querying certificate...');
        const queriedCert = await client.queryCertificate('CERT-TEST-001');
        console.log('Queried certificate:', queriedCert);

        // Query all certificates
        console.log('Querying all certificates...');
        const allCerts = await client.queryAllCertificates();
        console.log('All certificates:', allCerts);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await client.disconnect();
    }
}

testConnection();