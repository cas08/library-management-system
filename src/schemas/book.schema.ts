import { z } from 'zod';

// POST-схема
export const createBookSchema = z.object({
    title: z.string().min(1, "Name is required"),
    author: z.string().min(1, "Author is required"),
    year: z.number().int().min(1000).max(new Date().getFullYear(), "Year is required and should be greater than 1000"),
    isbn: z.string().min(10, "ISBN is required and should be greater than 10"),
    available: z.boolean().default(true)
});

// PUT - схема
export const updateBookSchema = createBookSchema.partial();

// TypeScript типи
export type CreateBookObj = z.infer<typeof createBookSchema>;
export type UpdateBookObj = z.infer<typeof updateBookSchema>;

export type Book = CreateBookObj & {
    id: string;
};
