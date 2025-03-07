import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

export default function EmbedCode() {
  const { toast } = useToast();
  const embedCode = `<iframe 
  src="${window.location.origin}/chat"
  width="400"
  height="600"
  frameborder="0"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Embed This Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            value={embedCode}
            readOnly
            onClick={(e) => e.currentTarget.select()}
          />
          <Button onClick={handleCopy} className="w-full">
            <Copy className="h-4 w-4 mr-2" />
            Copy Embed Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
