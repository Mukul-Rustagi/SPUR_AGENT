# Backend Setup Guide

This guide provides detailed instructions for setting up and running the backend of the Spur AI Live Chat Agent.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher
  - Check your version: `node --version`
  - Download: [https://nodejs.org/](https://nodejs.org/)
- **npm**: Version 9 or higher (comes with Node.js)
  - Check your version: `npm --version`
- **LLM API Key**: Choose one provider:
  - **Groq** (FREE): [Get free key](https://console.groq.com/keys)
  - **Google Gemini** (FREE): [Get free key](https://aistudio.google.com/app/apikey)
  - **OpenAI** ($5 free credits): [Get key](https://platform.openai.com/api-keys)
- **Redis** (Optional): For caching support
  - Download: [https://redis.io/download](https://redis.io/download)
  - Or use a cloud Redis service

## 🚀 Step-by-Step Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including:
- `express` - Web framework
- `@google/generative-ai` - Google Gemini SDK
- `openai` - OpenAI SDK (also used for Groq)
- `better-sqlite3` - SQLite database
- `zod` - Input validation
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `redis` - Redis client (optional)
- `uuid` - UUID generation
- TypeScript and development dependencies

### Step 3: Create Environment File

Create a `.env` file in the `backend` directory:

```bash
# On Windows (PowerShell)
New-Item -Path .env -ItemType File

# On macOS/Linux
touch .env
```

### Step 4: Configure Environment Variables

Open the `.env` file and add your configuration. Choose one of the following options:

#### Option 1: Groq (FREE, Recommended)

```env
# LLM Provider Configuration
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key_here

# Server Configuration
PORT=3001

# Database Configuration (Optional)
DATABASE_PATH=./data/chat.db

# Redis Configuration (Optional)
# REDIS_URL=redis://localhost:6379
```

**Getting a Groq API Key:**
1. Visit [https://console.groq.com/keys](https://console.groq.com/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `gsk_`)
5. Paste it in your `.env` file

#### Option 2: Google Gemini (FREE)

```env
# LLM Provider Configuration
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
PORT=3001

# Database Configuration (Optional)
DATABASE_PATH=./data/chat.db

# Redis Configuration (Optional)
# REDIS_URL=redis://localhost:6379
```

**Getting a Gemini API Key:**
1. Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key
5. Paste it in your `.env` file

#### Option 3: OpenAI (Paid, $5 free credits)

```env
# LLM Provider Configuration
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=3001

# Database Configuration (Optional)
DATABASE_PATH=./data/chat.db

# Redis Configuration (Optional)
# REDIS_URL=redis://localhost:6379
```

**Getting an OpenAI API Key:**
1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new secret key
4. Copy the key (starts with `sk-`)
5. Paste it in your `.env` file
6. Add payment method (or use $5 free credits)

### Step 5: Initialize Database

Run the migration script to create the database and tables:

```bash
npm run migrate
```

This will:
- Create the `data` directory if it doesn't exist
- Create `chat.db` SQLite database file
- Create `conversations` and `messages` tables
- Create indexes for better query performance

**Expected Output:**
```
✅ Database initialized
```

### Step 6: Verify Setup

Check that your `.env` file is properly configured:

```bash
# On Windows (PowerShell)
Get-Content .env

# On macOS/Linux
cat .env
```

Make sure:
- `LLM_PROVIDER` is set to one of: `groq`, `gemini`, or `openai`
- The corresponding API key is set and valid
- `PORT` is set (defaults to 3001 if not set)

### Step 7: Start Development Server

```bash
npm run dev
```

This will:
- Start the Express server
- Enable hot reload (auto-restart on file changes)
- Display initialization logs

**Expected Output:**
```
🔧 Initializing services...

✅ Database initialized
🤖 LLM Provider: GROQ
⚠️  Redis: Not configured or unavailable (caching disabled)

✅ All services initialized

🚀 Server running on http://localhost:3001
```

### Step 8: Test the Server

Open a new terminal and test the health endpoint:

```bash
# Using curl
curl http://localhost:3001/api/health

# Using PowerShell (Windows)
Invoke-WebRequest -Uri http://localhost:3001/api/health

# Or open in browser
# http://localhost:3001/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔧 Configuration Options

### Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_PROVIDER` | Yes | `openai` | LLM provider: `groq`, `gemini`, or `openai` |
| `GROQ_API_KEY` | If using Groq | - | Groq API key (starts with `gsk_`) |
| `GEMINI_API_KEY` | If using Gemini | - | Google Gemini API key |
| `OPENAI_API_KEY` | If using OpenAI | - | OpenAI API key (starts with `sk-`) |
| `PORT` | No | `3001` | Server port number |
| `DATABASE_PATH` | No | `./data/chat.db` | Path to SQLite database file |
| `REDIS_URL` | No | - | Redis connection URL (optional) |

### Database Configuration

The database is stored in SQLite format. By default, it's located at `backend/data/chat.db`.

To change the database location, set `DATABASE_PATH` in your `.env` file:

```env
DATABASE_PATH=/path/to/your/database.db
```

**Note**: The directory containing the database file must exist and be writable.

### Redis Configuration (Optional)

Redis is used for caching frequently asked questions. If Redis is not configured, the app will work without caching.

**Local Redis:**
```env
REDIS_URL=redis://localhost:6379
```

**Cloud Redis (e.g., Upstash, Redis Cloud):**
```env
REDIS_URL=redis://default:password@host:port
```

**Disable Redis:**
Simply don't set `REDIS_URL` or leave it commented out.

## 🧪 Testing the Backend

### Test API Endpoints

#### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

#### 2. Send a Message
```bash
curl -X POST http://localhost:3001/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{"message": "What is your return policy?"}'
```

**Expected Response:**
```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "uuid-here"
}
```

#### 3. Get Conversation History
```bash
curl http://localhost:3001/api/chat/history/YOUR_SESSION_ID
```

Replace `YOUR_SESSION_ID` with the sessionId from the previous response.

## 🐛 Troubleshooting

### Issue: "Cannot find module" errors

**Solution:**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Issue: "API key not configured" error

**Solution:**
1. Check that your `.env` file exists in the `backend` directory
2. Verify the API key is correct and matches the `LLM_PROVIDER`
3. For Groq: API key should start with `gsk_`
4. For OpenAI: API key should start with `sk-`
5. Make sure there are no extra spaces or quotes around the API key

### Issue: "Port 3001 already in use"

**Solution:**
1. Change the port in `.env`:
   ```env
   PORT=3002
   ```
2. Or stop the process using port 3001:
   ```bash
   # Find process using port 3001
   # On Windows
   netstat -ano | findstr :3001
   
   # On macOS/Linux
   lsof -i :3001
   ```

### Issue: Database errors

**Solution:**
1. Ensure the `data` directory exists:
   ```bash
   mkdir -p data
   ```
2. Run migration again:
   ```bash
   npm run migrate
   ```
3. Check file permissions (database file must be writable)

### Issue: Redis connection errors

**Solution:**
- Redis is optional. If you see Redis errors, you can ignore them or:
  1. Install and start Redis locally
  2. Or configure a cloud Redis service
  3. Or leave `REDIS_URL` unset to disable caching

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Rebuild TypeScript
npm run build

# Check for type errors
npx tsc --noEmit
```

## 📦 Production Build

To build for production:

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist` directory.

To run the production build:

```bash
npm start
```

**Note**: Make sure to set `NODE_ENV=production` in your production environment.

## 🔍 Development Tips

### Hot Reload

The development server uses `tsx watch` which automatically restarts when you change files. No need to manually restart.

### Logging

The server logs important events:
- Database initialization
- LLM provider selection
- Redis connection status
- New conversations created
- Messages sent and received

### Debugging

To see more detailed logs, you can add console.log statements or use a debugger:

```bash
# Run with Node.js debugger
node --inspect-brk node_modules/.bin/tsx src/index.ts
```

## 📚 Next Steps

Once the backend is running:
1. Verify the health endpoint responds
2. Test sending a message
3. Set up the frontend (see [SETUP_GUIDE_FRONTEND.md](./SETUP_GUIDE_FRONTEND.md))
4. Connect frontend to backend

## 🆘 Getting Help

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Check that environment variables are set correctly
4. Review the error messages in the console
5. Ensure the database was initialized successfully

---

**Backend is now ready!** 🎉

