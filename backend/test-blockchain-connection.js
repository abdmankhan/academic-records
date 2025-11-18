// Quick test to see if backend can connect to blockchain
const FabricClient = require('./fabric-client/fabricClientIntegrated');

async function test() {
    console.log('🧪 Testing Blockchain Connection...\n');
    
    const client = new FabricClient();
    console.log('1. useBlockchain flag:', client.useBlockchain);
    console.log('2. USE_BLOCKCHAIN env:', process.env.USE_BLOCKCHAIN);
    
    await client.init();
    console.log('3. After init, useBlockchain:', client.useBlockchain);
    
    try {
        console.log('\n4. Testing queryAllCertificates...');
        const result = await client.getAllCertificates();
        console.log('✅ Query successful! Found', result.length, 'certificates');
        if (result.length > 0) {
            console.log('   First certificate:', result[0].id);
        }
    } catch (error) {
        console.error('❌ Query failed:', error.message);
    }
    
    try {
        console.log('\n5. Testing createCertificate...');
        const testCert = {
            id: 'TEST_' + Date.now(),
            studentId: 'TEST_STU',
            studentName: 'Test Student',
            course: 'Test Course',
            grade: 'A',
            issuedAt: new Date().toISOString()
        };
        const created = await client.createCertificate(testCert);
        console.log('✅ Create successful! Certificate ID:', created.id);
        
        // Wait a moment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Query again
        const allCerts = await client.getAllCertificates();
        console.log('✅ After create, found', allCerts.length, 'certificates');
        const found = allCerts.find(c => c.id === testCert.id);
        if (found) {
            console.log('✅ Created certificate found in query!');
        } else {
            console.log('❌ Created certificate NOT found in query!');
        }
    } catch (error) {
        console.error('❌ Create failed:', error.message);
        console.error('   Full error:', error);
    }
}

test().then(() => {
    console.log('\n✅ Test complete');
    process.exit(0);
}).catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
});





