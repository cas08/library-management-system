import type {Request, Response} from 'express';
import {registerSchema, loginSchema} from '../schemas';
import {authService} from '../services';
import {treeifyError} from 'zod';
import {HttpError} from '../lib/httpError';

export const authController = {
    async register(req: Request, res: Response): Promise<void> {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({error: treeifyError(result.error)});
            return;
        }

        try {
            const data = await authService.register(result.data);
            res.status(201).json(data);
        } catch (err) {
            if (err instanceof HttpError) {
                res.status(err.status).json({error: err.message});
            } else {
                res.status(500).json({error: 'Internal server error'});
            }
        }
    },

    async login(req: Request, res: Response): Promise<void> {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({error: treeifyError(result.error)});
            return;
        }

        try {
            const data = await authService.login(result.data);
            res.json(data);
        } catch (err) {
            if (err instanceof HttpError) {
                res.status(err.status).json({error: err.message});
            } else {
                res.status(500).json({error: 'Internal server error'});
            }
        }
    },

    async googleCallback(req: Request, res: Response): Promise<void> {
        const user = req.user;

        if (!user || !user.token) {
            res.status(401).json({error: 'OAuth authentication failed'});
            return;
        }

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/?token=${user.token}`);
    },
};
