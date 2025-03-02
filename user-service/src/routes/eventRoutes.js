// user-service/src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticateJWT } = require('../middleware/authMiddleware');

// Get all events (protected route)
router.get('/', authenticateJWT, eventController.getAllEvents);

// Get event by ID (protected route)
router.get('/:eventId', authenticateJWT, eventController.getEventById);

module.exports = router;