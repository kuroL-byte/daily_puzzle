"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { Lock, Unlock, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import PuzzleBoard from "./puzzle-board";
import { getAllActivity, DailyActivity } from "@/lib/storage";

export default function DailyDashboard() {
    const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [activities, setActivities] = useState<Record<string, DailyActivity>>({});
    const today = dayjs().format("YYYY-MM-DD");

    useEffect(() => {
        const fetchActivities = async () => {
            const all = await getAllActivity();
            const map = all.reduce((acc, act) => ({ ...acc, [act.date]: act }), {});
            setActivities(map);
        };
        fetchActivities();
    }, []);

    const isLocked = dayjs(selectedDate).isAfter(dayjs(), 'day');
    const isPast = dayjs(selectedDate).isBefore(dayjs(), 'day');
    const isCompleted = activities[selectedDate]?.solved;

    const handleDateChange = (offset: number) => {
        const newDate = dayjs(selectedDate).add(offset, 'day').format("YYYY-MM-DD");
        // Don't allow navigating to future beyond today for playing?
        // Actually, user spec says "Past days visible but locked (if not completed)".
        // Let's allow navigation but show lock state.
        setSelectedDate(newDate);
    };

    return (
        <div className="w-full flex flex-col items-center gap-12">
            {/* Date Navigator */}
            <div className="flex items-center gap-6 bg-white px-8 py-4 rounded-3xl border border-gray-100 shadow-sm">
                <button
                    onClick={() => handleDateChange(-1)}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#414BEA]"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="flex flex-col items-center min-w-[120px]">
                    <span className="text-[10px] font-black text-[#414BEA] uppercase tracking-[0.2em] mb-1">
                        {isLocked ? "Future Locked" : isCompleted ? "Completed" : isPast ? "Expired" : "Active Now"}
                    </span>
                    <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-300" />
                        <span className="text-sm font-black text-[#222222]">
                            {dayjs(selectedDate).format("DD MMMM YYYY")}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => handleDateChange(1)}
                    disabled={dayjs(selectedDate).isSame(dayjs().add(7, 'day'), 'day')}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#414BEA] disabled:opacity-30"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="relative w-full flex justify-center">
                {isLocked ? (
                    <div className="w-full max-w-md p-12 bg-white/50 backdrop-blur-md border-2 border-dashed border-gray-200 rounded-[40px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-400">
                            <Lock size={32} />
                        </div>
                        <h4 className="text-xl font-black text-gray-400 uppercase tracking-tighter">Market Closed</h4>
                        <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest leading-relaxed">
                            This puzzle will unlock in <br />
                            <span className="text-[#414BEA]">{dayjs(selectedDate).diff(dayjs(), 'hour')} hours</span>
                        </p>
                    </div>
                ) : isPast && !isCompleted ? (
                    <div className="w-full max-w-md p-12 bg-white/50 backdrop-blur-md border-2 border-dashed border-red-100 rounded-[40px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-300">
                            <Lock size={32} />
                        </div>
                        <h4 className="text-xl font-black text-red-300 uppercase tracking-tighter">Opportunity Missed</h4>
                        <p className="text-xs text-red-300 font-bold mt-2 uppercase tracking-widest leading-relaxed">
                            Historical puzzles cannot be solved <br /> for streak points.
                        </p>
                        <button
                            onClick={() => setSelectedDate(today)}
                            className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                            Back to Today
                        </button>
                    </div>
                ) : (
                    <PuzzleBoard key={selectedDate} date={selectedDate} />
                )}
            </div>
        </div>
    );
}
