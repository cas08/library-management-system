import { readFile } from 'fs/promises';
import { join } from 'path';
import type { Loan } from '../schemas';
import { BaseStorage } from './base.storage';

class LoanStorage extends BaseStorage<Loan> {
    constructor() {
        super('loans.json');
    }

    async loadFromFile(): Promise<void> {
        try {
            const data = await readFile(
                join(import.meta.dirname, '/data', 'loans.json'),
                'utf-8'
            );

            const parsed: Loan[] = JSON.parse(data);

            parsed.forEach(loan => {
                loan.loanDate = new Date(loan.loanDate);
                loan.returnDate = loan.returnDate ? new Date(loan.returnDate) : null;
                this.items.set(loan.id, loan);
            });
        } catch (error) {
            console.error(error);
        }
    }

    findActiveByBookId(bookId: string): Loan | undefined {
        return this.getAll().find(
            loan => loan.bookId === bookId && loan.status === 'ACTIVE'
        );
    }
}

export const loanStorage = new LoanStorage();