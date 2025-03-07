import { messages, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(sessionId: string): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private messages: Message[];
  private currentId: number;

  constructor() {
    this.messages = [];
    this.currentId = 1;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentId++,
      content: insertMessage.content,
      sender: insertMessage.sender,
      timestamp: new Date(),
      sessionId: insertMessage.sessionId,
      metadata: insertMessage.metadata
    };
    this.messages.push(message);
    return message;
  }

  async getMessages(sessionId: string): Promise<Message[]> {
    return this.messages.filter(msg => msg.sessionId === sessionId);
  }
}

export const storage = new MemStorage();