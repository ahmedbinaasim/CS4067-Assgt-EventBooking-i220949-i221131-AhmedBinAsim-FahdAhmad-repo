// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get all events / Create a new event
router.route('/')
  .get(eventController.getAllEvents)
  .post(eventController.createEvent);

// Get, update, delete a specific event
router.route('/:id')
  .get(eventController.getEventById)
  .put(eventController.updateEvent)
  .delete(eventController.deleteEvent);

// Check event availability
router.get('/:id/availability', eventController.checkAvailability);

// Book tickets for an event
router.post('/:id/book', eventController.bookTickets);

// Search events
router.get('/search', eventController.searchEvents);

module.exports = router;