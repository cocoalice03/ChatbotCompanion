import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Message, type WebSocketMessage } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { ConfigPanel } from "./ConfigPanel";
import MessageList from "./MessageList";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: initialMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/chat/messages'],
  });

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // WebSocket connection
  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        console.log("Attempting to connect to WebSocket at:", wsUrl);

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          console.log("WebSocket connected successfully");
          setIsConnected(true);
          toast({
            title: "Connected",
            description: "Chat server connection established",
          });
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed");
          setIsConnected(false);
          setSocket(null);
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        };

        ws.onmessage = (event) => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);
            console.log("Received WebSocket message:", data);

            switch (data.type) {
              case 'message':
                setMessages(prev => [...prev, data.payload]);
                setIsTyping(false);
                break;
              case 'typing':
                setIsTyping(true);
                break;
              case 'error':
                toast({
                  title: "Chat Error",
                  description: data.payload.message || "Failed to process message",
                  variant: "destructive"
                });
                setIsTyping(false);
                break;
              case 'system':
                console.log("System message:", data.payload.message);
                break;
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };

        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          toast({
            title: "Connection Error",
            description: "Failed to connect to chat server. Retrying...",
            variant: "destructive"
          });
        };

        setSocket(ws);
      } catch (error) {
        console.error("Error creating WebSocket:", error);
        setIsConnected(false);
        // Attempt to reconnect after error
        reconnectTimeout = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      console.log("Cleaning up WebSocket connection");
      if (ws) {
        ws.close();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !socket || !isConnected) return;

    if (!n8nWebhookUrl) {
      toast({
        title: "Configuration Needed",
        description: "Please configure your n8n webhook URL first.",
        variant: "destructive"
      });
      return;
    }

    try {
      socket.send(JSON.stringify({
        type: 'message',
        payload: {
          content: input.trim(),
          sessionId: 'default',
          n8nWebhookUrl
        }
      }));
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Send Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      <ConfigPanel
        onSave={setN8nWebhookUrl}
        defaultUrl={n8nWebhookUrl}
      />

      <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <MessageList messages={messages} />
          {isTyping && (
            <div className="text-sm text-muted-foreground italic">
              Bot is typing...
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
              disabled={!isConnected}
            />
            <Button 
              onClick={handleSend} 
              size="icon" 
              disabled={!input.trim() || !n8nWebhookUrl || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <div className="text-sm text-destructive mt-2">
              Connecting to chat server...
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}