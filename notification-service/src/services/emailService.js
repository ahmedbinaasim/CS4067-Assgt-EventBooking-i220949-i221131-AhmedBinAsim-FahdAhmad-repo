// src/services/emailService.js
const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// Send email notification
const sendEmail = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Email templates

// Booking confirmation template
const generateBookingConfirmationEmail = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Confirmation</h2>
      <p>Dear ${data.userName || 'Valued Customer'},</p>
      <p>Your booking for <strong>${data.eventTitle}</strong> has been confirmed!</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Event:</strong> ${data.eventTitle}</p>
        <p><strong>Date:</strong> ${data.eventDate || 'See event details'}</p>
        <p><strong>Number of Tickets:</strong> ${data.tickets}</p>
        <p><strong>Total Price:</strong> ${data.currency || '$'}${data.amount || ''}</p>
        <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      </div>
      
      <p>Thank you for your purchase. If you have any questions, please contact our support team.</p>
      
      <p>Best regards,<br>
      Event Booking Team</p>
    </div>
  `;
};

// Booking cancellation template
const generateBookingCancellationEmail = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Booking Cancellation</h2>
      <p>Dear ${data.userName || 'Valued Customer'},</p>
      <p>Your booking for <strong>${data.eventTitle}</strong> has been cancelled as requested.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Booking Details</h3>
        <p><strong>Event:</strong> ${data.eventTitle}</p>
        <p><strong>Booking ID:</strong> ${data.bookingId}</p>
      </div>
      
      <p>If you did not request this cancellation or have any questions, please contact our support team immediately.</p>
      
      <p>Best regards,<br>
      Event Booking Team</p>
    </div>
  `;
};

// User registration template
const generateUserRegistrationEmail = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Event Booking Platform!</h2>
      <p>Dear ${data.userName || 'New User'},</p>
      <p>Thank you for registering with our event booking platform.</p>
      <p>Your account has been successfully created and you can now browse and book events.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Account Details</h3>
        <p><strong>Email:</strong> ${data.email}</p>
      </div>
      
      <p>If you didn't create this account, please contact our support team immediately.</p>
      
      <p>Best regards,<br>
      Event Booking Team</p>
    </div>
  `;
};

// Event update template
const generateEventUpdateEmail = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Event Update: ${data.eventTitle}</h2>
      <p>Dear ${data.userName || 'Valued Customer'},</p>
      <p>We're writing to inform you about an update to an event you're attending.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Event Details</h3>
        <p><strong>Event:</strong> ${data.eventTitle}</p>
        <p><strong>Date:</strong> ${data.eventDate || 'See event details'}</p>
        <p><strong>Location:</strong> ${data.eventLocation || 'See event details'}</p>
        <p><strong>Update:</strong> ${data.updateMessage || 'The event details have been updated.'}</p>
      </div>
      
      <p>Thank you for your understanding.</p>
      
      <p>Best regards,<br>
      Event Booking Team</p>
    </div>
  `;
};

module.exports = {
  sendEmail,
  generateBookingConfirmationEmail,
  generateBookingCancellationEmail,
  generateUserRegistrationEmail,
  generateEventUpdateEmail
};