import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Message, type WebSocketMessage } from "@shared/schema";
import ChatMessage from "./ChatMessage";
import { useQuery } from "@tanstack/react-query";

// n8n webhook URL from the Chatbot_6.json
const N8N_WEBHOOK_URL = "https://automated-ai.n8n.cloud/webhook-test/chatbot-6";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: initialMessages } = useQuery({
    queryKey: ['/api/chat/messages'],
  });

  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data: WebSocketMessage = JSON.parse(event.data);

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
            title: "Error",
            description: data.payload,
            variant: "destructive"
          });
          break;
      }
    };

    ws.onerror = () => {
      toast({
        title: "Connection Error",
        description: "Failed to connect to chat server",
        variant: "destructive"
      });
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !socket) return;

    // Send message to WebSocket for local display
    socket.send(JSON.stringify({
      type: 'message',
      payload: { content: input }
    }));

    // Send message to n8n webhook
    try {
      setIsTyping(true);
      console.log("Sending to n8n:", { chatInput: input }); // Debug log

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          chatInput: input
        }),
        mode: 'cors'
      });

      console.log("n8n response status:", response.status); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.error("n8n error:", errorText); // Debug log
        throw new Error(`Failed to get response from bot: ${errorText}`);
      }

      const responseData = await response.json();
      console.log("n8n response data:", responseData); // Debug log

    } catch (error) {
      console.error("Error sending to n8n:", error); // Debug log
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response from bot",
        variant: "destructive"
      });
      setIsTyping(false);
    }

    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.map((message, i) => (
          <ChatMessage key={i} message={message} />
        ))}
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
          />
          <Button onClick={handleSend} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}