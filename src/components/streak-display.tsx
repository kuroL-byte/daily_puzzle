"use client";

import { useEffect, useState } from "react";
import { getAllActivity, calculateStreak } from "@/lib/storage";

export default function StreakDisplay() {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const fetchStreak = async () => {
            const activities = await getAllActivity();
            const s = calculateStreak(activities);
            setStreak(s);
        };
        fetchStreak();

        const interval = setInterval(fetchStreak, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center p-6 bg-white border border-gray-100 rounded-[32px] w-36 shadow-[0_16px_32px_-8px_rgba(0,0,0,0.05)] text-center">
            <div className="relative">
                <div className="absolute inset-0 bg-[#F05537] blur-2xl opacity-20" />
                <span className="text-4xl relative">🔥</span>
            </div>
            <span className="text-3xl font-black text-[#222222] mt-2 tracking-tighter tabular-nums">{streak}</span>
            <span className="text-[10px] font-black text-[#414BEA] uppercase tracking-[0.2em] leading-none mt-1">
                Day Streak
            </span>
        </div>
    );
}
