import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'bot'
  timestamp: timestamp("timestamp").defaultNow(),
  sessionId: text("session_id").notNull(), // For managing multiple chat sessions
  metadata: text("metadata"), // For storing n8n response metadata
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  sender: true,
  sessionId: true,
  metadata: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type WebSocketMessage = {
  type: 'message' | 'typing' | 'error' | 'n8n_response';
  payload: any;
};

// Configuration for embedding
export type ChatWidgetConfig = {
  title?: string;
  theme?: 'light' | 'dark';
  position?: 'bottom-right' | 'bottom-left';
  initialMessage?: string;
  n8nWebhookUrl: string;
};