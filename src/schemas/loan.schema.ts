import { z } from 'zod';

export const loanStatusEnum = z.enum(['ACTIVE', 'RETURNED']);
export type LoanStatus = z.infer<typeof loanStatusEnum>;

export const createLoanSchema = z.object({
    userId: z.string().min(1, 'userId is required'),
    bookId: z.string().min(1, 'bookId is required'),
});

export type CreateLoanObj = z.infer<typeof createLoanSchema>;

export type Loan = {
    id: string;
    userId: string;
    bookId: string;
    loanDate: Date;
    returnDate: Date | null;
    status: LoanStatus;
};
