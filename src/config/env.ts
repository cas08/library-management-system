import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string(),
    DIRECT_URL: z.string(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('24h'),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALLBACK_URL: z.string().default('http://localhost:3000/auth/google/callback'),
    PORT: z.coerce.number().default(3000),

    APP_URL: z.string().default('http://localhost:3000'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().default(587),
    SMTP_AUTH_USER: z.string().optional(),
    SMTP_AUTH_PASS: z.string().optional(),
    SENDER_EMAIL: z.string().default('noreply@library.local'),

    PASSWORD_RESET_TOKEN_TTL_MIN: z.coerce.number().default(15),

    STORAGE_DRIVER: z.enum(['local', 'cloudinary']).default('local'),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    CLOUDINARY_FOLDER: z.string().default('library-management-system/avatars'),
});

export const env = envSchema.parse(process.env);
