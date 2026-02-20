import type { Book } from '../schemas';
import { BaseStorage } from './base.storage';

class BookStorage extends BaseStorage<Book> {
    constructor() {
        super('books.json');
    }
}

export const bookStorage = new BookStorage();