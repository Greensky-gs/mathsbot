export enum BattleTimes {
    Classic = 'Classique',
    Rapid = 'Rapide',
    RapidIncrement = 'Rapide avec incrément',
    Prestigious = 'Prestigieux',
    Blitz = 'Blitz',
    BlitzIncrement = 'Blitz incrément',
    BlitzLotIncrement = 'Blitz beaucoup incrément',
    Bullet = 'Bullet',
    BulletIncrement = 'Bullet incrément'
}

export type timeType = {
    time: number;
    increment: number;
    name: string;
};
export const times: Record<BattleTimes, timeType> = {
    Classique: { time: 10, increment: 0, name: 'Classique' },
    Rapide: { time: 10, increment: 1, name: 'Rapide' },
    'Rapide avec incrément': { time: 10, increment: 5, name: 'Rapide avec incrément' },
    Prestigieux: { time: 90, increment: 0, name: 'Prestigieux' },
    Blitz: { time: 3, increment: 0, name: 'Blitz' },
    'Blitz beaucoup incrément': { time: 3, increment: 1, name: "Blitz avec beaucoup d'incrément" },
    'Blitz incrément': { time: 3, increment: 0.5, name: 'Blitz avec incrément' },
    Bullet: { time: 1, increment: 0, name: 'Bullet' },
    'Bullet incrément': { time: 1, increment: 0.1, name: 'Bullet avec incrément' }
};
