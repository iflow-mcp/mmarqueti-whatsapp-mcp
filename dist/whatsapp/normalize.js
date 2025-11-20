"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeMessage = normalizeMessage;
function normalizeMessage(webhookPayload) {
    try {
        const entry = webhookPayload.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];
        if (!message) {
            return null;
        }
        const normalized = {
            from: message.from,
            id: message.id,
            timestamp: parseInt(message.timestamp, 10),
            type: 'unknown',
            raw: message,
        };
        switch (message.type) {
            case 'text':
                normalized.type = 'text';
                normalized.text = message.text.body;
                break;
            case 'image':
                normalized.type = 'image';
                normalized.image = message.image;
                break;
            case 'audio':
                normalized.type = 'audio';
                normalized.audio = message.audio;
                break;
            case 'document':
                normalized.type = 'document';
                normalized.document = message.document;
                break;
            case 'interactive':
                normalized.type = 'interactive';
                normalized.interactive = message.interactive;
                break;
            default:
                normalized.type = 'unknown';
        }
        return normalized;
    }
    catch (error) {
        console.error('Error normalizing message:', error);
        return null;
    }
}
