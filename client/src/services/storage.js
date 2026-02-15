import { openDB } from 'idb';
import dayjs from 'dayjs';

const DB_NAME = 'logic-looper-db';
const DB_VERSION = 2;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('user_stats')) {
                db.createObjectStore('user_stats', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('daily_activity')) {
                db.createObjectStore('daily_activity', { keyPath: 'date' });
            }
            if (!db.objectStoreNames.contains('achievements')) {
                db.createObjectStore('achievements', { keyPath: 'id' });
            }
        },
    });
};

export const saveUserStats = async (stats) => {
    const db = await initDB();
    return db.put('user_stats', { id: 'current_user', ...stats });
};

export const getUserStats = async () => {
    const db = await initDB();
    return db.get('user_stats', 'current_user');
};

export const saveDailyActivity = async (activity) => {
    const db = await initDB();
    return db.put('daily_activity', activity);
};

export const getDailyActivity = async (date) => {
    const db = await initDB();
    return db.get('daily_activity', date);
};

export const getAllActivity = async () => {
    const db = await initDB();
    const all = await db.getAll('daily_activity');
    // Ensure sorted by date
    return all.sort((a, b) => new Date(a.date) - new Date(b.date));
};

export const calculateStreak = (activityList) => {
    // Expects activityList to be an object map or array. 
    const map = Array.isArray(activityList)
        ? activityList.reduce((acc, curr) => ({ ...acc, [curr.date]: curr }), {})
        : activityList;

    let streak = 0;
    let current = dayjs();

    // If today is not solved yet, check if the streak is alive from yesterday
    if (!map[current.format('YYYY-MM-DD')]?.solved) {
        current = current.subtract(1, 'day');
    }

    // Count backwards
    while (map[current.format('YYYY-MM-DD')]?.solved) {
        streak++;
        current = current.subtract(1, 'day');
    }

    return streak;
};

// --- Sync Features ---

export const getUnsyncedActivity = async () => {
    const db = await initDB();
    const all = await db.getAll('daily_activity');
    return all.filter(act => !act.synced && act.solved);
};

export const markAsSynced = async (dates) => {
    const db = await initDB();
    const tx = db.transaction('daily_activity', 'readwrite');
    const store = tx.objectStore('daily_activity');

    // Process all updates
    for (const date of dates) {
        const item = await store.get(date);
        if (item) {
            item.synced = true;
            await store.put(item);
        }
    }

    await tx.done;
};

export const syncDailyScores = async (userId) => {
    try {
        const unsynced = await getUnsyncedActivity();
        if (unsynced.length === 0) return 0; // Nothing to sync

        const entries = unsynced.map(a => ({
            date: a.date,
            score: a.score,
            timeTaken: a.timeTaken
        }));

        const response = await fetch('http://localhost:3001/sync/daily-scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, entries }),
        });

        if (!response.ok) throw new Error('Sync failed');

        const result = await response.json();

        if (result.success) {
            await markAsSynced(unsynced.map(u => u.date));
            return result.synced;
        }
        return 0;
    } catch (error) {
        console.error('Sync error:', error);
        return 0;
    }
};

// --- Achievements ---

export const saveAchievement = async (badgeId) => {
    const db = await initDB();
    const achievement = {
        id: badgeId,
        date: new Date().toISOString(),
        synced: false
    };
    return db.put('achievements', achievement);
};

export const getAllAchievements = async () => {
    const db = await initDB();
    return db.getAll('achievements');
};
