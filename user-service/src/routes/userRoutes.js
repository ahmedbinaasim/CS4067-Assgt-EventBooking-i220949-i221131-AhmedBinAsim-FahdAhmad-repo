// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateJWT, userController.getProfile);
router.put('/profile', authenticateJWT, userController.updateProfile);

module.exports = router;