import * as fsPromises from "node:fs/promises";
import path from 'path';

export abstract class BaseStorage<T extends { id: string }> {
    protected items = new Map<string, T>();
    private readonly filePath: string;

    protected constructor(fileName: string) {
        this.filePath = path.join(import.meta.dirname, '/data', fileName);
    }

    getAll(): T[] {
        return Array.from(this.items.values());
    }

    getById(id: string): T | undefined {
        return this.items.get(id);
    }

    create(item: T): void {
        this.items.set(item.id, item);
    }

    update(id: string, item: T): void {
        this.items.set(id, item);
    }

    delete(id: string): void {
        this.items.delete(id);
    }

    async saveToFile(): Promise<void> {
        const data = JSON.stringify(this.getAll(), null, 2);
        await fsPromises.writeFile(this.filePath, data);
    }

    async loadFromFile(): Promise<void> {
        try {
            const data = await fsPromises.readFile(this.filePath, 'utf-8');
            const parsed: T[] = JSON.parse(data);

            parsed.forEach(item => {
                this.items.set(item.id, item);
            });
        } catch (error) {
            console.error(error);
        }
    }
}