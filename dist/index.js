"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const env_js_1 = require("./config/env.js");
const webhook_js_1 = require("./whatsapp/webhook.js");
const server_js_1 = require("./mcp/server.js");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Middleware
app.use(express_1.default.json());
// Routes
app.use('/webhook', webhook_js_1.webhookRouter);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
// Start servers
async function main() {
    try {
        // Start MCP Server (WebSocket)
        await server_js_1.mcpServer.start(httpServer);
        // Start HTTP Server
        httpServer.listen(env_js_1.config.PORT, () => {
            console.log(`🚀 Server running on port ${env_js_1.config.PORT}`);
            console.log(`webhook: http://localhost:${env_js_1.config.PORT}/webhook`);
            console.log(`mcp: ws://localhost:${env_js_1.config.PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
main();
