// src/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/database');
const rabbitMQService = require('./services/rabbitMQService');
const notificationRoutes = require('./routes/notificationRoutes');
require('dotenv').config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'Notification Service' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : null
  });
});

// Start RabbitMQ consumers
rabbitMQService.startConsumers()
  .then(() => {
    console.log('RabbitMQ consumers started successfully');
  })
  .catch(error => {
    console.error('Failed to start RabbitMQ consumers:', error);
  });

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});

module.exports = app; // For testing purposes