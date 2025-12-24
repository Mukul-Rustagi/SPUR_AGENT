# Spur AI Live Chat Agent

A full-stack AI-powered customer support chat application built for the Spur Founding Engineer take-home assignment.

## 🚀 Features

- **Beautiful Chat UI**: Modern, responsive chat interface built with React and Tailwind CSS
- **AI-Powered Responses**: Integrated with multiple LLM providers (OpenAI, Groq, Gemini) for intelligent customer support
- **Conversation Persistence**: SQLite database stores all conversations and messages
- **Session Management**: Maintains conversation history across page reloads
- **Error Handling**: Robust error handling for API failures, timeouts, and invalid inputs
- **Input Validation**: Prevents empty messages and handles long messages gracefully
- **Typing Indicators**: Visual feedback when the AI agent is generating a response
- **Example Questions**: Quick-start prompts to help users get started
- **Multi-Provider Support**: Switch between OpenAI, Groq, and Google Gemini with simple configuration

## 🏗️ Architecture

### Backend (`/backend`)

**Tech Stack:**

- Node.js + TypeScript
- Express.js for REST API
- SQLite (better-sqlite3) for database
- Redis for caching (optional, graceful fallback)
- Multiple LLM providers (OpenAI, Groq, Gemini) for AI integration
- Zod for input validation

**Structure:**

```
backend/
├── src/
│   ├── db/              # Database setup and schema
│   │   ├── database.ts  # Database initialization
│   │   └── migrate.ts   # Migration script
│   ├── services/        # Business logic
│   │   ├── conversationService.ts  # Conversation & message management
│   │   ├── llmService.ts           # Multi-provider LLM integration
│   │   └── cacheService.ts         # Redis caching (optional)
│   ├── routes/          # API routes
│   │   └── chat.ts      # Chat endpoints
│   ├── middleware/      # Express middleware
│   │   └── errorHandler.ts
│   └── index.ts         # Server entry point
├── data/                # SQLite database storage
├── package.json
└── tsconfig.json
```

**Key Design Decisions:**

- **Service Layer**: Separated business logic from routes for better testability and maintainability
- **Database Abstraction**: ConversationService provides a clean interface for data operations
- **LLM Encapsulation**: LLMService handles all LLM interactions with support for multiple providers (OpenAI, Groq, Gemini), making it easy to swap providers
- **Error Handling**: Centralized error handler with proper error messages
- **Input Validation**: Zod schemas ensure type safety and validation

### Frontend (`/frontend`)

**Tech Stack:**

- React + TypeScript
- Vite for build tooling
- Tailwind CSS for styling

**Structure:**

```
frontend/
├── src/
│   ├── components/
│   │   └── ChatWidget.tsx  # Main chat component
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

**Key Features:**

- Auto-scrolling to latest messages
- Loading states and disabled buttons during requests
- Typing indicators
- Error message display
- Example questions for quick start
- Responsive design

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **LLM API Key**: Choose one of the following:
  - **Groq** (FREE, recommended): [Get free key](https://console.groq.com/keys)
  - **Google Gemini** (FREE): [Get free key](https://aistudio.google.com/app/apikey)
  - **OpenAI** ($5 free credits): [Get key](https://platform.openai.com/api-keys)
- **Redis** (Optional): For caching support. If not configured, the app will work without caching.

## 🛠️ Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Spur_Founding
```

### 2. Install Dependencies

```bash
# Install root dependencies (for concurrently)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment Variables

Create `backend/.env` file:

```bash
cd backend
touch .env
```

Edit `backend/.env` and add your configuration:

**Option 1: Groq (FREE, Recommended)**

```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here
PORT=3001
```

**Option 2: Google Gemini (FREE)**

```env
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

**Option 3: OpenAI (Paid, $5 free credits)**

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

**Optional: Redis Configuration**

```env
REDIS_URL=redis://localhost:6379
# Or leave unset to disable caching
```

### 4. Initialize Database

```bash
cd backend
npm run migrate
```

This creates the SQLite database and tables in `backend/data/chat.db`.

### 5. Run the Application

**Option A: Run both together (recommended)**

From the root directory:

```bash
npm run dev
```

**Option B: Run separately**

Terminal 1 (Backend):

