// src/services/paymentService.js
const Payment = require('../models/Payment');

// Mock payment gateway service
const processPayment = async (bookingId, amount, method = 'credit_card') => {
  try {
    // In a real system, this would call an external payment API
    // For this mock, we'll simulate a successful payment

    // Create a delay to simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate a successful transaction with 90% probability
    const isSuccessful = Math.random() < 0.9;
    
    if (!isSuccessful) {
      throw new Error('Payment processing failed');
    }
    
    // Generate a mock transaction ID
    const transactionId = `tx_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    
    // Record the payment in our database
    const payment = await Payment.create({
      bookingId,
      amount,
      method,
      status: 'COMPLETED',
      transactionId,
      currency: 'USD'
    });
    
    return {
      success: true,
      payment: payment,
      message: 'Payment processed successfully'
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    
    // Record the failed payment
    await Payment.create({
      bookingId,
      amount,
      method,
      status: 'FAILED',
      currency: 'USD'
    });
    
    throw new Error(`Payment failed: ${error.message}`);
  }
};

// Get payment details
const getPaymentById = async (paymentId) => {
  try {
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }
    return payment;
  } catch (error) {
    console.error(`Error fetching payment ${paymentId}:`, error);
    throw error;
  }
};

// Get payments for a booking
const getPaymentsForBooking = async (bookingId) => {
  try {
    const payments = await Payment.findAll({
      where: { bookingId }
    });
    return payments;
  } catch (error) {
    console.error(`Error fetching payments for booking ${bookingId}:`, error);
    throw error;
  }
};

module.exports = {
  processPayment,
  getPaymentById,
  getPaymentsForBooking
};