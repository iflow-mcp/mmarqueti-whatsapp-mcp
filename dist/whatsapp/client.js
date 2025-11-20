"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.whatsAppClient = exports.WhatsAppClient = void 0;
const axios_1 = __importDefault(require("axios"));
const env_js_1 = require("../config/env.js");
class WhatsAppClient {
    client;
    constructor() {
        this.client = axios_1.default.create({
            baseURL: 'https://graph.facebook.com/v18.0',
            headers: {
                'Authorization': `Bearer ${env_js_1.config.META_WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
    }
    async sendText(to, text) {
        try {
            const response = await this.client.post(`/${env_js_1.config.META_WHATSAPP_PHONE_ID}/messages`, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'text',
                text: { body: text },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error sending text message:', error.response?.data || error.message);
            throw error;
        }
    }
    async sendTemplate(to, templateName, language, components = []) {
        try {
            const response = await this.client.post(`/${env_js_1.config.META_WHATSAPP_PHONE_ID}/messages`, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: language },
                    components,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error sending template message:', error.response?.data || error.message);
            throw error;
        }
    }
    async getMediaUrl(mediaId) {
        try {
            const response = await this.client.get(`/${mediaId}`);
            return response.data.url;
        }
        catch (error) {
            console.error('Error getting media URL:', error.response?.data || error.message);
            throw error;
        }
    }
    async downloadMedia(url) {
        try {
            const response = await this.client.get(url, {
                responseType: 'arraybuffer',
                headers: {
                    'Authorization': `Bearer ${env_js_1.config.META_WHATSAPP_TOKEN}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error downloading media:', error.response?.data || error.message);
            throw error;
        }
    }
    async healthCheck() {
        try {
            await this.client.get(`/${env_js_1.config.META_WHATSAPP_PHONE_ID}`);
            return true;
        }
        catch (error) {
            console.error('Health check failed:', error.response?.data || error.message);
            return false;
        }
    }
}
exports.WhatsAppClient = WhatsAppClient;
exports.whatsAppClient = new WhatsAppClient();
