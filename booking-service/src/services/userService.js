// src/services/userService.js
const axios = require('axios');
require('dotenv').config();

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Verify a user's token
const verifyToken = async (token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  } catch (error) {
    console.error('Error verifying user token:', error);
    throw new Error('Failed to verify user token');
  }
};

// Get user profile by ID
const getUserById = async (userId, token) => {
  try {
    const response = await axios.get(`${USER_SERVICE_URL}/api/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  } catch (error) {
    console.error(`Error fetching user with ID ${userId}:`, error);
    throw new Error('Failed to fetch user details');
  }
};

module.exports = {
  verifyToken,
  getUserById
};