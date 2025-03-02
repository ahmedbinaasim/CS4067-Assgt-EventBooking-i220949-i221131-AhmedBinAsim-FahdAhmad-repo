// src/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get all notifications
router.get('/', notificationController.getAllNotifications);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Get notification by ID
router.get('/:id', notificationController.getNotificationById);

// Get notifications by recipient
router.get('/recipient/:recipientId', notificationController.getNotificationsByRecipient);

// Get notifications by type
router.get('/type/:type', notificationController.getNotificationsByType);

// Get notifications by status
router.get('/status/:status', notificationController.getNotificationsByStatus);

// Create a manual notification (for testing)
router.post('/', notificationController.createNotification);

module.exports = router;