// Import the initialized client from server.js
let fabricClient = null;

// Function to set the client instance from server.js
const setFabricClient = (client) => {
    fabricClient = client;
};

// Get the client instance
const getFabricClient = () => {
    if (!fabricClient) {
        throw new Error('Fabric client not initialized. Please call setFabricClient first.');
    }
    return fabricClient;
};

exports.getAllCertificates = async (req, res, next) => {
    try {
        const client = getFabricClient();
        const data = await client.getAllCertificates();
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getCertificateById = async (req, res, next) => {
    try {
        const id = req.params.id;
        // Logging is handled in simpleFabricClient.queryCertificate()
        const client = getFabricClient();
        const data = await client.getCertificate(id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getCertificatesByStudent = async (req, res, next) => {
    try {
        const studentId = req.params.studentId;
        const client = getFabricClient();
        const data = await client.getCertificatesByStudent(studentId);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.createCertificate = async (req, res, next) => {
    try {
        const certificateData = req.body;
        
        console.log('\n' + '═'.repeat(70));
        console.log('📜 CERTIFICATE ISSUANCE - HYPERLEDGER FABRIC TRANSACTION');
        console.log('═'.repeat(70));
        console.log(`📝 Certificate ID: ${certificateData.id || 'AUTO-GENERATE'}`);
        console.log(`👤 Student: ${certificateData.studentName} (${certificateData.studentId})`);
        console.log(`📚 Course: ${certificateData.course}, Grade: ${certificateData.grade}`);
        console.log('');
        
        const client = getFabricClient();
        const data = await client.createCertificate(certificateData);
        
        res.status(201).json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.updateCertificate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const client = getFabricClient();
        const data = await client.updateCertificate(id, updateData);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.deleteCertificate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const data = await fabricClient.deleteCertificate(id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.verifyCertificate = async (req, res, next) => {
    try {
        const id = req.params.id;
        const verificationData = req.body;
        
        // Logging is handled in simpleFabricClient.verifyCertificate()
        const client = getFabricClient();
        const data = await client.verifyCertificate(id, verificationData);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

exports.getCertificateHistory = async (req, res, next) => {
    try {
        const id = req.params.id;
        const client = getFabricClient();
        const data = await client.getCertificateHistory(id);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};

// Export the function to set the fabric client
module.exports.setFabricClient = setFabricClient;
