import express from 'express';
import { createServer } from 'http';
import { config } from './config/env.js';
import { webhookRouter } from './whatsapp/webhook.js';
import { mcpServer } from './mcp/server.js';
// Start servers
async function main() {
    try {
        const args = process.argv.slice(2);
        // Check for --stdio flag or --transport stdio
        const useStdio = args.includes('--stdio') ||
            (args.includes('--transport') && args.includes('stdio'));
        if (useStdio) {
            // Start MCP Server (Stdio) only - no HTTP server needed
            await mcpServer.startStdio();
        }
        else {
            // Setup HTTP server for WebSocket mode
            const app = express();
            const httpServer = createServer(app);
            // Middleware
            app.use(express.json());
            // Routes
            app.use('/webhook', webhookRouter);
            // Health check
            app.get('/health', (req, res) => {
                res.status(200).json({ status: 'ok' });
            });
            // Start MCP Server (WebSocket)
            await mcpServer.start(httpServer);
            // Start HTTP Server
            httpServer.listen(config.PORT, () => {
                console.error(`🚀 Server running on port ${config.PORT}`);
                console.error(`webhook: http://localhost:${config.PORT}/webhook`);
                console.error(`mcp: ws://localhost:${config.PORT}`);
            });
        }
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
main();
