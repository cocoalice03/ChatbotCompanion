import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  app.post('/api/chat/webhook', async (req, res) => {
    try {
      const message = insertMessageSchema.parse({
        content: req.body.chatResponse,
        sender: 'bot'
      });
      
      const savedMessage = await storage.createMessage(message);
      
      // Broadcast message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'message',
            payload: savedMessage
          }));
        }
      });

      res.json(savedMessage);
    } catch (error) {
      res.status(400).json({ error: 'Invalid message format' });
    }
  });

  app.get('/api/chat/messages', async (req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  wss.on('connection', (ws) => {
    ws.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        
        if (parsed.type === 'message') {
          const message = insertMessageSchema.parse({
            content: parsed.payload.content,
            sender: 'user'
          });

          const savedMessage = await storage.createMessage(message);

          // Broadcast message to all clients
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'message',
                payload: savedMessage
              }));
            }
          });
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          payload: 'Invalid message format'
        }));
      }
    });
  });

  return httpServer;
}
