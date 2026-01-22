# Node.js Express Chat Backend

This is a backend for a chat application built with Node.js, Express, and MongoDB.

## Features

- **Express Server**: RESTful API structure.
- **MongoDB**: Database connection using Mongoose.
- **API Endpoints**:
  - `POST /chat`: Send a message and receive a bot reply.
  - `GET /history`: Fetch chat history.
  - `DELETE /history`: Clear chat history.
- **Security**: Implemented using `helmet` and `cors`.
- **Logging**: Request logging using `morgan`.

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the root directory (already provided):
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/chat-app
    ```
    *Note: Ensure you have MongoDB running locally or provide a remote MongoDB URI.*

3.  **Run the Server**
    ```bash
    npm start
    ```
    The server will start on port 5000 (or as specified in .env).

## API Documentation

### 1. Send Message
- **URL**: `/chat`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "message": "Hello"
  }
  ```
- **Response**:
  ```json
  {
    "userMessage": {
      "role": "user",
      "content": "Hello",
      "timestamp": "..."
    },
    "botMessage": {
      "role": "bot",
      "content": "Hello there! How can I help you today?",
      "timestamp": "..."
    }
  }
  ```

### 2. Get History
- **URL**: `/history`
- **Method**: `GET`
- **Response**: Array of message objects.
  ```json
  [
    {
      "role": "user",
      "content": "Hello",
      "timestamp": "..."
    },
    {
      "role": "bot",
      "content": "Hi!",
      "timestamp": "..."
    }
  ]
  ```

### 3. Clear History
- **URL**: `/history`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "message": "Chat history cleared"
  }
  ```
