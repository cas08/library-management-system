import { randomUUID } from 'crypto';
import type { Loan, CreateLoanObj } from '../schemas';
import { bookStorage, loanStorage, userStorage } from '../storage';

export const loansService = {
    getAll(): Loan[] {
        return loanStorage.getAll();
    },

    async create(data: CreateLoanObj): Promise<Loan> {
        const user = userStorage.getById(data.userId);
        if (!user) {
            throw new Error(`User with id "${data.userId}" not found`);
        }

        const book = bookStorage.getById(data.bookId);
        if (!book) {
            throw new Error(`Book with id "${data.bookId}" not found`);
        }

        if (!book.available) {
            throw new Error(`Book with id "${data.bookId}" is not available`);
        }

        const activeLoan = loanStorage.findActiveByBookId(data.bookId);
        if (activeLoan) {
            throw new Error(
                `Book with id "${data.bookId}" already has an active loan`
            );
        }

        const loan: Loan = {
            id: randomUUID(),
            userId: data.userId,
            bookId: data.bookId,
            loanDate: new Date(),
            returnDate: null,
            status: 'ACTIVE',
        };

        loanStorage.create(loan);
        bookStorage.update(data.bookId, { ...book, available: false });

        await Promise.all([
            loanStorage.saveToFile(),
            bookStorage.saveToFile(),
        ]);

        return loan;
    },

    async returnBook(loanId: string): Promise<Loan> {
        const loan = loanStorage.getById(loanId);
        if (!loan) {
            throw new Error(`Loan with id "${loanId}" not found`);
        }

        if (loan.status === 'RETURNED') {
            throw new Error(`Loan with id "${loanId}" is already returned`);
        }

        const updatedLoan: Loan = {
            ...loan,
            returnDate: new Date(),
            status: 'RETURNED',
        };

        loanStorage.update(loanId, updatedLoan);

        const book = bookStorage.getById(loan.bookId);
        if (book) {
            bookStorage.update(loan.bookId, { ...book, available: true });
        }

        await Promise.all([
            loanStorage.saveToFile(),
            bookStorage.saveToFile(),
        ]);

        return updatedLoan;
    },
};
