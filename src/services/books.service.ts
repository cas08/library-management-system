import prisma from '../db';
import type { CreateBookObj, UpdateBookObj } from '../schemas';
import { Prisma } from '../generated/prisma/client';
import { HttpError } from '../lib/httpError';

export const booksService = {
    async getAll() {
        return prisma.book.findMany();
    },

    async getById(id: string) {
        return prisma.book.findUnique({ where: { id } });
    },

    async create(data: CreateBookObj) {
        try {
            return await prisma.book.create({ data });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new HttpError(409, `Book with ISBN "${data.isbn}" already exists`);
            }
            throw err;
        }
    },

    async update(id: string, data: UpdateBookObj) {
        const existing = await prisma.book.findUnique({ where: { id } });
        if (!existing) {
            throw new HttpError(404, `Book with id "${id}" not found`);
        }

        try {
            return await prisma.book.update({ where: { id }, data });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new HttpError(409, `Book with ISBN "${data.isbn}" already exists`);
            }
            throw err;
        }
    },

    async delete(id: string) {
        const existing = await prisma.book.findUnique({ where: { id } });
        if (!existing) {
            throw new HttpError(404, `Book with id "${id}" not found`);
        }

        const activeLoan = await prisma.loan.findFirst({
            where: { bookId: id, status: 'ACTIVE' },
        });
        if (activeLoan) {
            throw new HttpError(409, `Book with id "${id}" cannot be deleted while it has an active loan`);
        }

        await prisma.loan.deleteMany({ where: { bookId: id } });
        await prisma.book.delete({ where: { id } });
    },
};
