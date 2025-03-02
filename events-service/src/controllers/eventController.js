// src/controllers/eventController.js
const Event = require('../models/Event');

// Get all events
exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find({});
    res.status(200).json({ success: true, count: events.length, data: events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, message: 'Error fetching events', error: error.message });
  }
};

// Get a single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ success: false, message: 'Error fetching event', error: error.message });
  }
};

// Create a new event
exports.createEvent = async (req, res) => {
  try {
    const newEvent = await Event.create(req.body);
    res.status(201).json({ success: true, data: newEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ success: false, message: 'Error creating event', error: error.message });
  }
};

// Update an event
exports.updateEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ success: false, message: 'Error updating event', error: error.message });
  }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    res.status(200).json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Error deleting event', error: error.message });
  }
};

// Check event availability
exports.checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { tickets } = req.query;
    
    const requestedTickets = parseInt(tickets, 10) || 1;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    const isAvailable = event.checkAvailability(requestedTickets);
    
    res.status(200).json({
      success: true,
      available: isAvailable,
      event: {
        id: event._id,
        title: event.title,
        availableTickets: event.availableTickets,
        requestedTickets
      }
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ success: false, message: 'Error checking availability', error: error.message });
  }
};

// Book tickets for an event (decrease available tickets)
exports.bookTickets = async (req, res) => {
  try {
    const { id } = req.params;
    const { tickets } = req.body;
    
    const requestedTickets = parseInt(tickets, 10) || 1;
    
    const event = await Event.findById(id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    
    if (!event.checkAvailability(requestedTickets)) {
      return res.status(400).json({
        success: false,
        message: 'Not enough tickets available',
        availableTickets: event.availableTickets,
        requestedTickets
      });
    }
    
    event.availableTickets -= requestedTickets;
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Tickets booked successfully',
      event: {
        id: event._id,
        title: event.title,
        availableTickets: event.availableTickets,
        bookedTickets: requestedTickets
      }
    });
  } catch (error) {
    console.error('Error booking tickets:', error);
    res.status(500).json({ success: false, message: 'Error booking tickets', error: error.message });
  }
};

// Search events by criteria
exports.searchEvents = async (req, res) => {
  try {
    const { title, category, date, minPrice, maxPrice } = req.query;
    
    // Build query
    const query = {};
    
    if (title) {
      query.title = { $regex: title, $options: 'i' };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (date) {
      // Convert date string to Date object (YYYY-MM-DD)
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = { $gte: searchDate, $lt: nextDay };
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      
      if (minPrice !== undefined) {
        query.price.$gte = Number(minPrice);
      }
      
      if (maxPrice !== undefined) {
        query.price.$lte = Number(maxPrice);
      }
    }
    
    const events = await Event.find(query);
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ success: false, message: 'Error searching events', error: error.message });
  }
};