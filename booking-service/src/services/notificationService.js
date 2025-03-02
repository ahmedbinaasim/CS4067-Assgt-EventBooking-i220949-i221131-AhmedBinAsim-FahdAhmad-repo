// src/services/notificationService.js
const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const QUEUE_NAME = 'booking_notifications';

// Send a notification via RabbitMQ
const sendNotification = async (notificationData) => {
  try {
    // Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Assert the queue exists
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    
    // Send the message
    const message = JSON.stringify(notificationData);
    const result = channel.sendToQueue(QUEUE_NAME, Buffer.from(message), {
      persistent: true
    });
    
    console.log(`Notification sent to queue: ${QUEUE_NAME}`);
    
    // Close the connection
    setTimeout(() => {
      connection.close();
    }, 500);
    
    return {
      success: true,
      message: 'Notification sent to queue',
      queueName: QUEUE_NAME
    };
  } catch (error) {
    console.error('Error sending notification to queue:', error);
    // In a real system, we would implement retry logic or store failed messages
    throw new Error(`Failed to send notification: ${error.message}`);
  }
};

module.exports = {
  sendNotification
};