import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const StreakCounter = () => {
    const { stats } = useSelector((state) => state.user);

    return (
        <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700 shadow-md">
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl"
            >
                🔥
            </motion.div>
            <div className="flex flex-col leading-none">
                <span className="text-xl font-bold text-orange-400">{stats?.streak || 0}</span>
                <span className="text-xs text-gray-400 font-medium">DAY STREAK</span>
            </div>
        </div>
    );
};

export default StreakCounter;
