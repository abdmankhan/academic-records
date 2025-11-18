const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Development helper endpoint
if (process.env.NODE_ENV === 'development') {
    router.get('/list', userController.getUsers);
}

module.exports = router;