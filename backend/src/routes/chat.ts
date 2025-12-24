import { Router } from "express";
import { z } from "zod";
import { conversationService } from "../services/conversationService.js";
import { llmService } from "../services/llmService.js";

export const chatRouter = Router();

const messageSchema = z.object({
  message: z.string().min(1).max(5000),
  sessionId: z.string().uuid().optional(),
});

chatRouter.post("/message", async (req, res, next) => {
  try {
    const { message, sessionId } = messageSchema.parse(req.body);

    let conversationId = sessionId;
    if (!conversationId) {
      conversationId = conversationService.createConversation();
      console.log(`📝 New conversation created: ${conversationId}`);
    } else {
      const conversation = conversationService.getConversation(conversationId);
      if (!conversation) {
        conversationId = conversationService.createConversation();
        console.log(`📝 New conversation created: ${conversationId}`);
      }
    }

    console.log(
      `💬 User message saved: "${message.substring(0, 50)}${
        message.length > 50 ? "..." : ""
      }"`
    );
    conversationService.addMessage(conversationId, "user", message);
    const history = conversationService.getMessages(conversationId);
    const reply = await llmService.generateReply(message, history);
    console.log(
      `🤖 AI reply saved: "${reply.substring(0, 50)}${
        reply.length > 50 ? "..." : ""
      }"`
    );
    conversationService.addMessage(conversationId, "ai", reply);

    res.json({
      reply,
      sessionId: conversationId,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Invalid input",
        details: error.errors,
      });
    }
    next(error);
  }
});

chatRouter.get("/history/:sessionId", (req, res) => {
  try {
    const { sessionId } = req.params;

    const conversation = conversationService.getConversation(sessionId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = conversationService.getMessages(sessionId);
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
