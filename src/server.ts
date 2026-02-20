import app from './app';
import { loadFromFiles } from './storage';

const PORT = 3000;

async function start(): Promise<void> {
    await loadFromFiles();
    console.log('Data loaded from files');

    app.listen(PORT, () => {
        console.log(`Library API running at http://localhost:${PORT}`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
