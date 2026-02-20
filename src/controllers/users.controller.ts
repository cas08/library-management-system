import type { Request, Response } from 'express';
import { createUserSchema } from '../schemas';
import { usersService } from '../services';
import { treeifyError } from 'zod';

export const usersController = {
    getAll(_req: Request, res: Response): void {
        const users = usersService.getAll();
        res.json(users);
    },

    getById(req: Request, res: Response): void {
        const user = usersService.getById(req.params.id as string);

        if (!user) {
            res.status(404).json({ error: `User with id "${req.params.id}" not found` });
            return;
        }

        res.json(user);
    },

    async create(req: Request, res: Response): Promise<void> {
        const result = createUserSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        try {
            const user = await usersService.create(result.data);
            res.status(201).json(user);
        } catch (err) {
            res.status(409).json({ error: (err as Error).message });
        }
    },
};
