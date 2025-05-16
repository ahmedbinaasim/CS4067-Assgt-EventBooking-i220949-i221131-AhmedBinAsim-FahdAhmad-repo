# CS4067 Event Booking Platform

A microservices-based online event booking platform that demonstrates synchronous and asynchronous communication between services.

## Project Overview

This platform consists of four interconnected microservices:

1. **User Service** - Handles user authentication and profiles
2. **Event Service** - Manages event listings and details
3. **Booking Service** - Processes ticket bookings and payments
4. **Notification Service** - Delivers notifications to users

The architecture implements both synchronous communication via REST APIs and asynchronous communication through RabbitMQ message queues.

## Architecture-Diagram

```
┌─────────────┐      ┌─────────────┐
│             │      │             │
│ User Service│◄────►│Event Service│
│             │      │             │
└──────┬──────┘      └──────┬──────┘
       │                    │
       │                    │
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│             │      │             │
│   Booking   │◄────►│Notification │
│   Service   │      │   Service   │
│             │      │             │
└─────────────┘      └─────────────┘
       ▲                    ▲
       │                    │
       │                    │
       └─────RabbitMQ───────┘
```

## Communication Flow

- **Synchronous (REST API)**:
  - User Service → Event Service: Retrieve events
  - User Service → Booking Service: Create bookings
  - Booking Service → Event Service: Check availability
  - Booking Service → Payment Gateway: Process payments

- **Asynchronous (RabbitMQ)**:
  - User Service → Notification Service: User registration/updates
  - Event Service → Notification Service: Event updates
  - Booking Service → Notification Service: Booking confirmations/cancellations

## Tech Stack

- **Backend**: Node.js, Express.js
- **Databases**: MongoDB (Event & Notification Services), SQLite (User & Booking Services)
- **Message Broker**: RabbitMQ
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Postman Collections

## Getting Started

### Prerequisites

- Node.js (v14+)
- RabbitMQ server
- MongoDB
- SQLite

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/CS4067-Assgt-EventBooking-RollNo-YourName-repo.git
   cd CS4067-Assgt-EventBooking-RollNo-YourName-repo
   ```

2. Install dependencies for each service:
   ```
   cd user-service && npm install
   cd ../event-service && npm install
   cd ../booking-service && npm install
   cd ../notification-service && npm install
   ```

3. Configure environment variables by creating `.env` files in each service directory based on the provided examples.

4. Start the services (in separate terminals):
   ```
   cd user-service && npm start
   cd event-service && npm start
   cd booking-service && npm start
   cd notification-service && npm start
   ```

## Testing with Postman

1. Import the Postman collections from the `postman` directory
2. Set up the environment variables in Postman
3. Test the endpoints in the recommended sequence:
   - User Service endpoints
   - Event Service endpoints
   - Booking Service endpoints
   - Notification Service endpoints

## Directory Structure

```
/CS4067-Assgt-EventBooking-RollNo-YourName-repo
  /user-service       # User authentication and profile management
  /event-service      # Event listings and management
  /booking-service    # Ticket bookings and payment processing
  /notification-service # Notification delivery system
  /postman            # Postman collections for testing
  README.md           # Main project documentation
```

## Documentation

Each microservice has its own README with detailed information on:
- Service architecture and data flow
- API endpoints with request/response examples
- Database schema
- Environment variables
- Testing instructions

## Project Requirements

This project fulfills the requirements for the CS4067 DevOps and Cloud Native course assignment:

- Microservices architecture with clear separation of concerns
- Mixture of synchronous and asynchronous communication
- MongoDB and SQLite integration for data storage
- RabbitMQ for messaging between services
- Proper error handling and logging

## License

[MIT License](LICENSE)
