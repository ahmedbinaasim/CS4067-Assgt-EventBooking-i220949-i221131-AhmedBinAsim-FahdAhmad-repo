# Booking Service

The Booking Service manages ticket bookings, payment processing, and maintains booking records for the Event Booking Platform.

## Features

- Create and manage event bookings
- Process payments via a mock payment gateway
- Check event availability with the Event Service
- Send booking notifications via RabbitMQ
- View booking history for users

## Architecture

The Booking Service is built with Express.js and uses SQLite for data storage. It communicates with other services through REST APIs and sends notifications via RabbitMQ for booking confirmations and cancellations.

### Data Flow

1. User initiates a booking through the API
2. Service checks event availability with the Event Service
3. Mock payment is processed
4. Booking is recorded in the database
5. Notification is sent via RabbitMQ
6. Users can view and manage their bookings

## API Endpoints

### Booking Management

#### Create a new booking
- **URL**: `/api/bookings`
- **Method**: `POST`
- **Auth required**: Yes (JWT token in Authorization header)
- **Request body**:
  ```json
  {
    "eventId": "60d21b4667d0d8992e610c85",
    "tickets": 2,
    "paymentMethod": "credit_card",
    "paymentDetails": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvv": "123"
    }
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "userId": 5,
    "eventId": "60d21b4667d0d8992e610c85",
    "eventTitle": "Music Festival",
    "tickets": 2,
    "totalAmount": 160.00,
    "status": "CONFIRMED",
    "paymentId": "pay_123456",
    "bookingReference": "BK-12345",
    "createdAt": "2023-01-05T10:30:00.000Z"
  }
  ```

#### Get all bookings for authenticated user
- **URL**: `/api/bookings`
- **Method**: `GET`
- **Auth required**: Yes (JWT token in Authorization header)
- **Response**:
  ```json
  [
    {
      "id": 1,
      "eventId": "60d21b4667d0d8992e610c85",
      "eventTitle": "Music Festival",
      "tickets": 2,
      "totalAmount": 160.00,
      "status": "CONFIRMED",
      "bookingReference": "BK-12345",
      "createdAt": "2023-01-05T10:30:00.000Z"
    },
    {
      "id": 2,
      "eventId": "60d21b4667d0d8992e610c86",
      "eventTitle": "Tech Conference",
      "tickets": 1,
      "totalAmount": 50.00,
      "status": "CONFIRMED",
      "bookingReference": "BK-12346",
      "createdAt": "2023-01-06T14:20:00.000Z"
    }
  ]
  ```

#### Get booking by ID
- **URL**: `/api/bookings/:id`
- **Method**: `GET`
- **Auth required**: Yes (JWT token in Authorization header)
- **Response**:
  ```json
  {
    "id": 1,
    "userId": 5,
    "eventId": "60d21b4667d0d8992e610c85",
    "eventTitle": "Music Festival",
    "tickets": 2,
    "totalAmount": 160.00,
    "status": "CONFIRMED",
    "paymentId": "pay_123456",
    "bookingReference": "BK-12345",
    "createdAt": "2023-01-05T10:30:00.000Z",
    "event": {
      "title": "Music Festival",
      "date": "2023-06-15T18:00:00.000Z",
      "location": "City Park"
    }
  }
  ```

#### Cancel a booking
- **URL**: `/api/bookings/:id/cancel`
- **Method**: `POST`
- **Auth required**: Yes (JWT token in Authorization header)
- **Response**:
  ```json
  {
    "id": 1,
    "status": "CANCELLED",
    "cancelledAt": "2023-01-07T09:15:00.000Z",
    "refundId": "ref_123456",
    "refundAmount": 160.00,
    "message": "Booking successfully cancelled and refund processed."
  }
  ```

## Database Schema

### Bookings Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-incremented |
| userId | INTEGER | ID of the user who made the booking |
| eventId | TEXT | ID of the booked event |
| eventTitle | TEXT | Title of the event at time of booking |
| tickets | INTEGER | Number of tickets booked |
| totalAmount | REAL | Total amount paid |
| status | TEXT | Booking status (PENDING, CONFIRMED, CANCELLED) |
| paymentId | TEXT | ID from payment processor |
| paymentMethod | TEXT | Method of payment |
| bookingReference | TEXT | Unique booking reference |
| cancelledAt | TEXT | Timestamp of cancellation (if applicable) |
| refundId | TEXT | ID of refund transaction (if applicable) |
| createdAt | TEXT | Timestamp of creation |
| updatedAt | TEXT | Timestamp of last update |

## External Service Integration

### Event Service

- **Check availability**: Before confirming a booking, the service checks event availability
  ```
  GET /api/events/{eventId}/availability
  ```

### Payment Gateway (Mock)

- **Process payment**: Process payment for booking
  ```
  POST /api/payments
  {
    "amount": 160.00,
    "currency": "USD",
    "paymentMethod": "credit_card",
    "paymentDetails": {...}
  }
  ```

## RabbitMQ Integration

This service publishes messages to the RabbitMQ exchange when:

1. A booking is confirmed
2. A booking is cancelled
3. Payment fails

### Message Format

```json
{
  "type": "BOOKING_CONFIRMED",
  "data": {
    "bookingId": 1,
    "userId": 5,
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

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3003
NODE_ENV=development

# Database
DB_PATH=./data/bookings.sqlite

# Services
EVENT_SERVICE_URL=http://localhost:3002
PAYMENT_GATEWAY_URL=http://localhost:3005

# RabbitMQ
RABBITMQ_URL=amqp://localhost
NOTIFICATION_EXCHANGE=notifications

# JWT
JWT_SECRET=your_jwt_secret_key
```

## Installation and Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables in `.env` file

3. Initialize the database:
   ```
   npm run db:init
   ```

4. Start the server:
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

### Using curl

Create a booking (requires authentication token):
```
curl -X POST http://localhost:3003/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "eventId": "60d21b4667d0d8992e610c85",
    "tickets": 2,
    "paymentMethod": "credit_card",
    "paymentDetails": {
      "cardNumber": "4111111111111111",
      "expiryMonth": "12",
      "expiryYear": "2025",
      "cvv": "123"
    }
  }'
```

Get user bookings (requires authentication token):
```
curl -X GET http://localhost:3003/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Dependencies

- express: Web framework
- sqlite3: SQLite database driver
- axios: HTTP client for service communication
- amqplib: RabbitMQ client
- jsonwebtoken: JWT implementation
- dotenv: Environment variable management
- morgan: HTTP request logger