// src/services/rabbitMQService.js
const amqp = require('amqplib');
const Notification = require('../models/Notification');
const emailService = require('./emailService');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Queues
const BOOKING_QUEUE = 'booking_notifications';
const USER_QUEUE = 'user_notifications';
const EVENT_QUEUE = 'event_notifications';

// Connect to RabbitMQ
const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Assert queues
    await channel.assertQueue(BOOKING_QUEUE, { durable: true });
    await channel.assertQueue(USER_QUEUE, { durable: true });
    await channel.assertQueue(EVENT_QUEUE, { durable: true });
    
    console.log('Connected to RabbitMQ');
    
    return { connection, channel };
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    throw error;
  }
};

// Process booking notifications
const processBookingMessage = async (message) => {
  try {
    const data = JSON.parse(message.content.toString());
    console.log('Received booking notification:', data);
    
    // Create notification record
    const notification = new Notification({
      type: 'BOOKING',
      recipientEmail: data.user_email,
      recipientId: data.user_id,
      subject: data.status === 'CONFIRMED' 
        ? 'Your Booking is Confirmed!' 
        : 'Booking Cancellation',
      content: data.status === 'CONFIRMED'
        ? `Your booking for ${data.event_title} has been confirmed.`
        : `Your booking for ${data.event_title} has been cancelled.`,
      relatedId: data.booking_id,
      relatedTitle: data.event_title,
      metadata: {
        eventId: data.event_id,
        tickets: data.tickets,
        status: data.status,
        timestamp: data.timestamp
      }
    });
    
    // Generate appropriate email based on booking status
    const emailHtml = data.status === 'CONFIRMED'
      ? emailService.generateBookingConfirmationEmail({
          userName: data.user_name,
          eventTitle: data.event_title,
          bookingId: data.booking_id,
          tickets: data.tickets
        })
      : emailService.generateBookingCancellationEmail({
          userName: data.user_name,
          eventTitle: data.event_title,
          bookingId: data.booking_id
        });
    
    // Send email
    const emailResult = await emailService.sendEmail(
      data.user_email,
      notification.subject,
      emailHtml
    );
    
    // Update notification status
    notification.status = 'SENT';
    notification.sentAt = new Date();
    await notification.save();
    
    console.log('Booking notification processed successfully');
    return notification;
  } catch (error) {
    console.error('Error processing booking notification:', error);
    
    // Save failed notification
    const failedNotification = new Notification({
      type: 'BOOKING',
      recipientEmail: data?.user_email || 'unknown',
      recipientId: data?.user_id || 'unknown',
      subject: 'Booking Notification',
      content: 'Failed to process booking notification',
      status: 'FAILED',
      metadata: { error: error.message, raw: message.content.toString() }
    });
    
    await failedNotification.save();
    throw error;
  }
};

// Process user notifications
const processUserMessage = async (message) => {
  try {
    const data = JSON.parse(message.content.toString());
    console.log('Received user notification:', data);
    
    // Create notification record
    const notification = new Notification({
      type: 'USER',
      recipientEmail: data.email,
      recipientId: data.user_id,
      subject: 'Welcome to Event Booking Platform',
      content: 'Thank you for registering with our platform.',
      relatedId: data.user_id,
      metadata: {
        action: data.action,
        timestamp: data.timestamp
      }
    });
    
    // Generate user registration email
    const emailHtml = emailService.generateUserRegistrationEmail({
      userName: data.name,
      email: data.email
    });
    
    // Send email
    const emailResult = await emailService.sendEmail(
      data.email,
      notification.subject,
      emailHtml
    );
    
    // Update notification status
    notification.status = 'SENT';
    notification.sentAt = new Date();
    await notification.save();
    
    console.log('User notification processed successfully');
    return notification;
  } catch (error) {
    console.error('Error processing user notification:', error);
    
    // Save failed notification
    try {
      const data = JSON.parse(message.content.toString());
      const failedNotification = new Notification({
        type: 'USER',
        recipientEmail: data?.email || 'unknown',
        recipientId: data?.user_id || 'unknown',
        subject: 'User Notification',
        content: 'Failed to process user notification',
        status: 'FAILED',
        metadata: { error: error.message, raw: message.content.toString() }
      });
      
      await failedNotification.save();
    } catch (err) {
      console.error('Error saving failed notification:', err);
    }
    
    throw error;
  }
};

// Process event notifications
const processEventMessage = async (message) => {
  try {
    const data = JSON.parse(message.content.toString());
    console.log('Received event notification:', data);
    
    // Create notification record
    const notification = new Notification({
      type: 'EVENT',
      recipientEmail: data.user_email,
      recipientId: data.user_id,
      subject: `Event Update: ${data.event_title}`,
      content: data.message || `Updates to event ${data.event_title}`,
      relatedId: data.event_id,
      relatedTitle: data.event_title,
      metadata: {
        action: data.action,
        timestamp: data.timestamp
      }
    });
    
    // Generate event update email
    const emailHtml = emailService.generateEventUpdateEmail({
      userName: data.user_name,
      eventTitle: data.event_title,
      eventDate: data.event_date,
      eventLocation: data.event_location,
      updateMessage: data.message
    });
    
    // Send email
    const emailResult = await emailService.sendEmail(
      data.user_email,
      notification.subject,
      emailHtml
    );
    
    // Update notification status
    notification.status = 'SENT';
    notification.sentAt = new Date();
    await notification.save();
    
    console.log('Event notification processed successfully');
    return notification;
  } catch (error) {
    console.error('Error processing event notification:', error);
    
    // Save failed notification
    try {
      const data = JSON.parse(message.content.toString());
      const failedNotification = new Notification({
        type: 'EVENT',
        recipientEmail: data?.user_email || 'unknown',
        recipientId: data?.user_id || 'unknown',
        subject: 'Event Notification',
        content: 'Failed to process event notification',
        status: 'FAILED',
        metadata: { error: error.message, raw: message.content.toString() }
      });
      
      await failedNotification.save();
    } catch (err) {
      console.error('Error saving failed notification:', err);
    }
    
    throw error;
  }
};

// Start consumers
const startConsumers = async () => {
  try {
    const { channel } = await connectRabbitMQ();
    
    // Booking notifications consumer
    channel.consume(BOOKING_QUEUE, async (message) => {
      if (message !== null) {
        try {
          await processBookingMessage(message);
          channel.ack(message);
        } catch (error) {
          // Reject the message so it goes back to the queue
          // with requeue=false to prevent infinite loops
          channel.reject(message, false);
        }
      }
    });
    
    // User notifications consumer
    channel.consume(USER_QUEUE, async (message) => {
      if (message !== null) {
        try {
          await processUserMessage(message);
          channel.ack(message);
        } catch (error) {
          channel.reject(message, false);
        }
      }
    });
    
    // Event notifications consumer
    channel.consume(EVENT_QUEUE, async (message) => {
      if (message !== null) {
        try {
          await processEventMessage(message);
          channel.ack(message);
        } catch (error) {
          channel.reject(message, false);
        }
      }
    });
    
    console.log('RabbitMQ consumers started');
  } catch (error) {
    console.error('Error starting RabbitMQ consumers:', error);
    process.exit(1);
  }
};

module.exports = {
  connectRabbitMQ,
  startConsumers
};