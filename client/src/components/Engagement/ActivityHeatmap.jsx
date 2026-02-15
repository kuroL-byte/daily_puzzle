import React, { useEffect, useState, useMemo, memo } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllActivity } from '../../services/storage';

// Intensity levels mapped to Tailwind green shades (optimized for dark mode)
const INTENSITY_MAP = {
    0: 'bg-gray-800',       // Not played
    1: 'bg-green-900',      // Solved Easy
    2: 'bg-green-700',      // Solved Medium
    3: 'bg-green-500',      // Solved Hard
    4: 'bg-green-300',      // Score >= 150
};

const Tooltip = ({ data, position }) => {
    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ top: position.y - 80, left: position.x - 60 }}
            className="fixed z-50 px-3 py-2 bg-gray-900 text-white text-[10px] rounded border border-gray-700 pointer-events-none shadow-2xl w-32"
        >
            <div className="font-bold text-gray-400 mb-1">{dayjs(data.date).format('MMM D, YYYY')}</div>
            {data.solved ? (
                <div className="space-y-1">
                    <div className="flex justify-between"><span>Score:</span> <span className="text-green-400 font-bold">{data.score}</span></div>
                    <div className="flex justify-between"><span>Time:</span> <span>{data.timeTaken}s</span></div>
                    <div className="flex justify-between"><span>Diff:</span> <span>{data.difficulty === 1 ? 'Easy' : data.difficulty === 2 ? 'Med' : 'Hard'}</span></div>
                </div>
            ) : (
                <div className="text-gray-500 italic">No activity</div>
            )}
        </motion.div>
    );
};

// React.memo for individual cells to avoid redundant renders
const HeatmapCell = memo(({ date, activity, onHover, onLeave, placeholder }) => {
    if (placeholder) {
        return <div className="w-3 h-3 bg-transparent" />; // Gap filler for start of year
    }

    let intensity = 0;
    if (activity?.solved) {
        if (activity.score >= 150) intensity = 4;
        else if (activity.difficulty >= 3) intensity = 3;
        else if (activity.difficulty >= 2) intensity = 2;
        else intensity = 1;
    }

    const handleMouseEnter = (e) => {
        const rect = e.target.getBoundingClientRect();
        onHover({
            ...activity,
            date: date,
            solved: !!activity?.solved
        }, { x: rect.left + rect.width / 2, y: rect.top });
    };

    return (
        <motion.div
            whileHover={{ scale: 1.3, zIndex: 10 }}
            className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[intensity]} border border-white/5 transition-colors cursor-crosshair`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onLeave}
        />
    );
});

const ActivityHeatmap = () => {
    const [activityMap, setActivityMap] = useState({});
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchActivity = async () => {
            const activities = await getAllActivity();
            const map = activities.reduce((acc, act) => ({ ...acc, [act.date]: act }), {});
            setActivityMap(map);
        };
        fetchActivity();
    }, []);

    // Generate grid: 7 rows (Sun-Sat), columns as weeks
    const gridData = useMemo(() => {
        const startOfYear = dayjs().startOf('year');
        const todayStr = dayjs().format('YYYY-MM-DD');

        const weeks = [];
        let currentWeek = [];

        // Pad the first week if Jan 1 isn't Sunday (day 0)
        const startDayOfWeek = startOfYear.day();
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push({ placeholder: true });
        }

        let tempDay = startOfYear;
        // Generate up to today
        const daysToGenerate = dayjs().diff(startOfYear, 'day') + 1;

        for (let i = 0; i < daysToGenerate; i++) {
            const dateStr = tempDay.format('YYYY-MM-DD');
            currentWeek.push({ date: dateStr, activity: activityMap[dateStr] });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
            tempDay = tempDay.add(1, 'day');
        }

        // Fill current partial week with placeholders to maintain 7-row structure
        if (currentWeek.length > 0) {
            while (currentWeek.length < 7) {
                currentWeek.push({ placeholder: true });
            }
            weeks.push(currentWeek);
        }

        return weeks;
    }, [activityMap]);

    return (
        <div className="mt-8 p-6 bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-2xl overflow-x-auto selection:bg-none">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-black text-gray-200 flex items-center gap-2 tracking-tight">
                        <span className="text-green-500">■</span> ACTIVITY HEATMAP
                    </h3>
                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mt-1">
                        Yearly Puzzle Completion Status
                    </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
                    <span>Less</span>
                    {[0, 1, 2, 3, 4].map(v => (
                        <div key={v} className={`w-2.5 h-2.5 rounded-sm ${INTENSITY_MAP[v]}`} />
                    ))}
                    <span>More</span>
                </div>
            </div>

            <div className="relative">
                <div className="flex gap-1.5 min-w-max pb-4">
                    {/* Render weeks as vertical columns */}
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

            <div className="mt-2 flex gap-4 text-[10px] text-gray-600 font-mono uppercase tracking-tighter italic">
                <span className="w-8">Sun</span>
                <span className="w-8 text-center">—</span>
                <span className="w-8 text-right">Sat</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
