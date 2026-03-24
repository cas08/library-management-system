import type { Role } from '../generated/prisma/client';

declare global {
    namespace Express {
        interface User {
            userId: string;
            email: string;
            role: Role;
            token?: string;
        }
    }
}
