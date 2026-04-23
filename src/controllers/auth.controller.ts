import type { Request, Response } from 'express';
import { registerSchema, loginSchema, requestPasswordResetSchema, resetPasswordSchema } from '../schemas';
import { authService } from '../services';
import { treeifyError } from 'zod';
import { env } from '../config/env';

const GENERIC_RESET_MESSAGE =
    'Якщо вказаний email зареєстрований, лист з інструкціями надіслано.';

export const authController = {
    async register(req: Request, res: Response): Promise<void> {
        const result = registerSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        const data = await authService.register(result.data);
        res.status(201).json(data);
    },

    async login(req: Request, res: Response): Promise<void> {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        const data = await authService.login(result.data);
        res.json(data);
    },

    async requestPasswordReset(req: Request, res: Response): Promise<void> {
        const result = requestPasswordResetSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        try {
            await authService.requestPasswordReset(result.data.email);
        } catch (err) {
            console.error('[auth] requestPasswordReset failed:', err);
        }

        res.json({ message: GENERIC_RESET_MESSAGE });
    },

    async resetPassword(req: Request, res: Response): Promise<void> {
        const result = resetPasswordSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        await authService.resetPassword(result.data.token, result.data.password);
        res.json({ message: 'Пароль успішно змінено.' });
    },

    async googleCallback(req: Request, res: Response): Promise<void> {
        const user = req.user;

        if (!user || !user.token) {
            res.status(401).json({ error: 'OAuth authentication failed' });
            return;
        }

        res.redirect(`${env.FRONTEND_URL}/?token=${user.token}`);
    },
};
