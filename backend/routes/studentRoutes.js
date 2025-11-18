const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { requireAuth, requireRole } = require('../middleware/roleAuth');

// Public route - anyone can register as a student
router.post('/register', studentController.registerStudent);

// Protected routes - require authentication
router.get('/', requireAuth, requireRole('university', 'admin'), studentController.getAllStudents);
router.get('/:rollNumber', requireAuth, studentController.getStudentByRollNumber);

module.exports = router;

