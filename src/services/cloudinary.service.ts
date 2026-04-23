import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { env } from '../config/env';

let configured = false;

function configure(): void {
    if (configured) return;
    if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
        throw new Error('Cloudinary credentials are not configured');
    }
    cloudinary.config({
        cloud_name: env.CLOUDINARY_CLOUD_NAME,
        api_key: env.CLOUDINARY_API_KEY,
        api_secret: env.CLOUDINARY_API_SECRET,
        secure: true,
    });
    configured = true;
}

export const cloudinaryService = {
    uploadAvatar(buffer: Buffer, publicId: string): Promise<UploadApiResponse> {
        configure();
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: env.CLOUDINARY_FOLDER,
                    public_id: publicId,
                    overwrite: true,
                    resource_type: 'image',
                    transformation: [
                        { width: 512, height: 512, crop: 'fill', gravity: 'face' },
                        { quality: 'auto', fetch_format: 'auto' },
                    ],
                },
                (err, result) => {
                    if (err || !result) return reject(err ?? new Error('Cloudinary upload failed'));
                    resolve(result);
                },
            );
            stream.end(buffer);
        });
    },

    async deleteAvatar(publicId: string): Promise<void> {
        configure();
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
    },
};
