import { existsSync, readFileSync, writeFileSync } from 'fs';

export class Database {
    private _cache: Record<string, number> = {};
    constructor() {
        this.start();
    }

    public get leaderboard() {
        return Object.keys(this._cache)
            .map((k) => ({ points: this._cache[k], userId: k }))
            .sort((a, b) => b.points - a.points);
    }
    public get cache() {
        return this._cache;
    }
    public addPoints(userId: string, points: number) {
        if (!this._cache[userId]) this.createFor(userId);

        this._cache[userId] += Math.abs(points);
        this.save();
        return this;
    }

    private createFor(userId: string) {
        this._cache[userId] = 0;
    }

    private save() {
        writeFileSync('./dist/utils/database.json', JSON.stringify(this._cache));
    }

    private start() {
        if (!existsSync('./dist/utils/database.json')) {
            writeFileSync('./dist/utils/database.json', JSON.stringify({}));
        }

        this._cache = JSON.parse(readFileSync('./dist/utils/database.json').toString());
    }
}
