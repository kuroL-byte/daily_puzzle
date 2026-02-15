import { openDB, IDBPDatabase } from 'idb';
import dayjs from 'dayjs';

const DB_NAME = 'daily-puzzle-db';
const DB_VERSION = 1;

export interface DailyActivity {
    date: string; // YYYY-MM-DD
    solved: boolean;
    score: number;
    timeTaken: number;
    difficulty: number;
    synced: boolean;
}

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('daily_activity')) {
                db.createObjectStore('daily_activity', { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains('user_stats')) {
                db.createObjectStore('user_stats', { keyPath: 'id' });
            }
        },
    });
};

export const saveDailyActivity = async (activity: Omit<DailyActivity, 'synced'> & { synced?: boolean }) => {
    const db = await initDB();
    const data = { ...activity, synced: activity.synced || false };
    await db.put('daily_activity', data);
    return data;
};

export const getAllActivity = async (): Promise<DailyActivity[]> => {
    const db = await initDB();
    const all = await db.getAll('daily_activity');
    return all.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
};

export const calculateStreak = (activities: DailyActivity[]): number => {
    const map = activities.reduce((acc, curr) => ({ ...acc, [curr.date]: curr }), {} as Record<string, DailyActivity>);

    let streak = 0;
    let current = dayjs();

    // Requirement: Start from today. If not solved -> fallback to yesterday.
    if (!map[current.format('YYYY-MM-DD')]?.solved) {
        current = current.subtract(1, 'day');
    }

    while (map[current.format('YYYY-MM-DD')]?.solved) {
        streak++;
        current = current.subtract(1, 'day');
    }

    return streak;
};

export const getUnsyncedActivity = async (): Promise<DailyActivity[]> => {
    const db = await initDB();
    const all = await db.getAll('daily_activity');
    return all.filter(act => !act.synced && act.solved);
};

export const markAsSynced = async (dates: string[]) => {
    const db = await initDB();
    const tx = db.transaction('daily_activity', 'readwrite');
    const store = tx.objectStore('daily_activity');

    for (const date of dates) {
        const item = await store.get(date);
        if (item) {
            item.synced = true;
            await store.put(item);
        }
    }
    await tx.done;
};
