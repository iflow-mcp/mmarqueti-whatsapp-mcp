import axios from 'axios';
import { config } from '../config/env.js';
// Mock mode for testing without real API credentials
const isMockMode = !process.env.META_WHATSAPP_TOKEN ||
    process.env.META_WHATSAPP_TOKEN === 'test_token' ||
    !process.env.META_WHATSAPP_PHONE_ID;
export class WhatsAppClient {
    client;
    constructor() {
        if (isMockMode) {
            // Create mock client that doesn't make real API calls
            this.client = {
                get: async (url, config) => {
                    console.error(`[MOCK] GET request to ${url}`);
                    if (url.includes('PHONE_ID')) {
                        return { data: { id: 'mock_phone_id' } };
                    }
                    if (url.match(/^[0-9]+$/)) {
                        return { data: { url: 'https://mock.media.url/file.pdf' } };
                    }
                    return { data: {} };
                },
                post: async (url, data, config) => {
                    console.error(`[MOCK] POST request to ${url}`, data);
                    return { data: { success: true, message: 'Mock response' } };
                }
            };
        }
        else {
            this.client = axios.create({
                baseURL: 'https://graph.facebook.com/v18.0',
                headers: {
                    'Authorization': `Bearer ${config.META_WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
        }
    }
    async sendText(to, text) {
        try {
            const response = await this.client.post(`/${config.META_WHATSAPP_PHONE_ID}/messages`, {
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
            const response = await this.client.post(`/${config.META_WHATSAPP_PHONE_ID}/messages`, {
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
                    'Authorization': `Bearer ${config.META_WHATSAPP_TOKEN}`,
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
            await this.client.get(`/${config.META_WHATSAPP_PHONE_ID}`);
            return true;
        }
        catch (error) {
            console.error('Health check failed:', error.response?.data || error.message);
            return false;
        }
    }
}
export const whatsAppClient = new WhatsAppClient();
