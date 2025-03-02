// src/config/config.js
require('dotenv').config();

module.exports = {
  server: {
    port: process.env.PORT || 3001
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key',
    expiresIn: '24h'
  }
};