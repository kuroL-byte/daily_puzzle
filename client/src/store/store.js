import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import puzzleReducer from './slices/puzzleSlice';

export const store = configureStore({
    reducer: {
        user: userReducer,
        puzzle: puzzleReducer,
    },
});
