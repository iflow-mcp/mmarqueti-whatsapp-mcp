# Use Case: Automated Customer Support Agent

This document describes a complete real-world scenario using the **WhatsApp MCP Server** to power an AI Customer Support Agent for a fictional company, "Pizza Express".

## 1. Scenario Overview

**Goal**: Automate responses to common customer inquiries (order status, menu questions) via WhatsApp using an LLM (e.g., Claude, GPT-4) connected via MCP.

**Actors**:
- **Customer**: Uses WhatsApp on their phone.
- **WhatsApp Cloud API**: Meta's infrastructure.
- **WhatsApp MCP Server**: This project, acting as the bridge.
- **AI Agent**: An LLM client (like Claude Desktop or a custom LangChain agent) connected to the MCP Server.

---

## 2. Workflow

### Step 1: Customer Initiates Contact
**Action**: Customer sends a message to the business number: *"Hi, is my order #1234 ready?"*

**System Flow**:
1. WhatsApp Cloud API receives the message.
2. Meta sends a `POST` request to the MCP Server's `/webhook` endpoint.
3. **MCP Server** normalizes the payload.
4. **MCP Server** broadcasts an MCP Resource/Notification: `whatsapp.incoming_message`.

### Step 2: AI Agent Receives Context
**Action**: The AI Agent is listening to the MCP server.

**Agent View (JSON Event)**:
```json
{
  "method": "notifications/message",
  "params": {
    "name": "whatsapp.incoming_message",
    "data": {
      "from": "+15550123456",
      "type": "text",
      "text": "Hi, is my order #1234 ready?",
      "timestamp": 1715623400,
      "id": "wamid.HBgLM..."
    }
  }
}
```

### Step 3: Agent "Thinks" & Acts
**Action**: The AI Agent processes the text. It recognizes an intent: *Order Status Inquiry*.

**Internal Logic (Simulated)**:
- The Agent might query an internal database (or another MCP server!) to check order #1234.
- Result: "Order #1234 is out for delivery."

### Step 4: Agent Responds via MCP Tool
**Action**: The Agent decides to reply to the user. It calls the `send_text_message` tool provided by the WhatsApp MCP Server.

**Tool Call**:
```json
{
  "name": "send_text_message",
  "arguments": {
    "to": "+15550123456",
    "text": "Hello! I checked for you. Order #1234 is currently out for delivery and should arrive in 10 minutes. 🍕"
  }
}
```

### Step 5: Execution & Delivery
**System Flow**:
1. **MCP Server** receives the tool call.
2. **MCP Server** uses `axios` to call the WhatsApp Cloud API `POST /messages` endpoint.
3. Meta delivers the message to the Customer's WhatsApp app.

---

## 3. Advanced Flow: Handling Media

**Scenario**: Customer receives the pizza but it's the wrong one. They send a photo.

1. **Customer** sends a photo of the pizza.
2. **MCP Server** broadcasts event with `type: "image"`.
   ```json
   {
     "type": "image",
     "image": {
       "id": "987654321",
       "mime_type": "image/jpeg"
     }
   }
   ```
3. **AI Agent** sees the image ID. To analyze it, it calls `get_media`.
   **Tool Call**:
   ```json
   {
     "name": "get_media",
     "arguments": { "media_id": "987654321" }
   }
   ```
4. **MCP Server** returns the temporary URL.
5. **AI Agent** (if multimodal) downloads the image from the URL, analyzes it, and confirms: *"I see that is a Pepperoni pizza, but you ordered Veggie. I apologize!"*
6. **AI Agent** sends a template message for a refund offer using `send_template_message`.

---

## 4. Summary of Tools Used

| Tool Name | Purpose |
|-----------|---------|
| `send_text_message` | Replying to the customer with natural language. |
| `get_media` | Retrieving the image URL to analyze the wrong order. |
| `send_template_message` | Sending a structured, pre-approved refund offer (optional). |
| `list_recent_messages` | (Optional) If the agent restarts, it calls this to catch up on the last 10 messages to understand context. |

This use case demonstrates how the **WhatsApp MCP Server** abstracts the complexity of the Meta API, allowing the AI Agent to focus purely on logic and conversation.
