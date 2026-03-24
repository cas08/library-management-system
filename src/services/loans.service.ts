import prisma from '../db';
import { HttpError } from '../lib/httpError';

export const loansService = {
    async getAll() {
        return prisma.loan.findMany();
    },

    async getByUserId(userId: string) {
        return prisma.loan.findMany({ where: { userId } });
    },

    async create(data: { userId: string; bookId: string }) {
        return prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id: data.userId } });
            if (!user) {
                throw new HttpError(404, `User with id "${data.userId}" not found`);
            }

            const book = await tx.book.findUnique({ where: { id: data.bookId } });
            if (!book) {
                throw new HttpError(404, `Book with id "${data.bookId}" not found`);
            }

            const activeLoan = await tx.loan.findFirst({
                where: { bookId: data.bookId, status: 'ACTIVE' },
            });
            if (activeLoan) {
                throw new HttpError(409, `Book with id "${data.bookId}" is already issued`);
            }

            if (!book.available) {
                throw new HttpError(422, `Book with id "${data.bookId}" is not available`);
            }

            const loan = await tx.loan.create({
                data: {
                    userId: data.userId,
                    bookId: data.bookId,
                },
            });

            await tx.book.update({
                where: { id: data.bookId },
                data: { available: false },
            });

            return loan;
        });
    },

    async returnBook(loanId: string, requestingUserId: string, requestingUserRole: string) {
        return prisma.$transaction(async (tx) => {
            const loan = await tx.loan.findUnique({ where: { id: loanId } });
            if (!loan) {
                throw new HttpError(404, `Loan with id "${loanId}" not found`);
            }

            if (requestingUserRole !== 'ADMIN' && loan.userId !== requestingUserId) {
                throw new HttpError(403, 'Forbidden: you can only return your own loans');
            }

            if (loan.status === 'RETURNED') {
                throw new HttpError(409, `Loan with id "${loanId}" is already returned`);
            }

            const updatedLoan = await tx.loan.update({
                where: { id: loanId },
                data: {
                    status: 'RETURNED',
                    returnDate: new Date(),
                },
            });

            await tx.book.update({
                where: { id: loan.bookId },
                data: { available: true },
            });

            return updatedLoan;
        });
    },
};
