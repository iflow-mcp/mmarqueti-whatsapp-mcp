import { NormalizedMessage } from './normalize.js';

export class MessageStorage {
    private messages: NormalizedMessage[] = [];
    private readonly limit: number;

    constructor(limit: number = 50) {
        this.limit = limit;
    }

    addMessage(message: NormalizedMessage) {
        this.messages.unshift(message);
        if (this.messages.length > this.limit) {
            this.messages.pop();
        }
    }

    getRecentMessages(limit: number = 20): NormalizedMessage[] {
        return this.messages.slice(0, limit);
    }
}

export const messageStorage = new MessageStorage();
