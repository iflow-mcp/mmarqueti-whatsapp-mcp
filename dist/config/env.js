import dotenv from 'dotenv';
import { z } from 'zod';
// Suppress dotenv debug output by not logging to console
dotenv.config({ quiet: true });
const envSchema = z.object({
    META_WHATSAPP_TOKEN: z.string().min(1),
    META_WHATSAPP_PHONE_ID: z.string().min(1),
    META_WHATSAPP_WABA_ID: z.string().min(1),
    META_VERIFY_TOKEN: z.string().min(1),
    PORT: z.string().default('4000'),
    MCP_PORT: z.string().default('8000'),
    LOG_LEVEL: z.string().default('info'),
});
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
        }
        process.exit(1);
    }
};
export const config = parseEnv();
