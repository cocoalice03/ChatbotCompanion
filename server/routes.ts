import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import fetch from "node-fetch";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Handle n8n webhook response
  app.post('/api/chat/webhook', async (req, res) => {
    try {
      console.log('Received webhook response:', req.body);
      const message = insertMessageSchema.parse({
        content: req.body.chatResponse,
        sender: 'bot',
        sessionId: req.body.sessionId || 'default',
        metadata: JSON.stringify(req.body.metadata || {})
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
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Invalid message format' });
    }
  });

  app.get('/api/chat/messages', async (req, res) => {
    const sessionId = req.query.sessionId as string || 'default';
    const messages = await storage.getMessages(sessionId);
    res.json(messages);
  });

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection established');

    ws.on('message', async (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        console.log('Received WebSocket message:', parsed);

        if (parsed.type === 'message') {
          const message = insertMessageSchema.parse({
            content: parsed.payload.content,
            sender: 'user',
            sessionId: parsed.payload.sessionId || 'default',
            metadata: null
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

          // Forward message to n8n webhook if URL is provided
          if (parsed.payload.n8nWebhookUrl) {
            try {
              console.log('Forwarding to n8n:', {
                chatInput: message.content,
                sessionId: message.sessionId
              });

              const response = await fetch(parsed.payload.n8nWebhookUrl, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                  chatInput: message.content,
                  sessionId: message.sessionId
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('n8n error response:', errorText);
                throw new Error(`Failed to forward message to n8n: ${errorText}`);
              }

              const responseData = await response.json();
              console.log('n8n response:', responseData);

            } catch (error) {
              console.error('n8n webhook error:', error);
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Failed to process message with n8n' }
              }));
            }
          }
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid message format' }
        }));
      }
    });
  });

  return httpServer;
}