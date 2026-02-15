import { openDB } from 'idb';
import dayjs from 'dayjs';

const DB_NAME = 'logic-looper-db';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('user_stats')) {
                db.createObjectStore('user_stats', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('daily_activity')) {
                // key is date string YYYY-MM-DD
                db.createObjectStore('daily_activity', { keyPath: 'date' });
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
