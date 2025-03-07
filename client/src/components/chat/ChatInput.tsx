import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [content, setContent] = useState('');

  return (
    <div className="flex gap-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="resize-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (content.trim()) {
              onSend(content.trim()).then(() => setContent(''));
            }
          }
        }}
      />
      <Button
        disabled={!content.trim() || isLoading}
        onClick={async () => {
          if (content.trim()) {
            await onSend(content.trim());
            setContent('');
          }
        }}
      >
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
