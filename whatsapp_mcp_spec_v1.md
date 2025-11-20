# WhatsApp Cloud API MCP Server – Spec v1.0

## Overview
This project defines version **1.0** of an **MCP Server** that exposes the **WhatsApp Cloud API** to LLM agents through standardized MCP tools.

Goal: Provide a minimal, clean, production-ready baseline so developers can use WhatsApp messaging inside AI agents with zero complexity.

---

# 1. Objectives

- Create a lightweight MCP server (TypeScript + Node.js).
- Expose WhatsApp Cloud API functionalities as tools.
- Accept incoming webhooks and forward them to connected MCP clients.
- Provide helpers for message normalization, verification, and structured logging.
- Be deployable with a single command (Docker + local dev).
- Serve as a foundation for future versions (templates, message types, flows, etc.)

---

# 2. Tech Stack

- **Node.js 20+**
- **TypeScript**
- **Express** (or Fastify) for HTTP + webhooks
- **MCP Server SDK**
- **Axios** for outbound WhatsApp API requests
- **WebSocket** for MCP transport (mandatory)
- **Dotenv** for configs
- **Pino** or console logging

---

# 3. Project Structure (v1.0)

```
/src
  /mcp
    server.ts
    tools.ts
    schema.ts
  /whatsapp
    client.ts
    webhook.ts
    normalize.ts
  /config
    env.ts
  index.ts
.env.example
mcp.json
package.json
README.md
```

---

# 4. Environment Variables

Required:

```
META_WHATSAPP_TOKEN=
META_WHATSAPP_PHONE_ID=
META_WHATSAPP_WABA_ID=
META_VERIFY_TOKEN=
PORT=4000
MCP_PORT=8000
```

Optional:

```
LOG_LEVEL=debug
```

---

# 5. WhatsApp Cloud API Endpoints to Support (v1.0)

The MCP server will call these official endpoints:

### **Send Text Message**
```
POST /v18.0/{PHONE_ID}/messages
```

### **Send Template Message**
```
POST /v18.0/{PHONE_ID}/messages
```

### **Get Media URL**
```
GET /v18.0/{MEDIA_ID}
```

### **Download Media**
```
GET {MEDIA_URL}
```

### **Health Check**
```
GET /v18.0/{PHONE_ID}
```

---

# 6. Webhook Handling

Expose:
```
POST /webhook
GET  /webhook (verification)
```

Features:
- Validate `hub.verify_token`
- Parse WhatsApp inbound messages:
  - text
  - image
  - audio
  - document
  - interactive (buttons, lists)
- Normalize messages into a single consistent JSON format:
  ```json
  {
    "from": "+551199999999",
    "id": "wamid...",
    "timestamp": 123123123,
    "type": "text",
    "text": "Hello",
    "raw": { }
  }
  ```
- Broadcast new messages over MCP WebSocket to any connected agent.

---

# 7. MCP Tools (v1.0)

Tools exposed to agents:

## **1. send_text_message**
Send a simple text message to a WhatsApp user.

### Params:
```json
{
  "to": "string",
  "text": "string"
}
```

## **2. send_template_message**
Send a WhatsApp template message.

### Params:
```json
{
  "to": "string",
  "template_name": "string",
  "language": "string",
  "components": []
}
```

## **3. get_media**
Retrieve a media file by MEDIA_ID.

### Params:
```json
{
  "media_id": "string"
}
```

## **4. list_recent_messages**
Return the last N normalized inbound messages.

### Params:
```json
{
  "limit": 20
}
```

## **5. health_check**
Verify connectivity with WhatsApp Cloud API.

---

# 8. MCP Responses (Events)

Whenever a new WhatsApp message arrives via webhook, push an MCP event:

### Event name:
```
whatsapp.incoming_message
```

### Payload:
```json
{
  "from": "+551199999999",
  "type": "text",
  "text": "oi",
  "timestamp": 1710002312,
  "raw": {}
}
```

---

# 9. Security

- Validate Meta webhook signature (optional v1).
- Restrict MCP tool usage to authenticated WebSocket clients.
- Sanitize user inputs.
- Never log tokens.

---

# 10. Documentation Requirements

README.md must include:

- Setup instructions  
- Running locally:
  ```
  npm install
  npm run dev
  ```
- Configuring WhatsApp webhook in Meta dashboard  
- Example Requests for all MCP tools  
- Example using Claude Desktop / GPT Agent Builder  
- Docker example:
  ```
  docker run -p 4000:4000 -p 8000:8000 whatsapp-mcp
  ```

---

# 11. Future v2.0 Ideas (not required now)

- Interactive messages  
- Conversation history  
- Multi-number support  
- Rate limit manager  
- AI flows (context manager)  
- Dashboard UI  

---

# Final Summary

Implement a minimal **WhatsApp MCP Server** that provides:  
- WhatsApp tools  
- Webhook ingestion  
- Message normalization  
- MCP event streaming  
- Typed TS code  
- Clean architecture  

