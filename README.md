# Microservices-Based Online Event Booking Platform

This project implements an online event booking platform using a microservices architecture. It demonstrates synchronous and asynchronous communication between services, integration with different database technologies, and DevOps practices.

## Architecture Overview

The system consists of four microservices:

1. **User Service**: Manages user authentication and profiles (Express.js + SQLite)
2. **Event Service**: Manages event listings and details (Node.js + MongoDB)
3. **Booking Service**: Handles ticket bookings and payments (Express.js + SQLite)
4. **Notification Service**: Sends email notifications (Express.js + MongoDB)

![Architecture Diagram](docs/architecture-diagram.png)

## Communication Patterns

### Synchronous Communication (REST API)
- User Service → Event Service: Users retrieve available events
- User Service → Booking Service: Users create bookings
- Booking Service → Event Service: Check event availability before booking
- Booking Service → Payment Gateway: Process payments

### Asynchronous Communication (RabbitMQ)
- Booking Service → Notification Service: Send booking confirmations
- User Service → Notification Service: Send registration notifications
- Event Service → Notification Service: Send event update notifications

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- RabbitMQ
- SMTP server access (for email notifications)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/ahmedbinaasim/CS4067-Assgt-EventBooking-i220949-i221131-AhmedBinAsim-FahdAhmad-repo.git
   cd CS4067-Assgt-EventBooking-i220949-i221131-AhmedBinAsim-FahdAhmad-repo


### API Documentation
## User Service

POST /api/users/register - Register a new user
POST /api/users/login - Login and get JWT token
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update user profile
GET /api/events - Get events (proxies to Event Service)

## Event Service

GET /api/events - Get all events
GET /api/events/:id - Get event by ID
POST /api/events - Create new event
PUT /api/events/:id - Update event
DELETE /api/events/:id - Delete event
GET /api/events/:id/availability - Check ticket availability
POST /api/events/:id/book - Book tickets

## Booking Service

POST /api/bookings - Create a new booking
GET /api/bookings - Get all bookings for the authenticated user
GET /api/bookings/:id - Get booking by ID
POST /api/bookings/:id/cancel - Cancel a booking

## Notification Service

GET /api/notifications - Get all notifications
GET /api/notifications/stats - Get notification statistics
GET /api/notifications/:id - Get notification by ID
GET /api/notifications/recipient/:recipientId - Get notifications by recipient
GET /api/notifications/type/:type - Get notifications by type
GET /api/notifications/status/:status - Get notifications by status
POST /api/notifications - Create a manual notification (for testing)