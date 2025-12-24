# Project Requirements

This document outlines the requirements and specifications for the Spur AI Live Chat Agent project.

## 📋 Project Overview

Build a full-stack AI-powered customer support chat application that allows users to interact with an AI agent capable of answering questions about a fictional e-commerce store.

## 🎯 Core Requirements

### Functional Requirements

1. **Chat Interface**

   - Users can send messages to the AI agent
   - AI agent responds with helpful, context-aware answers
   - Messages are displayed in a chat-like interface
   - Conversation history is maintained during the session

2. **AI Integration**

   - Integrate with at least one LLM provider (OpenAI, Groq, or Gemini)
   - AI agent should have knowledge about the store (shipping, returns, support hours, etc.)
   - Responses should be concise and helpful (2-3 sentences max)
   - Handle errors gracefully (API failures, timeouts, rate limits)

3. **Data Persistence**

   - Store conversations in a database
   - Store individual messages with timestamps
   - Support session management (conversation history)
   - Allow retrieval of conversation history

4. **User Experience**
   - Modern, responsive UI
   - Loading states during AI response generation
   - Error messages for failed requests
   - Input validation (prevent empty messages)
   - Example questions to help users get started

### Technical Requirements

1. **Backend**

   - RESTful API with Express.js
   - TypeScript for type safety
   - Database for persistence (SQLite)
   - Input validation using Zod
   - Error handling middleware
   - CORS enabled for frontend communication

2. **Frontend**

   - React with TypeScript
   - Modern build tooling (Vite)
   - Responsive design
   - Tailwind CSS for styling
   - API integration with backend

3. **Architecture**
   - Separation of concerns (routes, services, middleware)
   - Service layer for business logic
   - Database abstraction layer
   - Error handling strategy

## 🔧 Technical Specifications

### Backend API Endpoints

#### POST `/api/chat/message`

- **Purpose**: Send a message to the AI agent
- **Request Body**:
  ```json
  {
    "message": "string (1-5000 characters)",
    "sessionId": "string (UUID, optional)"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "string",
    "sessionId": "string (UUID)"
  }
  ```
- **Error Responses**:
  - `400`: Invalid input (empty message, too long, invalid UUID)
  - `500`: Server error (LLM API failure, database error)

#### GET `/api/chat/history/:sessionId`

- **Purpose**: Retrieve conversation history
- **Path Parameters**: `sessionId` (UUID)
- **Response**:
  ```json
  {
    "messages": [
      {
        "id": "string (UUID)",
        "conversationId": "string (UUID)",
        "sender": "user" | "ai",
        "text": "string",
        "timestamp": "number (Unix timestamp)"
      }
    ]
  }
  ```
- **Error Responses**:
  - `404`: Conversation not found
  - `500`: Server error

#### GET `/api/health`

- **Purpose**: Health check endpoint
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "string (ISO 8601)"
  }
  ```

### Database Schema

#### conversations

```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);
```

#### messages

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
  text TEXT NOT NULL,
  timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);
```

### LLM Configuration

#### Supported Providers

1. **OpenAI**

   - Model: `gpt-3.5-turbo`
   - Max Tokens: 200
   - Temperature: 0.7

2. **Groq**

   - Model: `llama-3.1-8b-instant`
   - Max Tokens: 200
   - Temperature: 0.7

3. **Google Gemini**
   - Model: `gemini-pro`
   - Max Output Tokens: 200
   - Temperature: 0.7

#### System Prompt

The AI agent should be configured with a system prompt that includes:

- Role: Helpful customer support agent for "SpurStore"
- Store knowledge:
  - Shipping policy (free over $50, standard/express options)
  - Return/refund policy (30 days, full refunds)
  - Support hours (Mon-Fri, 9 AM - 6 PM EST)
  - Payment methods
  - Product warranty information
- Response guidelines:
  - Concise (2-3 sentences max)
  - Friendly and professional tone
  - If asked about something not in knowledge base, politely redirect to email support

### Environment Variables

#### Required

- `LLM_PROVIDER`: `openai` | `groq` | `gemini`
- Provider-specific API key:
  - `OPENAI_API_KEY` (if using OpenAI)
  - `GROQ_API_KEY` (if using Groq)
  - `GEMINI_API_KEY` (if using Gemini)

