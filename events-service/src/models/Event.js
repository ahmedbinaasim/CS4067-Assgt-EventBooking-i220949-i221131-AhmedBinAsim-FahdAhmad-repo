// src/models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an event title'],
    trim: true,
    maxlength: [100, 'Event title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide an event description'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please provide an event date']
  },
  time: {
    type: String,
    required: [true, 'Please provide an event time']
  },
  location: {
    type: String,
    required: [true, 'Please provide an event location'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide an event category'],
    enum: ['Conference', 'Seminar', 'Workshop', 'Concert', 'Exhibition', 'Other'],
    default: 'Other'
  },
  organizer: {
    type: String,
    required: [true, 'Please provide event organizer information']
  },
  price: {
    type: Number,
    required: [true, 'Please provide ticket price'],
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  totalTickets: {
    type: Number,
    required: [true, 'Please provide total number of tickets'],
    min: [1, 'At least one ticket must be available']
  },
  availableTickets: {
    type: Number,
    required: [true, 'Please provide number of available tickets'],
    min: [0, 'Available tickets cannot be negative']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  image: {
    type: String,
    default: 'default-event.jpg'
  },
  tags: {
    type: [String],
    default: []
  }
}, { 
  timestamps: true 
});

// Virtual field for checking if the event is sold out
eventSchema.virtual('isSoldOut').get(function() {
  return this.availableTickets === 0;
});

// Pre-save hook to ensure availableTickets doesn't exceed totalTickets
eventSchema.pre('save', function(next) {
  if (this.availableTickets > this.totalTickets) {
    this.availableTickets = this.totalTickets;
  }
  next();
});

// Add method to check availability
eventSchema.methods.checkAvailability = function(requestedTickets) {
  return this.availableTickets >= requestedTickets;
};

// Add method to update ticket availability
eventSchema.methods.bookTickets = function(requestedTickets) {
  if (!this.checkAvailability(requestedTickets)) {
    return false;
  }
  this.availableTickets -= requestedTickets;
  return true;
};

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;