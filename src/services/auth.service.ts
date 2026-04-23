import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import prisma from '../db';
import { env } from '../config/env';
import type { RegisterInput, LoginInput } from '../schemas';
import { Prisma, type Role } from '../generated/prisma/client';
import { HttpError } from '../lib/httpError';
import { sendMail } from '../utils/sendMail';
import { escapeHtml } from '../lib/escapeHtml';

const SALT_ROUNDS = 10;

interface TokenUser {
    id: string;
    email: string;
    role: Role;
}

interface AuthResult {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
    };
}

function hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken(user: TokenUser): string {
    return jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions,
    );
}

export const authService = {
    async register(data: RegisterInput): Promise<AuthResult> {
        const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

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

            return { token: generateToken(user), user };
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                throw new HttpError(409, `User with email "${data.email}" already exists`);
            }
            throw err;
        }
    },

    async login(data: LoginInput): Promise<AuthResult> {
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

        return {
            token: generateToken(user),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    },

    async requestPasswordReset(email: string): Promise<void> {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return;

        const rawToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = hashToken(rawToken);
        const resetTokenExpires = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MIN * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: { resetTokenHash, resetTokenExpires },
        });

        const resetUrl = `${env.FRONTEND_URL}/?reset=${rawToken}`;
        const safeName = escapeHtml(user.name);
        const safeUrl = escapeHtml(resetUrl);
        const subject = 'Password reset request';
        const text =
            `Hi ${user.name},\n\n` +
            `We received a request to reset your password.\n` +
            `Use the link below within ${env.PASSWORD_RESET_TOKEN_TTL_MIN} minutes:\n\n` +
            `${resetUrl}\n\n` +
            `If you did not request this, you can ignore this email.`;
        const html =
            `<p>Hi ${safeName},</p>` +
            `<p>We received a request to reset your password. ` +
            `This link is valid for ${env.PASSWORD_RESET_TOKEN_TTL_MIN} minutes:</p>` +
            `<p><a href="${safeUrl}">${safeUrl}</a></p>` +
            `<p>If you did not request this, you can ignore this email.</p>`;

        try {
            await sendMail({ to: user.email, subject, text, html });
        } catch (err) {
            console.error('[auth] Failed to send password reset email:', err);
        }
    },

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const resetTokenHash = hashToken(token);
        const user = await prisma.user.findUnique({ where: { resetTokenHash } });

        if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
            throw new HttpError(400, 'Invalid or expired reset token');
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash,
                resetTokenHash: null,
                resetTokenExpires: null,
            },
        });
    },

    async googleAuth(profile: { googleId: string; email: string; name: string }): Promise<AuthResult> {
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

        return {
            token: generateToken(user),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    },
};