#### Optional

- `PORT`: Server port (default: 3001)
- `DATABASE_PATH`: Path to SQLite database file (default: `data/chat.db`)
- `REDIS_URL`: Redis connection URL for caching (optional)

### Input Validation

#### Message Validation

- Minimum length: 1 character
- Maximum length: 5000 characters
- Must be a non-empty string after trimming

#### Session ID Validation

- Must be a valid UUID format
- Optional (if not provided, a new conversation is created)

### Error Handling

#### LLM API Errors

- **401 Unauthorized**: Invalid API key
  - Error message: "Invalid [Provider] API key. Please check your API key."
- **429 Too Many Requests**: Rate limit exceeded
  - Error message: "[Provider] rate limit exceeded. Please wait a moment and try again."
- **503 Service Unavailable**: Service temporarily unavailable
  - Error message: "[Provider] service temporarily unavailable. Please try again in a moment."
- **Timeout**: Request timeout
  - Error message: "Request to [Provider] timed out. Please try again."
- **Generic Error**: Other errors
  - Error message: "Failed to generate reply with [Provider]: [error message]"

#### Database Errors

- Connection errors should be logged and return 500 status
- Invalid queries should return 500 status with error message

#### Validation Errors

- Invalid input should return 400 status with error details
- Zod validation errors should be formatted and returned

## 🎨 UI/UX Requirements

### Chat Interface

- Clean, modern design
- Message bubbles (user messages on right, AI on left)
- Timestamp display (optional)
- Auto-scroll to latest message
- Responsive design (mobile-friendly)

### Loading States

- Show typing indicator when AI is generating response
- Disable send button during request
- Show loading spinner or animation

### Error Display

- Display error messages in a user-friendly format
- Allow user to retry failed requests
- Clear error messages after successful retry

### Example Questions

- Provide 3-5 example questions users can click
- Examples should cover different topics (shipping, returns, support)

## 🚀 Performance Requirements

- API response time: < 5 seconds (including LLM call)
- Frontend should handle slow responses gracefully
- Database queries should be optimized with indexes
- Support at least 100 concurrent conversations

## 🔒 Security Requirements

- Input validation on all endpoints
- SQL injection prevention (using parameterized queries)
- CORS configuration for frontend origin
- API key stored in environment variables (never in code)
- Rate limiting (optional, but recommended for production)

## 📦 Deployment Requirements

### Backend

- Should be deployable to cloud platforms (Render, Railway, Heroku)
- Environment variables should be configurable
- Database should persist across deployments

### Frontend

- Should be deployable to static hosting (Vercel, Netlify)
- Should be able to connect to backend API
- Build should be optimized for production

## 🧪 Testing Requirements

### Manual Testing Checklist

- [ ] Send a message and receive AI response
- [ ] Start new conversation (no sessionId)
- [ ] Continue existing conversation (with sessionId)
- [ ] Retrieve conversation history
- [ ] Handle empty message (should be prevented)
- [ ] Handle very long message (should be validated)
- [ ] Handle invalid sessionId (should create new conversation)
- [ ] Handle API key errors (should show friendly error)
- [ ] Handle network errors (should show friendly error)
- [ ] Test session persistence (refresh page, history should load)

## 📝 Code Quality Requirements

- TypeScript for type safety
- Consistent code formatting
- Meaningful variable and function names
- Comments for complex logic
- Error handling for all async operations
- Separation of concerns (routes, services, database)

## 🔄 Future Enhancements (Out of Scope)

The following features are not required but could be added:

- User authentication
- Rate limiting per user/IP
- Message pagination for long conversations
- File uploads
- Admin dashboard
- Analytics and metrics
- Multi-language support
- Streaming responses
- Message reactions/feedback

## 📄 Deliverables

1. **Source Code**

   - Backend codebase
   - Frontend codebase
   - Configuration files

2. **Documentation**

   - README.md with setup instructions
   - API documentation
   - Architecture overview

3. **Deployment**
   - Deployed backend (optional)
   - Deployed frontend (optional)
   - Environment variable documentation

---

**Note**: This is a take-home assignment. Focus on demonstrating:

- Full-stack development skills
- Clean code architecture
- Error handling
- User experience
- Documentation
