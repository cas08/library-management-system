import type { Request, Response } from 'express';
import { createLoanSchema } from '../schemas';
import { loansService } from '../services';
import { treeifyError } from 'zod';

export const loansController = {
    async getAll(req: Request, res: Response): Promise<void> {
        const user = req.user!;

        const loans = user.role === 'ADMIN'
            ? await loansService.getAll()
            : await loansService.getByUserId(user.userId);

        res.json(loans);
    },

    async create(req: Request, res: Response): Promise<void> {
        const result = createLoanSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        const loan = await loansService.create({
            userId: req.user!.userId,
            bookId: result.data.bookId,
        });
        res.status(201).json(loan);
    },

    async returnBook(req: Request, res: Response): Promise<void> {
        const user = req.user!;
        const loan = await loansService.returnBook(req.params.id as string, user.userId, user.role);
        res.json(loan);
    },
};
