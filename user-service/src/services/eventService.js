// user-service/src/services/eventService.js
const axios = require('axios');
require('dotenv').config();

const EVENT_SERVICE_URL = process.env.EVENT_SERVICE_URL || 'http://localhost:3002';

const getEvents = async () => {
  try {
    const response = await axios.get(`${EVENT_SERVICE_URL}/api/events`);
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events from Event Service');
  }
};

const getEventById = async (eventId) => {
  try {
    const response = await axios.get(`${EVENT_SERVICE_URL}/api/events/${eventId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${eventId}:`, error);
    throw new Error('Failed to fetch event details from Event Service');
  }
};

module.exports = {
  getEvents,
  getEventById
};