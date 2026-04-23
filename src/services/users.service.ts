import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import prisma from '../db';
import { env } from '../config/env';
import { HttpError } from '../lib/httpError';
import { cloudinaryService } from './cloudinary.service';

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    avatarUrl: true,
    createdAt: true,
    updatedAt: true,
} as const;

const AVATARS_DIR = path.resolve(process.cwd(), 'src/uploads/avatars');
const AVATARS_URL_PREFIX = '/uploads/avatars';

async function ensureAvatarsDir(): Promise<void> {
    await fs.mkdir(AVATARS_DIR, { recursive: true });
}

async function removeLocalAvatarIfExists(avatarUrl: string | null): Promise<void> {
    if (!avatarUrl || !avatarUrl.startsWith(AVATARS_URL_PREFIX)) return;
    const fileName = path.basename(avatarUrl);
    const filePath = path.join(AVATARS_DIR, fileName);
    try {
        await fs.unlink(filePath);
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error('[users] Failed to remove old avatar:', err);
        }
    }
}

export const usersService = {
    async getAll() {
        return prisma.user.findMany({ select: userSelect });
    },

    async getById(id: string) {
        return prisma.user.findUnique({ where: { id }, select: userSelect });
    },

    async uploadAvatar(userId: string, file: Express.Multer.File) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, avatarUrl: true, avatarPublicId: true },
        });
        if (!user) throw new HttpError(404, 'User not found');

        const processed = await sharp(file.buffer)
            .rotate()
            .resize(512, 512, { fit: 'cover', position: 'attention' })
            .jpeg({ quality: 85 })
            .toBuffer();

        let avatarUrl: string;
        let avatarPublicId: string | null = null;

        if (env.STORAGE_DRIVER === 'cloudinary') {
            const publicId = `${userId}-${Date.now()}`;
            const result = await cloudinaryService.uploadAvatar(processed, publicId);
            avatarUrl = result.secure_url;
            avatarPublicId = result.public_id;

            if (user.avatarPublicId && user.avatarPublicId !== avatarPublicId) {
                try {
                    await cloudinaryService.deleteAvatar(user.avatarPublicId);
                } catch (err) {
                    console.error('[users] Failed to delete old Cloudinary avatar:', err);
                }
            }
        } else {
            await ensureAvatarsDir();
            const fileName = `${userId}-${crypto.randomUUID()}.jpg`;
            const filePath = path.join(AVATARS_DIR, fileName);
            await fs.writeFile(filePath, processed);
            avatarUrl = `${AVATARS_URL_PREFIX}/${fileName}`;

            await removeLocalAvatarIfExists(user.avatarUrl);
            if (user.avatarPublicId) {
                try {
                    await cloudinaryService.deleteAvatar(user.avatarPublicId);
                } catch (err) {
                    console.error('[users] Failed to delete old Cloudinary avatar:', err);
                }
            }
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl, avatarPublicId },
            select: userSelect,
        });

        return { user: updated, avatarUrl };
    },

    async deleteAvatar(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { avatarUrl: true, avatarPublicId: true },
        });
        if (!user) throw new HttpError(404, 'User not found');
        if (!user.avatarUrl) throw new HttpError(404, 'Avatar not found');

        if (user.avatarPublicId) {
            await cloudinaryService.deleteAvatar(user.avatarPublicId);
        }
        await removeLocalAvatarIfExists(user.avatarUrl);

        await prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: null, avatarPublicId: null },
        });
    },
};
