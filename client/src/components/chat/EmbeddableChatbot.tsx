
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Message, type WebSocketMessage } from "@shared/schema";
import MessageList from "./MessageList";

interface EmbeddableChatbotProps {
  n8nWebhookUrl: string;
  title?: string;
  height?: string;
  width?: string;
  theme?: 'light' | 'dark';
  initialMessage?: string;
}

export default function EmbeddableChatbot({
  n8nWebhookUrl,
  title = "Chat Assistant",
  height = "600px",
  width = "100%",
  theme = "light",
  initialMessage
}: EmbeddableChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const sessionId = useState(() => Math.random().toString(36).slice(2))[0];

  // Effect for WebSocket connection
  useEffect(() => {
    // Determine WebSocket URL based on protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log("Attempting to connect to WebSocket at:", wsUrl);
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected successfully");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log("Received WebSocket message:", message);

      if (message.type === 'message') {
        setMessages((prev) => [...prev, message.payload]);
        setIsTyping(false);
      } else if (message.type === 'typing') {
        setIsTyping(true);
      } else if (message.type === 'system') {
        console.log("System message:", message.payload.message);
      } else if (message.type === 'error') {
        toast({
          variant: "destructive",
          title: "Error",
          description: message.payload.message,
        });
        setIsTyping(false);
      }
    };

    ws.onerror = (error) => {
      console.log("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
      setIsConnected(false);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  // Initial message
  useEffect(() => {
    if (initialMessage && isConnected && messages.length === 0) {
      handleSendMessage(initialMessage);
    }
  }, [initialMessage, isConnected, messages.length]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !isConnected || !n8nWebhookUrl) return;

    const userMessage: Message = {
      id: Date.now(),
      content: content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      sessionId,
    };

    setMessages((prev) => [...prev, userMessage]);
    
    const payload = {
      type: 'message',
      payload: {
        content,
        sessionId,
        n8nWebhookUrl
      }
    };
    
    console.log("Sending to n8n:", { chatInput: content });
    socket?.send(JSON.stringify(payload));
    setInput("");
    setIsTyping(true);
  };

  const handleSend = () => {
    handleSendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col" style={{ height, width }}>
      <div className="p-3 border-b bg-secondary/30">
        <h3 className="font-medium">{title}</h3>
      </div>
      
      <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
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
  );
}
