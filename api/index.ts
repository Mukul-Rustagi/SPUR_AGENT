import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from "express";
import cors from "cors";
import { chatRouter } from "../backend/src/routes/chat.js";
import { errorHandler } from "../backend/src/middleware/errorHandler.js";
import { initializeDatabase } from "../backend/src/db/database.js";
import { getRedisClient } from "../backend/src/services/cacheService.js";

let app: express.Application | null = null;

async function createApp() {
  if (app) return app;

  app = express();
  
  initializeDatabase();

  const llmProvider = (process.env.LLM_PROVIDER || "openai").toLowerCase().trim();
  console.log(`🤖 LLM Provider: ${llmProvider.toUpperCase()}`);

  try {
    const redisClient = await getRedisClient();
    if (redisClient) {
      console.log("✅ Redis: Connected");
    } else {
      console.log("⚠️  Redis: Not configured or unavailable (caching disabled)");
    }
  } catch (error: any) {
    console.log("⚠️  Redis: Connection failed (caching disabled)");
  }

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use("/chat", chatRouter);

  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use(errorHandler);

  return app;
}

export default async (req: VercelRequest, res: VercelResponse) => {
  const appInstance = await createApp();
  return appInstance(req, res);
};

