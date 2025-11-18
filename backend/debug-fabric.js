const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function debugFabricOutput() {
    const networkPath = '/home/abdmankhan/academic-certificates-platform/fabric-network';
    const baseCommand = `cd ${networkPath} && docker exec -e CORE_PEER_LOCALMSPID=Org1MSP -e CORE_PEER_TLS_ENABLED=false -e CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp -e CORE_PEER_ADDRESS=peer0.org1.example.com:7051 cli`;

    try {
        console.log('=== Testing Certificate Creation ===');
        
        const createCommand = `${baseCommand} peer chaincode invoke -o orderer.example.com:7050 -C certificatechannel -n certificate --peerAddresses peer0.org1.example.com:7051 -c '{"function":"createCertificate","Args":["{\\\"id\\\":\\\"DEBUG-001\\\",\\\"studentName\\\":\\\"Debug Test\\\",\\\"courseName\\\":\\\"Debug Course\\\",\\\"institutionName\\\":\\\"Debug University\\\",\\\"issueDate\\\":\\\"2024-11-13\\\",\\\"grade\\\":\\\"A\\\",\\\"hash\\\":\\\"debug123\\\"}"]}' 2>&1`;
        
        console.log('Running command:', createCommand);
        const { stdout: createOutput, stderr: createError } = await execAsync(createCommand);
        
        console.log('\n=== CREATE OUTPUT ===');
        console.log('STDOUT:');
        console.log(createOutput);
        console.log('\nSTDERR:');
        console.log(createError || 'No errors');
        
        // Try to extract payload
        const payloadMatch = createOutput.match(/payload:"([^"]+)"/);
        if (payloadMatch) {
            console.log('\n=== PAYLOAD EXTRACTION ===');
            console.log('Raw payload:', payloadMatch[1]);
            try {
                const parsed = JSON.parse(payloadMatch[1]);
                console.log('Parsed payload:', parsed);
            } catch (e) {
                console.log('Error parsing payload:', e.message);
            }
        } else {
            console.log('\n=== NO PAYLOAD MATCH ===');
            console.log('Could not extract payload from output');
        }

        console.log('\n=== Testing Certificate Query ===');
        
        const queryCommand = `${baseCommand} peer chaincode query -C certificatechannel -n certificate -c '{"function":"queryCertificate","Args":["DEBUG-001"]}' 2>&1`;
        
        console.log('Running query command:', queryCommand);
        const { stdout: queryOutput, stderr: queryError } = await execAsync(queryCommand);
        
        console.log('\n=== QUERY OUTPUT ===');
        console.log('STDOUT:');
        console.log(queryOutput);
        console.log('\nSTDERR:');
        console.log(queryError || 'No errors');
        
        try {
            const queryResult = JSON.parse(queryOutput.trim());
            console.log('\n=== PARSED QUERY RESULT ===');
            console.log(queryResult);
        } catch (e) {
            console.log('\n=== QUERY PARSE ERROR ===');
            console.log('Error parsing query result:', e.message);
        }

        console.log('\n=== Testing Query ALL Certificates ===');
        
        const queryAllCommand = `${baseCommand} peer chaincode query -C certificatechannel -n certificate -c '{"function":"queryAllCertificates","Args":[]}' 2>&1`;
        
        const { stdout: queryAllOutput } = await execAsync(queryAllCommand);
        
        console.log('\n=== QUERY ALL OUTPUT ===');
        console.log('Raw output:');
        console.log(queryAllOutput);
        
        try {
            const queryAllResult = JSON.parse(queryAllOutput.trim());
            console.log('\n=== PARSED QUERY ALL RESULT ===');
            console.log('Number of certificates:', queryAllResult.length);
            queryAllResult.forEach((cert, index) => {
                console.log(`Certificate ${index + 1}:`, {
                    Key: cert.Key,
                    Id: cert.Record?.id,
                    Student: cert.Record?.studentName,
                    Course: cert.Record?.courseName
                });
            });
        } catch (e) {
            console.log('\n=== QUERY ALL PARSE ERROR ===');
            console.log('Error parsing query all result:', e.message);
        }

    } catch (error) {
        console.error('Debug test failed:', error);
    }
}

debugFabricOutput();