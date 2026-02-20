import { randomUUID } from 'crypto';
import type { Book, CreateBookObj, UpdateBookObj } from '../schemas';
import { bookStorage, loanStorage } from '../storage';

export const booksService = {
    getAll(): Book[] {
        return bookStorage.getAll();
    },

    getById(id: string): Book | undefined {
        return bookStorage.getById(id);
    },

    async create(data: CreateBookObj): Promise<Book> {
        const existingBooks = bookStorage.getAll();
        const isDuplicateIsbn = existingBooks.some(book => book.isbn === data.isbn);

        if (isDuplicateIsbn) {
            throw new Error(`Book with ISBN "${data.isbn}" already exists`);
        }

        const book: Book = {
            id: randomUUID(),
            ...data,
        };

        bookStorage.create(book);
        await bookStorage.saveToFile();
        return book;
    },

    async update(id: string, data: UpdateBookObj): Promise<Book> {
        const existing = bookStorage.getById(id);

        if (!existing) {
            throw new Error(`Book with id "${id}" not found`);
        }

        if (data.isbn && data.isbn !== existing.isbn) {
            const allBooks = bookStorage.getAll();
            const isDuplicateIsbn = allBooks.some(
                book => book.isbn === data.isbn && book.id !== id
            );
            if (isDuplicateIsbn) {
                throw new Error(`Book with ISBN "${data.isbn}" already exists`);
            }
        }

        const updated: Book = { ...existing, ...data };
        bookStorage.update(id, updated);
        await bookStorage.saveToFile();
        return updated;
    },

    async delete(id: string): Promise<void> {
        const existing = bookStorage.getById(id);

        if (!existing) {
            throw new Error(`Book with id "${id}" not found`);
        }

        const activeLoan = loanStorage.findActiveByBookId(id);
        if (activeLoan) {
            throw new Error(`Book with id "${id}" cannot be deleted while it has an active loan`);
        }

        bookStorage.delete(id);
        await bookStorage.saveToFile();
    },
};
