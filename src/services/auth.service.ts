import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../schemas';
import { Prisma } from '../generated/prisma/client';
import { HttpError } from '../lib/httpError';

function generateToken(user: { id: string; email: string; role: string }): string {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions
    );
}

export const authService = {
    async register(data: RegisterInput) {
        const passwordHash = await bcrypt.hash(data.password, 10);

        try {
            const user = await prisma.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    passwordHash,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            });

            const token = generateToken(user);
            return { token, user };
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new HttpError(409, `User with email "${data.email}" already exists`);
            }
            throw err;
        }
    },

    async login(data: LoginInput) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || !user.passwordHash) {
            throw new HttpError(401, 'Invalid email or password');
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);
        if (!isValid) {
            throw new HttpError(401, 'Invalid email or password');
        }

        const token = generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    },

    async googleAuth(profile: { googleId: string; email: string; name: string }) {
        let user = await prisma.user.findUnique({
            where: { googleId: profile.googleId },
        });

        if (!user) {
            user = await prisma.user.findUnique({
                where: { email: profile.email },
            });

            if (user) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: profile.googleId },
                });
            } else {
                user = await prisma.user.create({
                    data: {
                        name: profile.name,
                        email: profile.email,
                        googleId: profile.googleId,
                    },
                });
            }
        }

        const token = generateToken(user);
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    },
};
