import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { webhookRouter } from '../webhook.js';
import { config } from '../../config/env.js';
import { messageStorage } from '../storage.js';

// Mock config
vi.mock('../../config/env.js', () => ({
    config: {
        META_VERIFY_TOKEN: 'test-token',
        META_WHATSAPP_TOKEN: 'test-token',
        META_WHATSAPP_PHONE_ID: 'test-phone-id',
        PORT: 4000
    }
}));

// Mock mcpServer
vi.mock('../../mcp/server.js', () => ({
    mcpServer: {
        broadcastMessage: vi.fn().mockResolvedValue(undefined)
    }
}));

const app = express();
app.use(express.json());
app.use('/webhook', webhookRouter);

describe('Webhook Integration', () => {
    beforeEach(() => {
        // Clear storage before each test
        // We need to access the private array or just add a clear method to storage
        // For now, we can just assume it works or add a clear method if needed.
        // But since we are testing ingestion, we can just check if count increases.
    });

    describe('GET /webhook', () => {
        it('should verify token correctly', async () => {
            const response = await request(app)
                .get('/webhook')
                .query({
                    'hub.mode': 'subscribe',
                    'hub.verify_token': 'test-token',
                    'hub.challenge': '12345'
                });

            expect(response.status).toBe(200);
            expect(response.text).toBe('12345');
        });

        it('should reject invalid token', async () => {
            const response = await request(app)
                .get('/webhook')
                .query({
                    'hub.mode': 'subscribe',
                    'hub.verify_token': 'wrong-token',
                    'hub.challenge': '12345'
                });

            expect(response.status).toBe(403);
        });

        it('should reject missing params', async () => {
            const response = await request(app)
                .get('/webhook');

            expect(response.status).toBe(400);
        });
    });

    describe('POST /webhook', () => {
        it('should process incoming text message', async () => {
            const payload = {
                object: 'whatsapp_business_account',
                entry: [{
                    changes: [{
                        value: {
                            messages: [{
                                from: '1234567890',
                                id: 'wamid.test',
                                timestamp: '1700000000',
                                type: 'text',
                                text: { body: 'Hello Integration' }
                            }]
                        }
                    }]
                }]
            };

            const response = await request(app)
                .post('/webhook')
                .send(payload);

            expect(response.status).toBe(200);

            // Verify message was stored
            const recent = messageStorage.getRecentMessages(1);
            expect(recent[0].text).toBe('Hello Integration');
        });

        it('should ignore non-whatsapp objects', async () => {
            const response = await request(app)
                .post('/webhook')
                .send({ object: 'other' });

            expect(response.status).toBe(404);
        });
    });
});
