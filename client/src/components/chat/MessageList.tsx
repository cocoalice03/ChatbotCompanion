import { Message } from '@shared/schema';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "flex",
            message.sender === 'user' ? 'justify-end' : 'justify-start'
          )}
        >
          <div
            className={cn(
              "rounded-lg px-4 py-2 max-w-[80%]",
              message.sender === 'user'
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}
          >
            <div>{message.content}</div>
            {message.timestamp && (
              <div className="text-xs mt-1 opacity-70">
                {format(new Date(message.timestamp), 'HH:mm')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}