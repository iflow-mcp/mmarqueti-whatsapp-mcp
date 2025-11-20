export interface NormalizedMessage {
    from: string;
    id: string;
    timestamp: number;
    type: 'text' | 'image' | 'audio' | 'document' | 'interactive' | 'unknown';
    text?: string;
    image?: { id: string; caption?: string; mime_type: string; sha: string };
    audio?: { id: string; mime_type: string; sha: string };
    document?: { id: string; caption?: string; mime_type: string; sha: string; filename: string };
    interactive?: any;
    raw: any;
}

export function normalizeMessage(webhookPayload: any): NormalizedMessage | null {
    try {
        const entry = webhookPayload.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];

        if (!message) {
            return null;
        }

        const normalized: NormalizedMessage = {
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
    } catch (error) {
        console.error('Error normalizing message:', error);
        return null;
    }
}
