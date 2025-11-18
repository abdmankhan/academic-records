const SimpleFabricClient = require('./fabric-client/simpleFabricClient');

async function debugTest() {
    const client = new SimpleFabricClient();
    
    try {
        console.log('=== Debugging Certificate Creation ===');
        
        const certificateData = {
            id: 'DEBUG-001',
            student: 'Debug Student',
            course: 'Debug Course',
            institution: 'Debug University',
            grade: 'A'
        };
        
        // Test certificate creation and see raw output
        const result = await client.createCertificate(certificateData);
        console.log('Raw result:', result);
        console.log('Type:', typeof result);
        console.log('JSON stringified:', JSON.stringify(result, null, 2));
        
        // Test certificate querying
        console.log('\n=== Debugging Certificate Query ===');
        const queryResult = await client.queryCertificate('DEBUG-001');
        console.log('Query result:', queryResult);
        console.log('Query type:', typeof queryResult);
        
        // Test all certificates
        console.log('\n=== Debugging All Certificates Query ===');
        const allCerts = await client.queryAllCertificates();
        console.log('All certificates type:', typeof allCerts);
        console.log('All certificates length:', allCerts.length);
        console.log('First certificate:', allCerts[0]);
        
    } catch (error) {
        console.error('Debug test failed:', error);
    }
}

debugTest();