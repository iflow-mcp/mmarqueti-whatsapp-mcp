# Testing Guide

This guide explains how to test the WhatsApp MCP Server locally with Claude Desktop and how to simulate incoming WhatsApp messages.

## 1. Connect to Claude Desktop

To test locally without Docker, you can point Claude Desktop directly to your built Node.js project.

1.  Open your Claude Desktop configuration file:
    *   **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
    *   **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2.  Add the following configuration:

    ```json
    {
      "mcpServers": {
        "whatsapp-local": {
          "command": "node",
          "args": ["/ABSOLUTE/PATH/TO/YOUR/PROJECT/dist/index.js"],
          "env": {
            "META_WHATSAPP_TOKEN": "test-token",
            "META_WHATSAPP_PHONE_ID": "test-phone-id",
            "META_WHATSAPP_WABA_ID": "test-waba-id",
            "META_VERIFY_TOKEN": "test-verify-token",
            "PORT": "4000"
          }
        }
      }
    }
    ```
    *Replace `/ABSOLUTE/PATH/TO/YOUR/PROJECT` with the actual path to your `whatsapp-mcp-ai` directory.*
    *Note: For local testing of the **tools** (sending messages), you need real credentials in `env`. For testing **incoming messages** (webhooks), dummy values work if you are just simulating locally.*

3.  Restart Claude Desktop.

## 2. Simulate Incoming Messages (Webhook)

Since you might not have a real WhatsApp number connected yet, you can simulate a user sending a message by manually triggering the webhook endpoint.

### Prerequisites
Ensure your server is running. If you connected it to Claude Desktop as above, Claude will start it automatically. However, to see logs and control it better for testing, you might want to run it separately and use a "stdio" client, or just trust Claude started it.

**Better approach for testing webhook logic:**
Run the server in a terminal so you can see the logs:
```bash
npm run dev
```
*(Note: If you run it this way, Claude Desktop won't be able to connect to the same instance via stdio simultaneously unless you configure it to use SSE/WebSocket, which this server supports but Claude Desktop primarily uses stdio for local processes. For now, let's assume you are testing the **webhook logic** independently or you have Claude connected via `node` command as above).*

### Send a Test Message via CURL
Open a new terminal and run this command to simulate a user saying "Hello":

```bash
curl -X POST http://localhost:4000/webhook \
  -H "Content-Type: application/json" \
  -d '{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "123456789",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "15555555555",
              "phone_number_id": "123456789"
            },
            "contacts": [
              {
                "profile": {
                  "name": "Test User"
                },
                "wa_id": "15550123456"
              }
            ],
            "messages": [
              {
                "from": "15550123456",
                "id": "wamid.test",
                "timestamp": "1700000000",
                "text": {
                  "body": "Hello, I need help with my order!"
                },
                "type": "text"
              }
            ]
          },
          "field": "messages"
        }
      ]
    }
  ]
}'
```

### Verify
1.  Check your server logs. You should see:
    ```
    Received message: { ... normalized message ... }
    ```
2.  If you have an MCP client connected (like a custom script or if you implemented the broadcast correctly), it should receive the `whatsapp.incoming_message` notification.

## 3. Testing Tools with Claude
Once connected to Claude Desktop:
1.  Ask Claude: "Check my recent WhatsApp messages."
    *   Claude should call `list_recent_messages`.
    *   If you ran the curl command above, Claude should see the "Hello" message.
2.  Ask Claude: "Send a message to +15550123456 saying 'Hi there'."
    *   Claude should call `send_text_message`.
