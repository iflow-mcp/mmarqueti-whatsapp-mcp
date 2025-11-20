import { describe, it, expect } from 'vitest';
import { normalizeMessage } from '../normalize.js';

describe('normalizeMessage', () => {
    it('should return null for invalid payload', () => {
        const payload = {};
        const result = normalizeMessage(payload);
        expect(result).toBeNull();
    });

    it('should normalize a text message', () => {
        const payload = {
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: '1234567890',
                            id: 'wamid.test',
                            timestamp: '1700000000',
                            type: 'text',
                            text: { body: 'Hello World' }
                        }]
                    }
                }]
            }]
        };

        const result = normalizeMessage(payload);
        expect(result).toEqual({
            from: '1234567890',
            id: 'wamid.test',
            timestamp: 1700000000,
            type: 'text',
            text: 'Hello World',
            raw: payload.entry[0].changes[0].value.messages[0]
        });
    });

    it('should normalize an image message', () => {
        const payload = {
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: '1234567890',
                            id: 'wamid.image',
                            timestamp: '1700000000',
                            type: 'image',
                            image: {
                                id: 'img123',
                                mime_type: 'image/jpeg',
                                sha: 'sha123'
                            }
                        }]
                    }
                }]
            }]
        };

        const result = normalizeMessage(payload);
        expect(result).toEqual({
            from: '1234567890',
            id: 'wamid.image',
            timestamp: 1700000000,
            type: 'image',
            image: {
                id: 'img123',
                mime_type: 'image/jpeg',
                sha: 'sha123'
            },
            raw: payload.entry[0].changes[0].value.messages[0]
        });
    });

    it('should handle unknown message types', () => {
        const payload = {
            entry: [{
                changes: [{
                    value: {
                        messages: [{
                            from: '1234567890',
                            id: 'wamid.unknown',
                            timestamp: '1700000000',
                            type: 'sticker',
                            sticker: {}
                        }]
                    }
                }]
            }]
        };

        const result = normalizeMessage(payload);
        expect(result).toEqual({
            from: '1234567890',
            id: 'wamid.unknown',
            timestamp: 1700000000,
            type: 'unknown',
            raw: payload.entry[0].changes[0].value.messages[0]
        });
    });
});
