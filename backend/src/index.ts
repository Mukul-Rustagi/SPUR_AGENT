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
  console.log("🔧 Initializing services...\n");

  initializeDatabase();

  const llmProvider = (process.env.LLM_PROVIDER || "openai").toLowerCase().trim();
  console.log(`🤖 LLM Provider: ${llmProvider.toUpperCase()}`);

  try {
    const redisClient = await getRedisClient();
    if (redisClient) {
      console.log("✅ Redis: Connected\n");
    } else {
      console.log("⚠️  Redis: Not configured or unavailable (caching disabled)\n");
    }
  } catch (error: any) {
    console.log("⚠️  Redis: Connection failed (caching disabled)\n");
  }

  console.log("✅ All services initialized\n");
}

initializeServices().catch(console.error);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/chat", chatRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}\n`);
});

