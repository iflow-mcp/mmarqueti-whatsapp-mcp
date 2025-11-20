"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    META_WHATSAPP_TOKEN: zod_1.z.string().min(1),
    META_WHATSAPP_PHONE_ID: zod_1.z.string().min(1),
    META_WHATSAPP_WABA_ID: zod_1.z.string().min(1),
    META_VERIFY_TOKEN: zod_1.z.string().min(1),
    PORT: zod_1.z.string().default('4000'),
    MCP_PORT: zod_1.z.string().default('8000'),
    LOG_LEVEL: zod_1.z.string().default('info'),
});
const parseEnv = () => {
    try {
        return envSchema.parse(process.env);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.error('❌ Invalid environment variables:', error.flatten().fieldErrors);
        }
        process.exit(1);
    }
};
exports.config = parseEnv();
