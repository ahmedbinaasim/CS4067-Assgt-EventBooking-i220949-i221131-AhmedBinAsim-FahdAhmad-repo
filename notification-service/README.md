# Notification Service

The Notification Service handles sending notifications to users about events, bookings, and account activities for the Event Booking Platform.

## Features

- Consumes messages from RabbitMQ queues
- Tracks notification history and delivery status
- Sends email notifications via Nodemailer
- Provides API endpoints to query notification history

## Architecture

The Notification Service is built with Express.js and uses MongoDB for storing notification records. It primarily operates by consuming messages from RabbitMQ queues and processing them accordingly.

### Data Flow

1. Other services (User, Event, Booking) publish messages to RabbitMQ
2. This service consumes the messages from appropriate queues
3. Notifications are sent to users via email
4. Notification records are stored in MongoDB
5. API endpoints allow querying of notification history

## API Endpoints

### Notification Management

#### Get all notifications
- **URL**: `/api/notifications`
- **Method**: `GET`
- **Auth required**: Yes (Admin)
- **Query parameters**:
  - `limit`: Number of notifications to return (default: 20)
  - `page`: Page number for pagination (default: 1)
- **Response**:
  ```json
  {
    "notifications": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "recipientId": "5",
        "recipientEmail": "john@example.com",
        "type": "BOOKING_CONFIRMED",
        "title": "Booking Confirmed",
        "message": "Your booking for Music Festival has been confirmed.",
        "status": "SENT",
        "createdAt": "2023-01-05T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
  ```

#### Get notification statistics
- **URL**: `/api/notifications/stats`
- **Method**: `GET`
- **Auth required**: Yes (Admin)
- **Response**:
  ```json
  {
    "total": 100,
    "sent": 95,
    "failed": 5,
    "byType": {
      "BOOKING_CONFIRMED": 40,
      "BOOKING_CANCELLED": 10,
      "USER_REGISTERED": 25,
      "EVENT_UPDATED": 25
    },
    "last24Hours": 15
  }
  ```