```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📡 API Endpoints

### POST `/api/chat/message`

Send a message to the AI agent.

**Request:**

```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid" // Omit for new conversation
}
```

**Response:**

```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "conversation-uuid"
}
```

### GET `/api/chat/history/:sessionId`

Retrieve conversation history.

**Response:**

```json
{
  "messages": [
    {
      "id": "msg-id",
      "conversationId": "conv-id",
      "sender": "user",
      "text": "Hello",
      "timestamp": 1234567890
    }
  ]
}
```

### GET `/api/health`

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤖 LLM Integration

### Supported Providers

The application supports multiple LLM providers:

1. **Groq** (Recommended for testing - FREE)

   - Model: `llama-3.1-8b-instant`
   - Free tier: 14,400 requests/day
   - Very fast responses

2. **Google Gemini** (FREE tier available)

   - Model: `gemini-pro`
   - Free tier: 60 requests/minute
   - High quality responses

3. **OpenAI** (Paid, $5 free credits)
   - Model: `gpt-3.5-turbo`
   - $5 free credits for new users

### Configuration

Set `LLM_PROVIDER` in `backend/.env` to choose your provider:

- `groq` - Uses Groq API (free)
- `gemini` - Uses Google Gemini API (free tier)
- `openai` - Uses OpenAI API (paid)

### Common Settings

- **Max Tokens**: 200 (for concise responses)
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max History**: Last 10 messages (for context)

### Prompt Design

The system prompt includes:

- Role definition (helpful support agent)
- Store knowledge base (shipping, returns, support hours, etc.)
- Response guidelines (concise, friendly, professional)

**Domain Knowledge Included:**

- Shipping policy (free over $50, standard/express options)
- Return/refund policy (30 days, full refunds)
- Support hours (Mon-Fri, 9 AM - 6 PM EST)
- Payment methods
- Product warranty information

### Error Handling

The LLM service handles:

- Invalid API keys (401)
- Rate limits (429)
- Service unavailability (503)
- Timeouts
- Empty responses

All errors are caught and returned as user-friendly messages.

## 🗄️ Database Schema

**conversations**

- `id` (TEXT, PRIMARY KEY) - UUID
- `created_at` (INTEGER) - Unix timestamp
- `updated_at` (INTEGER) - Unix timestamp

**messages**

- `id` (TEXT, PRIMARY KEY) - UUID
- `conversation_id` (TEXT, FOREIGN KEY) - References conversations.id
- `sender` (TEXT, CHECK: 'user' | 'ai')
- `text` (TEXT) - Message content
- `timestamp` (INTEGER) - Unix timestamp

## 🧪 Testing the Application

1. **Basic Flow:**

   - Open http://localhost:3000
   - Type a message or click an example question
   - Verify AI response appears

2. **Session Persistence:**

   - Send a few messages
   - Refresh the page
   - Verify conversation history loads

3. **Error Handling:**
   - Try sending an empty message (should be prevented)
   - Try sending a very long message (should be validated/truncated)
   - Temporarily remove API key to test error handling
   - Test with invalid API key to see graceful error messages

## 🚢 Deployment

### Backend Deployment (e.g., Render, Railway, Heroku)

1. Set environment variables:

# LLM Provider Selection


2. Build command: `cd backend && npm run build`
3. Start command: `cd backend && npm start`

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update API URL in `frontend/vite.config.ts` proxy or use environment variables
2. Build command: `cd frontend && npm run build`
3. Output directory: `frontend/dist`

**Note:** For production, update the API URL in the frontend to point to your deployed backend.

## 📝 Project Scripts

### Root Level

- `npm run dev` - Run both frontend and backend concurrently
- `npm run dev:backend` - Run only backend
- `npm run dev:frontend` - Run only frontend
- `npm run build` - Build both frontend and backend
- `npm run build:backend` - Build only backend
- `npm run build:frontend` - Build only frontend

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Initialize database schema

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 🐛 Troubleshooting

### Backend Issues

**Database errors:**

- Ensure `backend/data/` directory exists and is writable
- Run `npm run migrate` to initialize database

**API key errors:**

- Verify your API key is correct in `backend/.env`
- Check that `LLM_PROVIDER` matches your API key type
- For Groq: API key should start with `gsk_`
- For OpenAI: API key should start with `sk-`

**Port already in use:**

- Change `PORT` in `backend/.env` to a different port
- Or stop the process using port 3001

### Frontend Issues

**Cannot connect to backend:**

- Ensure backend is running on port 3001
- Check `vite.config.ts` proxy configuration
- Verify CORS is enabled in backend

**Build errors:**

- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be 18+)

## 📄 License

This project is built for the Spur Founding Engineer take-home assignment.

## 📚 Additional Documentation

- [REQUIREMENTS.md](./REQUIREMENTS.md) - Detailed project requirements
- [SETUP_GUIDE_BACKEND.md](./SETUP_GUIDE_BACKEND.md) - Detailed backend setup guide
- [SETUP_GUIDE_FRONTEND.md](./SETUP_GUIDE_FRONTEND.md) - Detailed frontend setup guide

---

**Built with ❤️ for Spur**
