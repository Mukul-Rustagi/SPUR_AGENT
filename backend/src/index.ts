import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { chatRouter } from "./routes/chat.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { initializeDatabase } from "./db/database.js";
import { getRedisClient } from "./services/cacheService.js";
import { llmService } from "./services/llmService.js";

async function initializeServices() {
  try {
    console.log("🔧 Initializing services...\n");

    initializeDatabase();
    console.log("✅ Database initialized\n");

    const llmProvider = (process.env.LLM_PROVIDER || "openai")
      .toLowerCase()
      .trim();
    console.log(`🤖 LLM Provider: ${llmProvider.toUpperCase()}`);

    // Validate API key is set
    if (llmProvider === "groq" && !process.env.GROQ_API_KEY) {
      console.warn("⚠️  WARNING: GROQ_API_KEY not set\n");
    } else if (llmProvider === "gemini" && !process.env.GEMINI_API_KEY) {
      console.warn("⚠️  WARNING: GEMINI_API_KEY not set\n");
    } else if (llmProvider === "openai" && !process.env.OPENAI_API_KEY) {
      console.warn("⚠️  WARNING: OPENAI_API_KEY not set\n");
    }

    try {
      const redisClient = await getRedisClient();
      if (redisClient) {
        console.log("✅ Redis: Connected\n");
      } else {
        console.log(
          "⚠️  Redis: Not configured or unavailable (caching disabled)\n"
        );
      }
    } catch (error: any) {
      console.log("⚠️  Redis: Connection failed (caching disabled)\n");
    }

    console.log("✅ All services initialized\n");
  } catch (error: any) {
    console.error("❌ Failed to initialize services:", error);
    throw error;
  }
}

initializeServices().catch((error) => {
  console.error("❌ Fatal error during initialization:", error);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/chat", chatRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

// Listen on 0.0.0.0 to accept connections from outside the container (required for Render, Railway, etc.)
app.listen(Number(process.env.PORT) || 3001, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}\n`);
  console.log(`📡 Accessible at http://localhost:${PORT}\n`);
});
