import multer, { type FileFilterCallback } from 'multer';
import type { Request, Response, NextFunction } from 'express';
import { HttpError } from '../lib/httpError';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png']);
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const storage = multer.memoryStorage();

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void {
    if (!ALLOWED_MIME.has(file.mimetype)) {
        cb(new HttpError(400, 'Only JPEG or PNG images are allowed'));
        return;
    }
    cb(null, true);
}

const uploadAvatarSingle = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE, files: 1 },
}).single('avatar');

export function uploadAvatar(req: Request, res: Response, next: NextFunction): void {
    uploadAvatarSingle(req, res, (err: unknown) => {
        if (!err) return next();
        if (err instanceof HttpError) {
            res.status(err.status).json({ error: err.message });
            return;
        }
        if (err instanceof multer.MulterError) {
            const message =
                err.code === 'LIMIT_FILE_SIZE'
                    ? 'Avatar file must be 5 MB or less'
                    : err.message;
            res.status(400).json({ error: message });
            return;
        }
        next(err);
    });
}
