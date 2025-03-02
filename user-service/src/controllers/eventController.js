// user-service/src/controllers/eventController.js
const eventService = require('../services/eventService');

exports.getAllEvents = async (req, res) => {
  try {
    const events = await eventService.getEvents();
    res.status(200).json(events);
  } catch (error) {
    console.error('Error getting events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await eventService.getEventById(eventId);
    res.status(200).json(event);
  } catch (error) {
    console.error('Error getting event:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
};