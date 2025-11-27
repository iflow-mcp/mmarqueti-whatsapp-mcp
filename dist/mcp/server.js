import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { WebSocketServer } from 'ws';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { whatsAppClient } from '../whatsapp/client.js';
class WhatsAppMcpServer {
    server;
    wss = null;
    constructor() {
        this.server = new McpServer({
            name: 'WhatsApp MCP Server',
            version: '1.0.0',
        });
        this.registerTools();
    }
    registerTools() {
        this.server.tool('send_text_message', {
            to: z.string().describe('The WhatsApp phone number to send the message to'),
            text: z.string().describe('The text content of the message'),
        }, async ({ to, text }) => {
            const result = await whatsAppClient.sendText(to, text);
            return {
                content: [{ type: 'text', text: JSON.stringify(result) }],
            };
        });
        this.server.tool('send_template_message', {
            to: z.string().describe('The WhatsApp phone number'),
            template_name: z.string().describe('Name of the template'),
            language: z.string().describe('Language code (e.g., en_US)'),
            components: z.array(z.any()).optional().describe('Template components'),
        }, async ({ to, template_name, language, components }) => {
            const result = await whatsAppClient.sendTemplate(to, template_name, language, components);
            return {
                content: [{ type: 'text', text: JSON.stringify(result) }],
            };
        });
        this.server.tool('get_media', {
            media_id: z.string().describe('The ID of the media to retrieve'),
        }, async ({ media_id }) => {
            const url = await whatsAppClient.getMediaUrl(media_id);
            return {
                content: [{ type: 'text', text: url }],
            };
        });
        this.server.tool('health_check', {}, async () => {
            const isHealthy = await whatsAppClient.healthCheck();
            return {
                content: [{ type: 'text', text: isHealthy ? 'healthy' : 'unhealthy' }],
                isError: !isHealthy,
            };
        });
    }
    async start(httpServer) {
        this.wss = new WebSocketServer({ server: httpServer });
        this.wss.on('connection', async (ws) => {
            console.error('New MCP WebSocket connection');
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
    async startStdio() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('MCP Server running on stdio');
    }
}
export const mcpServer = new WhatsAppMcpServer();
