# Event Service

The Event Service manages event listings, details, and availability for the Event Booking Platform.

## Features

- Event creation, retrieval, updating, and deletion
- Event availability checking
- Event searching functionality
- RabbitMQ integration for event notifications

## Architecture

The Event Service is built with Node.js and Express, using MongoDB for data storage. It communicates with other services via REST APIs and sends notifications through RabbitMQ.

### Data Flow

1. Event data is stored in MongoDB
2. REST API endpoints allow for CRUD operations on events
3. The service provides endpoints to check event availability
4. When events are created, updated, or deleted, notifications are sent via RabbitMQ
5. The Booking Service communicates with this service to check event availability

## API Endpoints

### Event Management

#### Get all events
- **URL**: `/api/events`
- **Method**: `GET`
- **Auth required**: No
- **Query parameters**:
  - `limit`: Number of events to return (default: 10)
  - `page`: Page number for pagination (default: 1)
  - `sort`: Field to sort by (default: date)
  - `order`: Sort order (asc/desc, default: asc)
- **Response**:
  ```json
  {
    "events": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "title": "Music Festival",
        "description": "Annual music festival featuring top artists",
        "date": "2023-06-15T18:00:00.000Z",
        "location": "City Park",
        "price": 75.00,
        "availableSeats": 1000,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
  ```

#### Create a new event
- **URL**: `/api/events`
- **Method**: `POST`
- **Auth required**: Yes (Admin)
- **Request body**:
  ```json
  {
    "title": "Music Festival",
    "description": "Annual music festival featuring top artists",
    "date": "2023-06-15T18:00:00.000Z",
    "location": "City Park",
    "price": 75.00,
    "availableSeats": 1000
  }
  ```
- **Response**:
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Music Festival",
    "description": "Annual music festival featuring top artists",
    "date": "2023-06-15T18:00:00.000Z",
    "location": "City Park",
    "price": 75.00,
    "availableSeats": 1000,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

#### Get event by ID
- **URL**: `/api/events/:id`
- **Method**: `GET`
- **Auth required**: No
- **Response**:
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Music Festival",
    "description": "Annual music festival featuring top artists",
    "date": "2023-06-15T18:00:00.000Z",
    "location": "City Park",
    "price": 75.00,
    "availableSeats": 1000,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

#### Update event
- **URL**: `/api/events/:id`
- **Method**: `PUT`
- **Auth required**: Yes (Admin)
- **Request body**:
  ```json
  {
    "price": 80.00,
    "availableSeats": 950
  }
  ```
- **Response**:
  ```json
  {
    "_id": "60d21b4667d0d8992e610c85",
    "title": "Music Festival",
    "description": "Annual music festival featuring top artists",
    "date": "2023-06-15T18:00:00.000Z",
    "location": "City Park",
    "price": 80.00,
    "availableSeats": 950,
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
  ```

#### Delete event
- **URL**: `/api/events/:id`
- **Method**: `DELETE`
- **Auth required**: Yes (Admin)
- **Response**: Status Code 204 (No Content)

#### Check event availability
- **URL**: `/api/events/:id/availability`
- **Method**: `GET`
- **Auth required**: No
- **Response**:
  ```json
  {
    "eventId": "60d21b4667d0d8992e610c85",
    "available": true,
    "availableSeats": 950
  }
  ```

#### Book tickets for an event
- **URL**: `/api/events/:id/book`
- **Method**: `POST`
- **Auth required**: Yes
- **Request body**:
  ```json
  {
    "tickets": 2
  }
  ```
- **Response**:
  ```json
  {
    "eventId": "60d21b4667d0d8992e610c85",
    "tickets": 2,
    "success": true,
    "remainingSeats": 948
  }
  ```

#### Search events
- **URL**: `/api/events/search`
- **Method**: `GET`
- **Auth required**: No
- **Query parameters**:
  - `query`: Search term (searches title and description)
  - `startDate`: Filter events starting from this date
  - `endDate`: Filter events until this date
  - `minPrice`: Minimum price
  - `maxPrice`: Maximum price
  - `location`: Filter by location
- **Response**:
  ```json
  {
    "events": [
      {
        "_id": "60d21b4667d0d8992e610c85",
        "title": "Music Festival",
        "description": "Annual music festival featuring top artists",
        "date": "2023-06-15T18:00:00.000Z",
        "location": "City Park",
        "price": 80.00,
        "availableSeats": 948
      }
    ],
    "total": 1
  }
  ```

## Database Schema

### Events Collection

```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  date: Date,
  location: String,
  price: Number,
  availableSeats: Number,
  imageUrl: String,
  categories: [String],
  tags: [String],
  organizer: String,
  featured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## RabbitMQ Integration

This service publishes messages to the RabbitMQ exchange when:

1. A new event is created
2. An event is updated
3. An event is deleted
4. Event availability changes

### Message Format

```json
{
  "type": "EVENT_CREATED",
  "data": {
    "eventId": "60d21b4667d0d8992e610c85",
    "title": "Music Festival",
    "date": "2023-06-15T18:00:00.000Z"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3002
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/event-service

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

### Using curl

Get all events:
```
curl -X GET http://localhost:3002/api/events
```

Get a specific event:
```
curl -X GET http://localhost:3002/api/events/60d21b4667d0d8992e610c85
```

## Dependencies

- express: Web framework
- mongoose: MongoDB ODM
- amqplib: RabbitMQ client
- dotenv: Environment variable management
- jsonwebtoken: JWT implementation
- morgan: HTTP request logger