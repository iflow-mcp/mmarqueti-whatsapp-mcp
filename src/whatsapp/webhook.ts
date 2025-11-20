import express from 'express';
import { config } from '../config/env.js';
import { normalizeMessage } from './normalize.js';
import { mcpServer } from '../mcp/server.js';
import { messageStorage } from './storage.js';

const router = express.Router();

// Verification endpoint
router.get('/', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === config.META_VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    } else {
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
                            const normalized = normalizeMessage(body);
                            if (normalized) {
                                console.error('Received message:', JSON.stringify(normalized, null, 2));
                                // Store message
                                messageStorage.addMessage(normalized);
                                // Broadcast to MCP clients
                                await mcpServer.broadcastMessage(normalized);
                            }
                        }
                    }
                }
            }
        }
        res.sendStatus(200);
    } else {
        res.sendStatus(404);
    }
});

export const webhookRouter = router;
