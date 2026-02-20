import { z } from 'zod';

export const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.email('Invalid email'),
});

export type CreateUserObj = z.infer<typeof createUserSchema>;

export type User = CreateUserObj & {
    id: string;
};
