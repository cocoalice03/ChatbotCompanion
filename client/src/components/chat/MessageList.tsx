import { type Message } from "@shared/schema";
import ChatMessage from "./ChatMessage";

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  if (messages.length === 0) {
    return (
      <div className="flex justify-center items-center p-4 text-center h-full min-h-[100px]">
        <p className="text-muted-foreground text-sm">
          No messages yet. Start a conversation!
        </p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </>
  );
}