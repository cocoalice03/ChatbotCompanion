
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import EmbeddableChatbot from "@/components/chat/EmbeddableChatbot";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function Embed() {
  const { toast } = useToast();
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState("");
  const [title, setTitle] = useState("Chat Assistant");
  const [height, setHeight] = useState("600");
  const [width, setWidth] = useState("400");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [initialMessage, setInitialMessage] = useState("");
  
  const iframeCode = `<iframe 
  src="${window.location.origin}/chatbot?n8nWebhookUrl=${encodeURIComponent(n8nWebhookUrl)}&title=${encodeURIComponent(title)}&theme=${theme}${initialMessage ? `&initialMessage=${encodeURIComponent(initialMessage)}` : ''}"
  width="${width}"
  height="${height}"
  frameborder="0"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chatbot Embed Generator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Configure Your Chatbot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="n8n-url">n8n Webhook URL (Required)</Label>
                <Input 
                  id="n8n-url"
                  placeholder="https://your-n8n-instance.com/webhook/..."
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">Chatbot Title</Label>
                <Input
                  id="title"
                  placeholder="Chat Assistant"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (px)</Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="400"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="height">Height (px)</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="600"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="theme-switch"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
                <Label htmlFor="theme-switch">Dark Mode</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="initial-message">Initial Bot Message (Optional)</Label>
                <Input
                  id="initial-message"
                  placeholder="How can I help you today?"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={iframeCode}
                readOnly
                onClick={(e) => e.currentTarget.select()}
                className="h-32"
              />
              <Button onClick={handleCopy} className="w-full">
                <Copy className="h-4 w-4 mr-2" />
                Copy Embed Code
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              {n8nWebhookUrl ? (
                <EmbeddableChatbot 
                  n8nWebhookUrl={n8nWebhookUrl}
                  title={title}
                  height={`${height}px`}
                  width={`${width}px`}
                  theme={theme}
                  initialMessage={initialMessage}
                />
              ) : (
                <div className="flex items-center justify-center h-[500px] w-full border rounded-md bg-muted/20">
                  <p className="text-muted-foreground">Enter n8n webhook URL to preview</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
