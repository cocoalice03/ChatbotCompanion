import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ConfigPanelProps {
  onSave: (url: string) => void;
  defaultUrl?: string;
}

export function ConfigPanel({ onSave, defaultUrl }: ConfigPanelProps) {
  const [url, setUrl] = useState(defaultUrl || '');
  const { toast } = useToast();

  const handleSave = () => {
    try {
      // Validate URL format
      new URL(url);
      onSave(url);
      toast({
        title: "Configuration Saved",
        description: "n8n webhook URL has been updated",
      });
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>n8n Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your n8n webhook URL"
              type="url"
            />
          </div>
          <Button onClick={handleSave} className="w-full">
            Save Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}