import type { Request, Response } from 'express';
import { createBookSchema, updateBookSchema } from '../schemas';
import { booksService } from '../services';
import { treeifyError } from 'zod';

export const booksController = {
    async getAll(_req: Request, res: Response): Promise<void> {
        const books = await booksService.getAll();
        res.json(books);
    },

    async getById(req: Request, res: Response): Promise<void> {
        const book = await booksService.getById(req.params.id as string);

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

        const book = await booksService.create(result.data);
        res.status(201).json(book);
    },

    async update(req: Request, res: Response): Promise<void> {
        const result = updateBookSchema.safeParse(req.body);
        if (!result.success) {
            res.status(400).json({ error: treeifyError(result.error) });
            return;
        }

        const book = await booksService.update(req.params.id as string, result.data);
        res.json(book);
    },

    async delete(req: Request, res: Response): Promise<void> {
        await booksService.delete(req.params.id as string);
        res.status(204).send();
    },
};
