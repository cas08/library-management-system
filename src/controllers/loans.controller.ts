import type { Request, Response } from 'express';
import { createLoanSchema } from '../schemas';
import { loansService } from '../services';
import { treeifyError } from 'zod';

export const loansController = {
    getAll(_req: Request, res: Response): void {
        const loans = loansService.getAll();
        res.json(loans);
    },

    async create(req: Request, res: Response): Promise<void> {
        const result = createLoanSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        try {
            const loan = await loansService.create(result.data);
            res.status(201).json(loan);
        } catch (err) {
            const message = (err as Error).message;
            const status = message.includes('not found') ? 404 : 422;
            res.status(status).json({ error: message });
        }
    },

    async returnBook(req: Request, res: Response): Promise<void> {
        try {
            const loan = await loansService.returnBook(req.params.id as string);
            res.json(loan);
        } catch (err) {
            const message = (err as Error).message;
            const status = message.includes('not found') ? 404 : 422;
            res.status(status).json({ error: message });
        }
    },
};
