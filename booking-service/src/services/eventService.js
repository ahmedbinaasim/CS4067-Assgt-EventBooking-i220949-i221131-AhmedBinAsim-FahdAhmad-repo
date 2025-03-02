// src/services/eventService.js
const axios = require('axios');
require('dotenv').config();

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';

// Get event by ID
const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${EVENT_SERVICE_URL}/api/events/${eventId}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw new Error('Failed to fetch event details');
  }
};

// Check event availability
const checkEventAvailability = async (eventId, tickets) => {
  try {
    const response = await axios.get(`${EVENT_SERVICE_URL}/api/events/${eventId}/availability?tickets=${tickets}`);
    return response.data;
  } catch (error) {
    console.error(`Error checking availability for event ${eventId}:`, error);
    throw new Error('Failed to check event availability');
  }
};

// Book tickets for an event
const bookEventTickets = async (eventId, tickets) => {
  try {
    const response = await axios.post(`${EVENT_SERVICE_URL}/api/events/${eventId}/book`, { tickets });
    return response.data;
  } catch (error) {
    console.error(`Error booking tickets for event ${eventId}:`, error);
    throw new Error('Failed to book event tickets');
  }
};

module.exports = {
  getEventById,
  checkEventAvailability,
  bookEventTickets
};