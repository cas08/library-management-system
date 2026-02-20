import type { User } from '../schemas';
import { BaseStorage } from './base.storage';

class UserStorage extends BaseStorage<User> {
    constructor() {
        super('users.json');
    }
}

export const userStorage = new UserStorage();