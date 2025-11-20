"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookRouter = void 0;
const express_1 = __importDefault(require("express"));
const env_js_1 = require("../config/env.js");
const normalize_js_1 = require("./normalize.js");
const server_js_1 = require("../mcp/server.js");
const storage_js_1 = require("./storage.js");
const router = express_1.default.Router();
// Verification endpoint
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode && token) {
        if (mode === 'subscribe' && token === env_js_1.config.META_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        }
        else {
            res.sendStatus(403);
        }
    }
    else {
        res.sendStatus(400);
    }
});
// Message ingestion endpoint
router.post('/', async (req, res) => {
    const body = req.body;
    // Check if this is an event from a page subscription
    if (body.object === 'whatsapp_business_account') {
        // Iterate over each entry - there may be multiple if batched
        if (body.entry) {
            for (const entry of body.entry) {
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.value && change.value.messages) {
                            const normalized = (0, normalize_js_1.normalizeMessage)(body);
                            if (normalized) {
                                console.log('Received message:', JSON.stringify(normalized, null, 2));
                                // Store message
                                storage_js_1.messageStorage.addMessage(normalized);
                                // Broadcast to MCP clients
                                await server_js_1.mcpServer.broadcastMessage(normalized);
                            }
                        }
                    }
                }
            }
        }
        res.sendStatus(200);
    }
    else {
        res.sendStatus(404);
    }
});
exports.webhookRouter = router;
