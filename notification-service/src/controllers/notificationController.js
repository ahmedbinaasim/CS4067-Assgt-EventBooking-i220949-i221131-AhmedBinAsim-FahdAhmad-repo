// src/controllers/notificationController.js
const Notification = require('../models/Notification');

// Get all notifications
exports.getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments();
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification',
      error: error.message
    });
  }
};

// Get notifications by recipient
exports.getNotificationsByRecipient = async (req, res) => {
  try {
    const { recipientId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments({ recipientId });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications for recipient:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get notifications by type
exports.getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const validTypes = ['BOOKING', 'USER', 'EVENT'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type. Must be BOOKING, USER, or EVENT.'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ type })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments({ type });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Get notifications by status
exports.getNotificationsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ['PENDING', 'SENT', 'FAILED'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be PENDING, SENT, or FAILED.'
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Notification.countDocuments({ status });
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications by status:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// Create a manual notification (for testing)
exports.createNotification = async (req, res) => {
  try {
    const {
      type,
      recipientEmail,
      recipientId,
      subject,
      content,
      relatedId,
      relatedTitle,
      metadata
    } = req.body;
    
    const notification = new Notification({
      type,
      recipientEmail,
      recipientId,
      subject,
      content,
      relatedId,
      relatedTitle,
      metadata
    });
    
    await notification.save();
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const totalCount = await Notification.countDocuments();
    const typeStats = await Notification.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const statusStats = await Notification.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const recentNotifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        totalCount,
        typeBreakdown: typeStats,
        statusBreakdown: statusStats,
        recentNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notification statistics',
      error: error.message
    });
  }
};