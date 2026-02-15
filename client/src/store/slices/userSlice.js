import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUserStats, saveUserStats, getAllActivity, calculateStreak, syncDailyScores } from '../../services/storage';
import dayjs from 'dayjs';

// Async thunk to load user stats from IndexedDB
export const loadUserStats = createAsyncThunk(
    'user/loadStats',
    async (_, { rejectWithValue }) => {
        try {
            const [stats, activities] = await Promise.all([
                getUserStats(),
                getAllActivity()
            ]);

            // Attempt background sync if we have a user stats object (implying strict user identity or just anonymous ID)
            // For now, we sync if stats exist.
            if (stats?.id) {
                syncDailyScores(stats.id).then(count => {
                    if (count > 0) console.log('Synced entries:', count);
                }).catch(err => console.error(err));
            }

            const currentStreak = calculateStreak(activities);

            // Check if lastPlayed needs update
            const lastActivity = activities.length > 0 ? activities[activities.length - 1] : null;

            return {
                ...(stats || {}),
                streak: currentStreak,
                lastPlayed: lastActivity ? lastActivity.date : (stats?.lastPlayed || null),
                totalPoints: stats?.totalPoints || 0
            };
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    user: null, // For auth later
    isAuthenticated: false,
    stats: {
        streak: 0,
        lastPlayed: null, // ISO string
        totalPoints: 0,
    },
    loading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        updateStreak: (state, action) => {
            // payload: { date: YYYY-MM-DD }
            const today = action.payload.date;
            const lastPlayed = state.stats.lastPlayed ? dayjs(state.stats.lastPlayed).format('YYYY-MM-DD') : null;

            if (lastPlayed === today) return; // Already played today

            const yesterday = dayjs(today).subtract(1, 'day').format('YYYY-MM-DD');

            if (lastPlayed === yesterday) {
                state.stats.streak += 1;
            } else {
                // If it's the first time ever playing (lastPlayed is null) or streak broke
                // If lastPlayed is null, streak becomes 1.
                // If streak broke, streak becomes 1.
                state.stats.streak = 1;
            }

            state.stats.lastPlayed = new Date().toISOString();
            saveUserStats(state.stats);
        },
        addPoints: (state, action) => {
            state.stats.totalPoints += action.payload;
            saveUserStats(state.stats);
        },
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUserStats.pending, (state) => {
                state.loading = true;
            })
            .addCase(loadUserStats.fulfilled, (state, action) => {
                state.loading = false;
                // Merge stats if they exist
                if (action.payload) {
                    state.stats = { ...state.stats, ...action.payload };
                }
            })
            .addCase(loadUserStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setUser, updateStreak, addPoints, logout } = userSlice.actions;
export default userSlice.reducer;
