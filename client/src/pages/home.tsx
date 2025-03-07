import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Chatbot Admin</h1>
      <p className="mb-6">Welcome to your n8n Powered Chatbot Interface</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/chat">
          <Button variant="outline" className="w-full p-8 h-auto flex flex-col items-center gap-2">
            <span className="text-xl">Chat Interface</span>
            <span className="text-sm text-muted-foreground">Test your chatbot with a full interface</span>
          </Button>
        </Link>

        <Link to="/embed">
          <Button variant="outline" className="w-full p-8 h-auto flex flex-col items-center gap-2">
            <span className="text-xl">Embed Generator</span>
            <span className="text-sm text-muted-foreground">Create an embed code for your website</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}