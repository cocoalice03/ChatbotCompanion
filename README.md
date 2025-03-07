
# Chatbot with n8n Integration

This project provides a chatbot interface that integrates with n8n workflows for AI-powered conversations.

## Features

- Real-time chat interface using WebSockets
- Integration with n8n AI workflows
- Embedable chatbot for your websites
- Customizable appearance and behavior

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Run the development server:
   ```
   npm run dev
   ```

## Embedding the Chatbot

You can embed this chatbot on any website using an iframe. The embed generator tool provides a customizable interface for generating the embed code.

### How to Embed

1. Navigate to `/embed` in the application
2. Configure your chatbot:
   - Enter your n8n webhook URL
   - Set the desired title
   - Choose dimensions
   - Select light or dark theme
   - Set an optional initial message
3. Copy the generated iframe code
4. Paste the code into your website HTML

Example embed code:

```html
<iframe 
  src="https://your-replit-app.com/chatbot?n8nWebhookUrl=https://your-n8n-instance.com/webhook/your-id"
  width="400"
  height="600"
  frameborder="0"
></iframe>
```

### Parameters

The chatbot accepts the following URL parameters:

- `n8nWebhookUrl` (required): The webhook URL from your n8n instance
- `title`: The title of the chat window
- `theme`: Either "light" or "dark"
- `initialMessage`: An initial message to display from the bot

## n8n Integration

This chatbot is designed to work with n8n workflows. The workflow should:

1. Accept webhook requests
2. Process the `chatInput` field from the incoming data
3. Return the AI response

See the example n8n workflow in the `attached_assets` folder.
