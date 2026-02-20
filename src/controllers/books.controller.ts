import type { Request, Response } from 'express';
import { createBookSchema, updateBookSchema } from '../schemas';
import { booksService } from '../services';
import { treeifyError } from 'zod';

export const booksController = {
    getAll(_req: Request, res: Response): void {
        const books = booksService.getAll();
        res.json(books);
    },

    getById(req: Request, res: Response): void {
        const book = booksService.getById(req.params.id as string);

        if (!book) {
            res.status(404).json({ error: `Book with id "${req.params.id}" not found` });
            return;
        }

        res.json(book);
    },

    async create(req: Request, res: Response): Promise<void> {
        const result = createBookSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        try {
            const book = await booksService.create(result.data);
            res.status(201).json(book);
        } catch (err) {
            res.status(409).json({ error: (err as Error).message });
        }
    },

    async update(req: Request, res: Response): Promise<void> {
        const result = updateBookSchema.safeParse(req.body);

        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        try {
            const book = await booksService.update(req.params.id as string, result.data);
            res.json(book);
        } catch (err) {
            const message = (err as Error).message;
            const status = message.includes('not found') ? 404 : 409;
            res.status(status).json({ error: message });
        }
    },

    async delete(req: Request, res: Response): Promise<void> {
        try {
            await booksService.delete(req.params.id as string);
            res.status(204).send();
        } catch (err) {
            const message = (err as Error).message;
            const status = message.includes('not found') ? 404 : 409;
            res.status(status).json({ error: message });
        }
    },
};
