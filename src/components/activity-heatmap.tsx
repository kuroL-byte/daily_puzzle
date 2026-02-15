"use client";

import React, { useEffect, useState, useMemo, memo } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { getAllActivity, DailyActivity } from "@/lib/storage";

const INTENSITY_MAP: Record<number, string> = {
    0: "bg-gray-100", // No activity
    1: "bg-[#D9E2FF]", // Light Blue Tint
    2: "bg-[#7752FE]", // Purple Tint
    3: "bg-[#414BEA]", // Primary Brand Blue
    4: "bg-[#190482]", // Deep Navy
};

const Tooltip = ({ data, position }: { data: DailyActivity & { date: string }; position: { x: number; y: number } }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ top: position.y - 80, left: position.x - 60 }}
            className="fixed z-50 px-3 py-2 bg-[#222222] text-white text-[10px] rounded shadow-2xl w-32 font-sans border border-gray-700 pointer-events-none"
        >
            <div className="font-bold text-gray-400 mb-1">{dayjs(data.date).format("MMM D, YYYY")}</div>
            {data.solved ? (
                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span>Score:</span> <span className="text-white font-bold">{data.score}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Time:</span> <span>{data.timeTaken}s</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="opacity-60 text-[8px] uppercase tracking-tighter">Intensity</span>
                        <div className={`w-2 h-2 rounded-full ${INTENSITY_MAP[data.difficulty || 1]}`} />
                    </div>
                </div>
            ) : (
                <div className="text-gray-500 italic">No activity</div>
            )}
        </motion.div>
    );
};

const HeatmapCell = memo(
    ({
        date,
        activity,
        onHover,
        onLeave,
        placeholder,
    }: {
        date?: string;
        activity?: DailyActivity;
        onHover: (data: any, pos: any) => void;
        onLeave: () => void;
        placeholder?: boolean;
    }) => {
        if (placeholder) {
            return <div className="w-3.5 h-3.5 bg-transparent" />;
        }

        let intensity = 0;
        if (activity?.solved) {
            if (activity.score >= 150) intensity = 4;
            else if (activity.difficulty >= 3) intensity = 3;
            else if (activity.difficulty >= 2) intensity = 2;
            else intensity = 1;
        }

        const handleMouseEnter = (e: React.MouseEvent) => {
            const rect = (e.target as HTMLElement).getBoundingClientRect();
            onHover(
                {
                    ...activity,
                    date: date,
                    solved: !!activity?.solved,
                },
                { x: rect.left + rect.width / 2, y: rect.top }
            );
        };

        return (
            <motion.div
                whileHover={{ scale: 1.3, zIndex: 10 }}
                className={`w-3.5 h-3.5 rounded-sm ${INTENSITY_MAP[intensity]} border border-black/5 transition-colors cursor-crosshair`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={onLeave}
            />
        );
    }
);

HeatmapCell.displayName = "HeatmapCell";

export default function ActivityHeatmap() {
    const [activityMap, setActivityMap] = useState<Record<string, DailyActivity>>({});
    const [tooltipData, setTooltipData] = useState<any>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchActivity = async () => {
            const activities = await getAllActivity();
            const map = activities.reduce((acc, act) => ({ ...acc, [act.date]: act }), {});
            setActivityMap(map);
        };
        fetchActivity();
    }, []);

    const gridData = useMemo(() => {
        const startOfYear = dayjs().startOf("year");
        const today = dayjs();
        const weeks = [];
        let currentWeek = [];

        const startDayOfWeek = startOfYear.day();
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push({ placeholder: true });
        }

        let tempDay = startOfYear;
        const daysToGenerate = today.diff(startOfYear, "day") + 1;

        for (let i = 0; i < daysToGenerate; i++) {
            const dateStr = tempDay.format("YYYY-MM-DD");
            currentWeek.push({ date: dateStr, activity: activityMap[dateStr] });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            tempDay = tempDay.add(1, "day");
        }

        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ placeholder: true });
            }
            weeks.push(currentWeek);
        }

        return weeks;
    }, [activityMap]);

    return (
        <div className="mt-8 p-10 bg-white rounded-[40px] border border-gray-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] overflow-x-auto selection:bg-[#414BEA]/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-1 bg-[#414BEA] rounded-full" />
                        <span className="text-[10px] font-black text-[#414BEA] uppercase tracking-[0.3em]">Market Pulse</span>
                    </div>
                    <h3 className="text-2xl font-black text-[#222222] tracking-tight">
                        Activity Heatmap
                    </h3>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                        Visualizing your consistency in the Bluestock trading community.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-[8px] text-gray-400 font-black uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <span>Cold</span>
                    <div className="flex gap-1">
                        {[0, 1, 2, 3, 4].map((v) => (
                            <div key={v} className={`w-2.5 h-2.5 rounded-sm ${INTENSITY_MAP[v]}`} />
                        ))}
                    </div>
                    <span>Active</span>
                </div>
            </div>

            <div className="relative">
                <div className="flex gap-1.5 min-w-max pb-4">
                    {gridData.map((week, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-1.5">
                            {week.map((day, dayIndex) => (
                                <HeatmapCell
                                    key={day.placeholder ? `p-${weekIndex}-${dayIndex}` : day.date}
                                    date={day.date}
                                    activity={day.activity}
                                    placeholder={day.placeholder}
                                    onHover={(data, pos) => {
                                        setTooltipData(data);
                                        setTooltipPos(pos);
                                    }}
                                    onLeave={() => setTooltipData(null)}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <AnimatePresence>
                    {tooltipData && <Tooltip data={tooltipData} position={tooltipPos} />}
                </AnimatePresence>
            </div>

            <div className="mt-6 flex justify-between items-center text-[10px] text-gray-300 font-black uppercase tracking-[0.2em] px-1">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
            </div>
        </div>
    );
}
