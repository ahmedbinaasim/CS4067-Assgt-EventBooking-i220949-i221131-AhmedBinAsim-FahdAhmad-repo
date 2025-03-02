// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { authenticateUser } = require('../middleware/authMiddleware');

// Apply authentication middleware to all booking routes
router.use(authenticateUser);

// Create a new booking
router.post('/', bookingController.createBooking);

// Get all bookings for the authenticated user
router.get('/', bookingController.getUserBookings);

// Get booking by ID
router.get('/:id', bookingController.getBookingById);

// Cancel a booking
router.post('/:id/cancel', bookingController.cancelBooking);

module.exports = router;