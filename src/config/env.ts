import dotenv from 'dotenv';
import { z } from 'zod';

// Suppress dotenv debug output by not logging to console
dotenv.config({ quiet: true } as any);

const envSchema = z.object({
    META_WHATSAPP_TOKEN: z.string().default('test_token'),
    META_WHATSAPP_PHONE_ID: z.string().default('test_phone_id'),
    META_WHATSAPP_WABA_ID: z.string().default('test_waba_id'),
    META_VERIFY_TOKEN: z.string().default('test_verify_token'),
    PORT: z.string().default('4000'),
    MCP_PORT: z.string().default('8000'),
    LOG_LEVEL: z.string().default('info'),
});

const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
        }
        process.exit(1);
    }
};

export const config = parseEnv();