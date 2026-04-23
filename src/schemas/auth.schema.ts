import { z } from 'zod';

const emailField = z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.email('Invalid email'),
);

export const registerSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    email: emailField,
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
    email: emailField,
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const requestPasswordResetSchema = z.object({
    email: emailField,
});

export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
