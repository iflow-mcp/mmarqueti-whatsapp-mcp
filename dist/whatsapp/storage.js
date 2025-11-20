export class MessageStorage {
    messages = [];
    limit;
    constructor(limit = 50) {
        this.limit = limit;
    }
    addMessage(message) {
        this.messages.unshift(message);
        if (this.messages.length > this.limit) {
            this.messages.pop();
        }
    }
    getRecentMessages(limit = 20) {
        return this.messages.slice(0, limit);
    }
}
export const messageStorage = new MessageStorage();
