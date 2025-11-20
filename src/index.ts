import express from 'express';
import { createServer } from 'http';
import { config } from './config/env.js';
import { webhookRouter } from './whatsapp/webhook.js';
import { mcpServer } from './mcp/server.js';

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

// Start servers
async function main() {
    try {
        // Start MCP Server (WebSocket)
        await mcpServer.start(httpServer);

        // Start HTTP Server
        httpServer.listen(config.PORT, () => {
            console.log(`🚀 Server running on port ${config.PORT}`);
            console.log(`webhook: http://localhost:${config.PORT}/webhook`);
            console.log(`mcp: ws://localhost:${config.PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

main();
