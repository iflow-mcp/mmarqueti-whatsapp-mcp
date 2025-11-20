import axios from 'axios';
import { config } from '../config/env.js';
export class WhatsAppClient {
    client;
    constructor() {
        this.client = axios.create({
            baseURL: 'https://graph.facebook.com/v18.0',
            headers: {
                'Authorization': `Bearer ${config.META_WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
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
