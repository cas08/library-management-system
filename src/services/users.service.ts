import prisma from '../db';

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const usersService = {
    async getAll() {
        return prisma.user.findMany({ select: userSelect });
    },

    async getById(id: string) {
        return prisma.user.findUnique({ where: { id }, select: userSelect });
    },
};
