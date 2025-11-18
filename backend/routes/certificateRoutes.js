const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { validateCertificate, validateCertificateUpdate } = require('../middleware/validation');
const { requireRole, requireAuth } = require('../middleware/roleAuth');

// Get all certificates (authenticated users only - role-based filtering in chaincode)
router.get('/', requireAuth, certificateController.getAllCertificates);

// Get certificate by ID (authenticated users only - role-based filtering in chaincode)
router.get('/:id', requireAuth, certificateController.getCertificateById);

// Get certificates by student ID (students can only see their own)
router.get('/student/:studentId', requireAuth, certificateController.getCertificatesByStudent);

// Create new certificate (only universities can issue certificates)
router.post('/', requireRole('university', 'admin'), validateCertificate, certificateController.createCertificate);

// Update certificate (only universities can update)
router.put('/:id', requireRole('university', 'admin'), validateCertificateUpdate, certificateController.updateCertificate);

// Delete certificate (only universities can delete)
router.delete('/:id', requireRole('university', 'admin'), certificateController.deleteCertificate);

// Verify certificate (only verifiers and universities can verify)
router.post('/:id/verify', requireRole('verifier', 'university', 'admin'), certificateController.verifyCertificate);

// Get certificate history (authenticated users)
router.get('/:id/history', requireAuth, certificateController.getCertificateHistory);

module.exports = router;