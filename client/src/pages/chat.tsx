import ChatInterface from "@/components/chat/ChatInterface";
import EmbedCode from "@/components/chat/EmbedCode";

export default function Chat() {
  const isEmbedded = window.self !== window.top;

  return (
    <div className="container mx-auto p-4">
      <ChatInterface />
      {!isEmbedded && <EmbedCode />}
    </div>
  );
}
