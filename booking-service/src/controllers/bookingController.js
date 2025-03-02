// src/controllers/bookingController.js
const Booking = require('../models/Booking');
const eventService = require('../services/eventService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { eventId, numberOfTickets, notes } = req.body;
    const userId = req.user.id; // From auth middleware
    
    // Validate input
    if (!eventId || !numberOfTickets) {
      return res.status(400).json({ 
        success: false,
        message: 'Event ID and number of tickets are required' 
      });
    }
    
    // Check event availability
    const availabilityCheck = await eventService.checkEventAvailability(
      eventId, 
      numberOfTickets
    );
    
    if (!availabilityCheck.available) {
      return res.status(400).json({ 
        success: false,
        message: 'Not enough tickets available for this event',
        available: availabilityCheck.event.availableTickets,
        requested: numberOfTickets
      });
    }
    
    // Get event details for price calculation
    const event = await eventService.getEventById(eventId);
    const totalPrice = event.price * numberOfTickets;
    
    // Create booking record
    const booking = await Booking.create({
      userId,
      eventId,
      numberOfTickets,
      totalPrice,
      status: 'PENDING',
      notes
    });
    
    // Try to process payment
    try {
      const paymentResult = await paymentService.processPayment(
        booking.id,
        totalPrice,
        'credit_card' // Default payment method
      );
      
      // Update booking with payment info
      booking.paymentId = paymentResult.payment.id;
      booking.status = 'CONFIRMED';
      await booking.save();
      
      // Book the tickets in the event service
      await eventService.bookEventTickets(eventId, numberOfTickets);
      
      // Send notification via RabbitMQ
      await notificationService.sendNotification({
        booking_id: booking.id,
        user_id: userId,
        user_email: req.user.email,
        event_id: eventId,
        event_title: event.title,
        tickets: numberOfTickets,
        status: 'CONFIRMED',
        timestamp: new Date().toISOString()
      });
      
      return res.status(201).json({
        success: true,
        message: 'Booking confirmed successfully',
        booking: {
          id: booking.id,
          eventId: booking.eventId,
          numberOfTickets: booking.numberOfTickets,
          totalPrice: booking.totalPrice,
          status: booking.status,
          createdAt: booking.createdAt
        },
        payment: {
          id: paymentResult.payment.id,
          status: paymentResult.payment.status,
          transactionId: paymentResult.payment.transactionId
        }
      });
    } catch (paymentError) {
      // Update booking to reflect failed payment
      booking.status = 'CANCELLED';
      await booking.save();
      
      return res.status(400).json({
        success: false,
        message: 'Payment failed',
        error: paymentError.message,
        booking: {
          id: booking.id,
          status: booking.status
        }
      });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating booking', 
      error: error.message 
    });
  }
};

// Get all bookings for a user
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const bookings = await Booking.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching bookings', 
      error: error.message 
    });
  }
};

// Get a single booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From auth middleware
    
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    // Security check: Users can only view their own bookings
    if (booking.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized to view this booking' 
      });
    }
    
    // Get associated payment(s)
    const payments = await paymentService.getPaymentsForBooking(booking.id);
    
    // Get event details
    const event = await eventService.getEventById(booking.eventId);
    
    res.status(200).json({
      success: true,
      booking,
      payments,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
        time: event.time,
        location: event.location,
        price: event.price
      }
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching booking', 
      error: error.message 
    });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id; // From auth middleware
    
    const booking = await Booking.findByPk(id);
    
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }
    
    // Security check: Users can only cancel their own bookings
    if (booking.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized to cancel this booking' 
      });
    }
    
    // Can only cancel if not already cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking is already cancelled' 
      });
    }
    
    // Update booking status
    booking.status = 'CANCELLED';
    await booking.save();
    
    // Send notification about the cancellation
    await notificationService.sendNotification({
      booking_id: booking.id,
      user_id: userId,
      user_email: req.user.email,
      event_id: booking.eventId,
      tickets: booking.numberOfTickets,
      status: 'CANCELLED',
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: {
        id: booking.id,
        status: booking.status,
        updatedAt: booking.updatedAt
      }
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
};