#### Get notification by ID
- **URL**: `/api/notifications/:id`
- **Method**: `GET`
- **Auth required**: Yes (Admin or notification recipient)
- **Response**:
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "recipientId": "5",
    "recipientEmail": "john@example.com",
    "type": "BOOKING_CONFIRMED",
    "title": "Booking Confirmed",
    "message": "Your booking for Music Festival has been confirmed.",
    "content": {
      "bookingId": 1,
      "eventTitle": "Music Festival",
      "tickets": 2,
      "totalAmount": 160.00,
      "bookingReference": "BK-12345"
    },
    "status": "SENT",
    "sentAt": "2023-01-05T10:30:05.000Z",
    "createdAt": "2023-01-05T10:30:00.000Z"
  }
  ```

#### Get notifications by recipient
- **URL**: `/api/notifications/recipient/:recipientId`
- **Method**: `GET`
- **Auth required**: Yes (Admin or notification recipient)
- **Query parameters**:
  - `limit`: Number of notifications to return (default: 20)
  - `page`: Page number for pagination (default: 1)
- **Response**:
  ```json
  {
    "notifications": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "type": "BOOKING_CONFIRMED",
        "title": "Booking Confirmed",
        "message": "Your booking for Music Festival has been confirmed.",
        "status": "SENT",
        "createdAt": "2023-01-05T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
  ```

#### Get notifications by type
- **URL**: `/api/notifications/type/:type`
- **Method**: `GET`
- **Auth required**: Yes (Admin)
- **Response**:
  ```json
  {
    "notifications": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "recipientId": "5",
        "recipientEmail": "john@example.com",
        "title": "Booking Confirmed",
        "message": "Your booking for Music Festival has been confirmed.",
        "status": "SENT",
        "createdAt": "2023-01-05T10:30:00.000Z"
      }
    ],
    "total": 1
  }
  ```

#### Get notifications by status
- **URL**: `/api/notifications/status/:status`
- **Method**: `GET`
- **Auth required**: Yes (Admin)
- **Response**:
  ```json
  {
    "notifications": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "recipientId": "5",
        "recipientEmail": "john@example.com",
        "type": "BOOKING_CONFIRMED",
        "title": "Booking Confirmed",
        "message": "Your booking for Music Festival has been confirmed.",
        "createdAt": "2023-01-05T10:30:00.000Z"
      }
    ],
    "total": 1
  }
  ```

#### Create a manual notification (for testing)
- **URL**: `/api/notifications`
- **Method**: `POST`
- **Auth required**: Yes (Admin)
- **Request body**:
  ```json
  {
    "recipientId": "5",
    "recipientEmail": "john@example.com",
    "type": "TEST_NOTIFICATION",
    "title": "Test Notification",
    "message": "This is a test notification."
  }
  ```
- **Response**:
  ```json
  {
    "_id": "60d21b4667d0d8992e610c86",
    "recipientId": "5",
    "recipientEmail": "john@example.com",
    "type": "TEST_NOTIFICATION",
    "title": "Test Notification",
    "message": "This is a test notification.",
    "status": "PENDING",
    "createdAt": "2023-01-05T10:30:00.000Z"
  }
  ```

## Database Schema

### Notifications Collection

```javascript
{
  _id: ObjectId,
  recipientId: String,
  recipientEmail: String,
  type: String,
  title: String,
  message: String,
  content: Object,
  status: String,  // PENDING, SENT, FAILED
  sentAt: Date,
  failureReason: String,
  retryCount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## RabbitMQ Integration

This service consumes messages from the following RabbitMQ queues:

1. `user-notifications`: Messages about user registration and profile updates
2. `event-notifications`: Messages about event creations, updates, and deletions
3. `booking-notifications`: Messages about booking confirmations and cancellations

### Message Processing

For each message type, the service:
1. Extracts recipient information
2. Generates appropriate notification content
3. Sends the notification via email
4. Records the notification in the database

### Supported Message Types

- `USER_REGISTERED`: When a new user registers
- `USER_UPDATED`: When a user updates their profile
- `EVENT_CREATED`: When a new event is created
- `EVENT_UPDATED`: When an event is updated
- `EVENT_DELETED`: When an event is deleted
- `BOOKING_CONFIRMED`: When a booking is confirmed
- `BOOKING_CANCELLED`: When a booking is cancelled
- `PAYMENT_FAILED`: When a payment fails

## Email Delivery

The service uses Nodemailer to send email notifications. Email templates are stored in the `/templates` directory and use a simple templating system to inject dynamic content.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3004
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/notification-service

# RabbitMQ
RABBITMQ_URL=amqp://localhost
NOTIFICATION_EXCHANGE=notifications
USER_QUEUE=user-notifications
EVENT_QUEUE=event-notifications
BOOKING_QUEUE=booking-notifications

# Email (Nodemailer)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=notifications@example.com
EMAIL_PASS=your_password
EMAIL_FROM=Event Booking <notifications@example.com>

# JWT (for API authentication)
JWT_SECRET=your_jwt_secret_key
```

## Installation and Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env` file

3. Start the server:
   ```
   npm start
   ```

   For development with auto-reload:
   ```
   npm run dev
   ```

## Testing

### Using Postman

Import the Postman collection from the `/postman` directory for comprehensive API testing.

### RabbitMQ Message Testing

You can test the notification service by publishing test messages to RabbitMQ:

Example message for booking confirmation:
```json
{
  "type": "BOOKING_CONFIRMED",
  "data": {
    "bookingId": 1,
    "userId": "5",
    "userEmail": "john@example.com",
    "eventId": "60d21b4667d0d8992e610c85",
    "eventTitle": "Music Festival",
    "tickets": 2,
    "totalAmount": 160.00,
    "bookingReference": "BK-12345"
  },
  "timestamp": "2023-01-05T10:30:00.000Z"
}
```

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- amqplib: RabbitMQ client
- nodemailer: Email sending
- dotenv: Environment variable management
- jsonwebtoken: JWT implementation
- morgan: HTTP request logger