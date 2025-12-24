import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export class ConversationService {
  createConversation(): string {
    const id = uuidv4();
    const now = Math.floor(Date.now() / 1000);
    
    db.prepare(`
      INSERT INTO conversations (id, created_at, updated_at)
      VALUES (?, ?, ?)
    `).run(id, now, now);
    
    console.log(`💾 Conversation persisted to DB: ${id}`);
    return id;
  }

  getConversation(conversationId: string): Conversation | null {
    const row = db.prepare(`
      SELECT id, created_at, updated_at
      FROM conversations
      WHERE id = ?
    `).get(conversationId) as any;

    if (!row) return null;

    return {
      id: row.id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  addMessage(conversationId: string, sender: 'user' | 'ai', text: string): Message {
    const id = uuidv4();
    const timestamp = Math.floor(Date.now() / 1000);

    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender, text, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, conversationId, sender, text, timestamp);

    db.prepare(`
      UPDATE conversations
      SET updated_at = ?
      WHERE id = ?
    `).run(timestamp, conversationId);

    console.log(`💾 Message persisted: ${sender} -> conversation ${conversationId.substring(0, 8)}...`);

    return {
      id,
      conversationId,
      sender,
      text,
      timestamp,
    };
  }

  getMessages(conversationId: string): Message[] {
    const rows = db.prepare(`
      SELECT id, conversation_id, sender, text, timestamp
      FROM messages
      WHERE conversation_id = ?
      ORDER BY timestamp ASC
    `).all(conversationId) as any[];

    return rows.map(row => ({
      id: row.id,
      conversationId: row.conversation_id,
      sender: row.sender,
      text: row.text,
      timestamp: row.timestamp,
    }));
  }
}

export const conversationService = new ConversationService();

