import { randomUUID } from 'crypto';
import type { User, CreateUserObj } from '../schemas';
import { userStorage } from '../storage';

export const usersService = {
    getAll(): User[] {
        return userStorage.getAll();
    },

    getById(id: string): User | undefined {
        return userStorage.getById(id);
    },

    async create(data: CreateUserObj): Promise<User> {
        const existingUsers = userStorage.getAll();
        const isDuplicateEmail = existingUsers.some(
            user => user.email === data.email
        );

        if (isDuplicateEmail) {
            throw new Error(`User with email "${data.email}" already exists`);
        }

        const user: User = {
            id: randomUUID(),
            ...data,
        };

        userStorage.create(user);
        await userStorage.saveToFile();
        return user;
    },
};
