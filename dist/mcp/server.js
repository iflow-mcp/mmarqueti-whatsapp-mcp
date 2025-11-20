"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcpServer = void 0;
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const ws_1 = require("ws");
const zod_1 = require("zod");
const client_js_1 = require("../whatsapp/client.js");
class WhatsAppMcpServer {
    server;
    wss = null;
    constructor() {
        this.server = new mcp_js_1.McpServer({
            name: 'WhatsApp MCP Server',
            version: '1.0.0',
        });
        this.registerTools();
    }
    registerTools() {
        this.server.tool('send_text_message', {
            to: zod_1.z.string().describe('The WhatsApp phone number to send the message to'),
            text: zod_1.z.string().describe('The text content of the message'),
        }, async ({ to, text }) => {
            const result = await client_js_1.whatsAppClient.sendText(to, text);
            return {
                content: [{ type: 'text', text: JSON.stringify(result) }],
            };
        });
        this.server.tool('send_template_message', {
            to: zod_1.z.string().describe('The WhatsApp phone number'),
            template_name: zod_1.z.string().describe('Name of the template'),
            language: zod_1.z.string().describe('Language code (e.g., en_US)'),
            components: zod_1.z.array(zod_1.z.any()).optional().describe('Template components'),
        }, async ({ to, template_name, language, components }) => {
            const result = await client_js_1.whatsAppClient.sendTemplate(to, template_name, language, components);
            return {
                content: [{ type: 'text', text: JSON.stringify(result) }],
            };
        });
        this.server.tool('get_media', {
            media_id: zod_1.z.string().describe('The ID of the media to retrieve'),
        }, async ({ media_id }) => {
            const url = await client_js_1.whatsAppClient.getMediaUrl(media_id);
            return {
                content: [{ type: 'text', text: url }],
            };
        });
        this.server.tool('list_recent_messages', {
            limit: zod_1.z.number().optional().describe('Number of messages to retrieve (default 20)'),
        }, async ({ limit = 20 }) => {
            const { messageStorage } = await import('../whatsapp/storage.js');
            const messages = messageStorage.getRecentMessages(limit);
            return {
                content: [{ type: 'text', text: JSON.stringify(messages) }],
            };
        });
        this.server.tool('health_check', {}, async () => {
            const isHealthy = await client_js_1.whatsAppClient.healthCheck();
            return {
                content: [{ type: 'text', text: isHealthy ? 'healthy' : 'unhealthy' }],
                isError: !isHealthy,
            };
        });
    }
    async start(httpServer) {
        this.wss = new ws_1.WebSocketServer({ server: httpServer });
        this.wss.on('connection', async (ws) => {
            console.log('New MCP WebSocket connection');
            // Minimal Transport implementation for WebSocket
            const transport = {
                start: async () => { },
                send: async (message) => {
                    if (ws.readyState === ws.OPEN) {
                        ws.send(JSON.stringify(message));
                    }
                },
                close: async () => {
                    ws.close();
                },
                onclose: undefined,
                onerror: undefined,
                onmessage: undefined,
            };
            ws.on('message', (data) => {
                try {
                    const message = JSON.parse(data.toString());
                    if (transport.onmessage) {
                        transport.onmessage(message);
                    }
                }
                catch (error) {
                    console.error('Failed to parse message:', error);
                }
            });
            ws.on('close', () => {
                if (transport.onclose) {
                    transport.onclose();
                }
            });
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                if (transport.onerror) {
                    transport.onerror(error);
                }
            });
            // @ts-ignore - McpServer.connect expects a Transport interface which matches our object structure
            await this.server.connect(transport);
        });
    }
    async broadcastMessage(message) {
        // In a real MCP implementation, we would send a resource update or a notification.
        // For v1.0, we will send a custom notification if the SDK supports it, 
        // or just log it if we can't easily push to all clients without a specific subscription.
        // The spec says "push an MCP event: whatsapp.incoming_message".
        // We can use server.sendNotification if available, or manually send via transport if we tracked them.
        // Since McpServer abstracts connections, we might need to access the underlying connections 
        // or use a method to broadcast. 
        // If the SDK doesn't support broadcast easily, we will iterate over our managed connections if we had them.
        // But `server.connect` is 1-to-1. 
        // To support multiple clients, we might need to create a new McpServer instance per connection 
        // or share the tool definitions.
        // For simplicity in v1.0 and to match the "server" concept:
        // We will just log that we would broadcast. 
        // Implementing full broadcast with the current SDK might require more boilerplate 
        // (managing a list of connected servers).
        if (this.wss) {
            this.wss.clients.forEach((client) => {
                if (client.readyState === 1) { // OPEN
                    // Construct JSON-RPC notification
                    const notification = {
                        jsonrpc: "2.0",
                        method: "notifications/message",
                        params: {
                            name: "whatsapp.incoming_message",
                            data: message
                        }
                    };
                    client.send(JSON.stringify(notification));
                }
            });
        }
    }
}
exports.mcpServer = new WhatsAppMcpServer();
