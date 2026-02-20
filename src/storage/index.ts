export * from './base.storage';
export { bookStorage } from './book.storage';
export { userStorage } from './user.storage';
export { loanStorage } from './loan.storage';

import { bookStorage } from './book.storage';
import { userStorage } from './user.storage';
import { loanStorage } from './loan.storage';

export async function loadFromFiles(): Promise<void> {
    await Promise.all([
        bookStorage.loadFromFile(),
        userStorage.loadFromFile(),
        loanStorage.loadFromFile(),
    ]);
}