import { existsSync, readFileSync, writeFileSync } from 'fs';
import { award, awardType } from '../typings/awards';

export class Database {
    private _cache: Record<string, number> = {};
    private _awards: Record<awardType, award | null>;

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
    public get awards() {
        return this._awards;
    }
    public addPoints(userId: string, points: number) {
        if (!this._cache[userId]) this.createFor(userId);

        this._cache[userId] += Math.abs(points);
        this.save();
        return this;
    }

    public getAward(award: awardType) {
        return this._awards[award];
    }
    public setAward(award: awardType, user: string, time: number, amount: number) {
        this._awards[award] = {
            userId: user,
            seconds: time,
            amount
        };
        this.saveAwards();
    }

    private createFor(userId: string) {
        this._cache[userId] = 0;
    }

    private save() {
        writeFileSync('./dist/utils/database.json', JSON.stringify(this._cache));
    }
    private saveAwards() {
        writeFileSync('./dist/utils/awards.json', JSON.stringify(this._awards));
    }

    private start() {
        if (!existsSync('./dist/utils/database.json')) {
            writeFileSync('./dist/utils/database.json', JSON.stringify({}));
        }
        if (!existsSync('./dist/utils/awards.json')) {
            writeFileSync(
                './dist/utils/awards.json',
                JSON.stringify({
                    addition: null,
                    soustraction: null,
                    multiplication: null,
                    division: null
                })
            );
        }

        this._cache = JSON.parse(readFileSync('./dist/utils/database.json').toString());
        this._awards = JSON.parse(readFileSync('./dist/utils/awards.json').toString());
    }
}
