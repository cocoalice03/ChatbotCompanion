import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Message, WebSocketMessage, ChatWidgetConfig } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, X, Minimize2 } from 'lucide-react';

interface ChatWidgetProps {
  config: ChatWidgetConfig;
}

export function ChatWidget({ config }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const { toast } = useToast();
  const sessionId = useState(() => Math.random().toString(36).slice(2))[0];

  // Fetch existing messages
  const { data: messages = [], refetch } = useQuery({
    queryKey: ['/api/chat/messages', sessionId],
    queryFn: async () => {
      const response = await fetch(`/api/chat/messages?sessionId=${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      return response.json();
    }
  });

  // Connect to WebSocket
  useEffect(() => {
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      if (message.type === 'message') {
        refetch();
      } else if (message.type === 'error') {
        toast({
          variant: "destructive",
          title: "Error",
          description: message.payload.message,
        });
      }
    };

    setWs(websocket);
    return () => websocket.close();
  }, []);

  // Send initial message if configured
  useEffect(() => {
    if (config.initialMessage && messages.length === 0) {
      ws?.send(JSON.stringify({
        type: 'message',
        payload: {
          content: config.initialMessage,
          sessionId,
          n8nWebhookUrl: config.n8nWebhookUrl
        }
      }));
    }
  }, [config.initialMessage, ws]);

  const sendMessage = async (content: string) => {
    if (!ws) throw new Error('WebSocket not connected');

    ws.send(JSON.stringify({
      type: 'message',
      payload: {
        content,
        sessionId,
        n8nWebhookUrl: config.n8nWebhookUrl
      }
    }));
  };

  if (!isOpen) {
    return (
      <Button
        className={`fixed ${config.position === 'bottom-left' ? 'left-4' : 'right-4'} bottom-4 rounded-full p-4`}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card 
      className={`fixed ${config.position === 'bottom-left' ? 'left-4' : 'right-4'} bottom-4 w-[400px] h-[600px] flex flex-col shadow-lg`}
      data-theme={config.theme}
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="font-semibold">{config.title || 'Chat'}</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
      </div>

      <div className="p-4 border-t">
        <ChatInput
          onSend={async (content: string) => {
            try {
              await sendMessage(content);
            } catch (error) {
              toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send message",
              });
            }
          }}
        />
      </div>
    </Card>
  );
}