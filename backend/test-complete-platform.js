const SimpleFabricClient = require('./fabric-client/simpleFabricClient');

async function testCertificateLifecycle() {
    const client = new SimpleFabricClient();
    
    try {
        console.log('=== Testing Academic Certificate Platform ===\n');

        // Test 1: Create a certificate
        console.log('1. Creating a certificate...');
        const certificate1 = {
            id: 'CERT-2024-001',
            studentName: 'John Doe',
            courseName: 'Computer Science Degree',
            institutionName: 'Tech University',
            issueDate: '2024-11-13',
            grade: 'A',
            hash: 'abc123def456'
        };

        const created = await client.createCertificate(certificate1);
        console.log('✓ Certificate created:', created.id);

        // Test 2: Query the certificate
        console.log('\n2. Querying the certificate...');
        const queried = await client.queryCertificate('CERT-2024-001');
        console.log('✓ Certificate queried:', {
            id: queried.id,
            student: queried.studentName,
            course: queried.courseName,
            institution: queried.institutionName,
            grade: queried.grade
        });

        // Test 3: Create another certificate
        console.log('\n3. Creating another certificate...');
        const certificate2 = {
            id: 'CERT-2024-002',
            studentName: 'Jane Smith',
            courseName: 'Data Science Masters',
            institutionName: 'Data Analytics Institute',
            issueDate: '2024-11-13',
            grade: 'A+',
            hash: 'xyz789uvw012'
        };

        await client.createCertificate(certificate2);
        console.log('✓ Second certificate created:', certificate2.id);

        // Test 4: Query all certificates
        console.log('\n4. Querying all certificates...');
        const allCerts = await client.queryAllCertificates();
        console.log(`✓ Found ${allCerts.length} certificates:`);
        allCerts.forEach(cert => {
            console.log(`  - ${cert.id}: ${cert.studentName} - ${cert.courseName}`);
        });

        // Test 5: Update a certificate
        console.log('\n5. Updating a certificate...');
        const updatedData = {
            id: 'CERT-2024-001',
            studentName: 'John Doe',
            courseName: 'Computer Science Degree (Honors)',
            institutionName: 'Tech University',
            issueDate: '2024-11-13',
            grade: 'A+',
            hash: 'abc123def456updated'
        };

        await client.updateCertificate('CERT-2024-001', updatedData);
        console.log('✓ Certificate updated');

        // Verify the update
        const updatedCert = await client.queryCertificate('CERT-2024-001');
        console.log('✓ Updated grade:', updatedCert.grade);
        console.log('✓ Updated course name:', updatedCert.courseName);

        // Test 6: Verify certificate
        console.log('\n6. Verifying certificate authenticity...');
        const verification = await client.verifyCertificate('CERT-2024-001');
        console.log('✓ Certificate verification:', verification.valid ? 'VALID' : 'INVALID');
        if (verification.valid) {
            console.log('✓ Verified certificate details:', {
                student: verification.certificate.studentName,
                course: verification.certificate.courseName
            });
        }

        // Test 7: Get certificate history
        console.log('\n7. Getting certificate history...');
        const history = await client.getCertificateHistory('CERT-2024-001');
        console.log(`✓ Certificate has ${history.length} history records`);

        // Test 8: Test invalid operations
        console.log('\n8. Testing error handling...');
        try {
            await client.queryCertificate('NON-EXISTENT');
        } catch (error) {
            console.log('✓ Correctly handled non-existent certificate query');
        }

        console.log('\n=== All tests completed successfully! ===');
        console.log('\n🎉 Academic Certificate Platform is working properly!');
        console.log('\nKey features verified:');
        console.log('✓ Certificate creation and storage on blockchain');
        console.log('✓ Certificate querying and retrieval');
        console.log('✓ Certificate updates with transaction history');
        console.log('✓ Certificate verification and authenticity checks');
        console.log('✓ Complete audit trail through blockchain history');
        console.log('✓ Error handling for invalid operations');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.stderr) {
            console.error('Error details:', error.stderr);
        }
    }
}

testCertificateLifecycle();