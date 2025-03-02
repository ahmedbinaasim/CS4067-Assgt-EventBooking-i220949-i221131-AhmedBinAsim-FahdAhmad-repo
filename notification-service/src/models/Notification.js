// src/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['BOOKING', 'USER', 'EVENT'],
    required: true
  },
  recipientEmail: {
    type: String,
    required: true
  },
  recipientId: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  relatedId: {
    type: String,
    required: false
  },
  relatedTitle: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['PENDING', 'SENT', 'FAILED'],
    default: 'PENDING'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  sentAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;