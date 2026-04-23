import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../config/env';

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
    if (cachedTransporter) return cachedTransporter;

    if (!env.SMTP_HOST || !env.SMTP_AUTH_USER || !env.SMTP_AUTH_PASS) {
        throw new Error('SMTP is not configured: set SMTP_HOST, SMTP_AUTH_USER, SMTP_AUTH_PASS');
    }

    cachedTransporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
            user: env.SMTP_AUTH_USER,
            pass: env.SMTP_AUTH_PASS,
        },
    });
    return cachedTransporter;
}

interface MailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

export async function sendMail(opts: MailOptions): Promise<void> {
    const transporter = getTransporter();
    await transporter.sendMail({
        from: env.SENDER_EMAIL,
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        html: opts.html,
    });
}
