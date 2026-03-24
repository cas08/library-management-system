import { env } from './config/env';
import app from './app';
import prisma from './db';

async function start(): Promise<void> {
    await prisma.$connect();
    console.log('Connected to database');

    app.listen(env.PORT, () => {
        console.log(`Library API running at http://localhost:${env.PORT}`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
