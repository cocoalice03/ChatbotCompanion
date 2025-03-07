import { cn } from "@/lib/utils";
import { type Message } from "@shared/schema";
import { format } from "date-fns";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.sender === 'bot';
  
  return (
    <div className={cn(
      "flex mb-4",
      isBot ? "justify-start" : "justify-end"
    )}>
      <div className={cn(
        "rounded-lg px-4 py-2 max-w-[80%]",
        isBot ? "bg-secondary" : "bg-primary text-primary-foreground"
      )}>
        <div className="text-sm">{message.content}</div>
        <div className="text-xs mt-1 opacity-70">
          {format(new Date(message.timestamp), 'HH:mm')}
        </div>
      </div>
    </div>
  );
}
