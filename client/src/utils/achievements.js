
export const BADGES = [
    { id: 'streak_7', name: 'Week Warrior', description: 'Reach a 7-day streak', icon: '🔥', condition: (streak) => streak >= 7 },
    { id: 'streak_30', name: 'Monthly Master', description: 'Reach a 30-day streak', icon: '🏆', condition: (streak) => streak >= 30 },
    { id: 'streak_100', name: 'Century Club', description: 'Reach a 100-day streak', icon: '💯', condition: (streak) => streak >= 100 },
    { id: 'perfect_month', name: 'Perfectionist', description: 'Solve a puzzle every day for a calendar month', icon: '📅', condition: (streak, history) => checkPerfectMonth(history) }
];

const checkPerfectMonth = (history) => {
    // Basic implementation: Check if last 30 days are solved?
    // Or strictly a calendar month? 
    // For now, let's keep it simple: strict calendar month perfect?
    // This requires history analysis which might be heavy. 
    // We'll skip complex history checks for this MVP step and focus on streak.
    return false;
};

export const getUnlockedBadges = (streak, history = []) => {
    return BADGES.filter(badge => badge.condition(streak, history));
};
