import { existsSync, readFileSync, writeFileSync } from "fs";

export class Database {
    private _cache: Record<string, { played: number; succeeded: number; failed: number; }> = {};
    constructor() {
        this.start();
    }

    public addStart(userId: string) {
        if (!this._cache[userId]) this.createFor(userId);

        this._cache[userId].played++;

        this.save();
        return this;
    }
    public addWin(userId: string) {
        if (!this._cache[userId]) this.createFor(userId);

        this._cache[userId].succeeded++;

        this.save();
        return this;
    }
    public addLoose(userId: string) {
        if (!this._cache[userId]) this.createFor(userId);

        this._cache[userId].failed++;

        this.save();
        return this;
    }
    public get leaderboard() {
        return Object.keys(this._cache).map((k) => ({ ...this._cache[k], userId: k })).sort((a, b) => (a.succeeded / a.played) - (b.succeeded / b.played));
    }
    public get cache() {
        return this._cache;
    }

    private createFor(userId: string) {
        this._cache[userId] = { played: 0, succeeded: 0, failed: 0 }
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