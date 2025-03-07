
import { useEffect, useState } from "react";
import EmbeddableChatbot from "@/components/chat/EmbeddableChatbot";

export default function Chatbot() {
  const [params, setParams] = useState({
    n8nWebhookUrl: "",
    title: "Chat Assistant",
    height: "100vh",
    width: "100%",
    theme: "light" as "light" | "dark",
    initialMessage: "",
  });

  useEffect(() => {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const n8nWebhookUrl = urlParams.get("n8nWebhookUrl") || "";
    const title = urlParams.get("title") || "Chat Assistant";
    const theme = (urlParams.get("theme") || "light") as "light" | "dark";
    const initialMessage = urlParams.get("initialMessage") || "";

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setParams({
      n8nWebhookUrl,
      title,
      height: "100vh",
      width: "100%",
      theme,
      initialMessage,
    });
  }, []);

  if (!params.n8nWebhookUrl) {
    return (
      <div className="h-screen flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-lg font-medium mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">
            Missing required n8nWebhookUrl parameter. 
            Please make sure to include a valid webhook URL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen">
      <EmbeddableChatbot {...params} />
    </div>
  );
}
