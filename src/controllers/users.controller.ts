import type {Request, Response} from 'express';
import {usersService} from '../services';

export const usersController = {
    async getAll(_req: Request, res: Response): Promise<void> {
        const users = await usersService.getAll();
        res.json(users);
    },

    async getById(req: Request, res: Response): Promise<void> {
        const user = await usersService.getById(req.params.id as string);

        if (!user) {
            res.status(404).json({error: `User with id "${req.params.id}" not found`});
            return;
        }

        res.json(user);
    },

    async getMe(req: Request, res: Response): Promise<void> {
        const user = await usersService.getById(req.user!.userId);

        if (!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        res.json(user);
    },
};
