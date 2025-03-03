# User Service

The User Service manages user authentication, registration, and profile management for the Event Booking Platform.

## Features

- User registration and authentication
- JWT-based authentication
- User profile management
- Integration with Event Service to retrieve events

## Architecture

The User Service follows a typical Express.js application structure with routes, controllers, and models. It uses SQLite for data storage and communicates with other services via REST APIs and RabbitMQ.

### Data Flow

1. Users register or login through the API endpoints
2. Authentication is handled via JWT tokens
3. Authenticated users can view and update their profiles
4. When users register or update profiles, notifications are sent via RabbitMQ
5. The service communicates with the Event Service to retrieve event information

## API Endpoints

### Authentication

#### Register a new user
- **URL**: `/api/users/register`
- **Method**: `POST`
- **Auth required**: No
- **Request body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
  ```

#### Login
- **URL**: `/api/users/login`
- **Method**: `POST`
- **Auth required**: No
- **Request body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "token": "jwt_token_here"
  }
  ```

### User Management

#### Get user profile
- **URL**: `/api/users/profile`
- **Method**: `GET`
- **Auth required**: Yes (JWT token in Authorization header)
- **Response**:
  ```json
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
  ```

#### Update user profile
- **URL**: `/api/users/profile`
- **Method**: `PUT`
- **Auth required**: Yes (JWT token in Authorization header)
- **Request body**:
  ```json
  {
    "name": "John Smith"
  }
  ```
- **Response**:
  ```json
  {
    "id": 1,
    "name": "John Smith",
    "email": "john@example.com",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
  ```

### Event Integration

#### Get all events
- **URL**: `/api/events`
- **Method**: `GET`
- **Auth required**: Yes (JWT token in Authorization header)
- **Response**:
  ```json
  [
    {
      "id": "1",
      "title": "Concert",
      "description": "A music concert",
      "date": "2023-05-15T18:00:00.000Z",
      "price": 50
    }
  ]
  ```

#### Get event by ID
- **URL**: `/api/events/:eventId`
- **Method**: `GET`
- **Auth required**: Yes (JWT token in Authorization header)
- **Response**:
  ```json
  {
    "id": "1",
    "title": "Concert",
    "description": "A music concert",
    "date": "2023-05-15T18:00:00.000Z",
    "price": 50
  }
  ```

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key, auto-incremented |
| name | TEXT | User's full name |
| email | TEXT | User's email address (unique) |
| password | TEXT | Hashed password |
| createdAt | TEXT | Timestamp of creation |
| updatedAt | TEXT | Timestamp of last update |

## RabbitMQ Integration

This service publishes messages to the RabbitMQ exchange when:

1. A new user registers
2. A user updates their profile

### Message Format

```json
{
  "type": "USER_REGISTERED",
  "data": {
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe"
  },
  "timestamp": "2023-01-01T00:00:00.000Z"
}
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=24h

# Database
DB_PATH=./data/users.sqlite

# Services
EVENT_SERVICE_URL=http://localhost:3002

# RabbitMQ
RABBITMQ_URL=amqp://localhost
NOTIFICATION_EXCHANGE=notifications
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

Register a new user:
```
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

Login:
```
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Dependencies

- express: Web framework
- sqlite3: SQLite database driver
- bcryptjs: Password hashing
- jsonwebtoken: JWT implementation
- amqplib: RabbitMQ client
- dotenv: Environment variable management
- morgan: HTTP request logger