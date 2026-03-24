import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '../generated/prisma/client';

interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid authorization header' });
        return;
    }

    const token = header.slice(7);

    try {
        const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
        req.user = {
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        };
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
