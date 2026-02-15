import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllActivity } from '../../services/storage';

// Intensity levels for Dark Mode
const INTENSITY_MAP = {
    0: 'bg-gray-800',       // Not played
    1: 'bg-emerald-900',    // Solved Easy
    2: 'bg-emerald-700',    // Solved Medium
    3: 'bg-emerald-500',    // Solved Hard
    4: 'bg-emerald-300',    // Perfect score
};

const Tooltip = ({ data, position }) => {
    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ top: position.y - 80, left: position.x - 60 }} // Offset to center above cursor
            className="fixed z-50 px-4 py-2 bg-gray-900 text-white text-xs rounded-md shadow-xl border border-gray-700 pointer-events-none w-40"
        >
            <div className="font-bold text-gray-300 mb-1">{dayjs(data.date).format('MMM D, YYYY')}</div>
            {data.solved ? (
                <div className="space-y-1">
                    <div className="flex justify-between"><span>Score:</span> <span className="text-emerald-400">{data.score}</span></div>
                    <div className="flex justify-between"><span>Time:</span> <span>{data.timeTaken}s</span></div>
                    <div className="flex justify-between"><span>Difficulty:</span> <span>{data.difficulty}</span></div>
                </div>
            ) : (
                <div className="text-gray-500 italic">No activity</div>
            )}
        </motion.div>
    );
};

const HeatmapCell = ({ date, activity, onHover, onLeave }) => {
    // Determine intensity
    let intensity = 0;
    if (activity?.solved) {
        if (activity.score >= 100) intensity = 4;
        else if (activity.difficulty >= 3) intensity = 3; // Hard
        else if (activity.difficulty >= 2) intensity = 2; // Medium
        else intensity = 1; // Easy
    }

    // Interaction handlers
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
            whileHover={{ scale: 1.2, zIndex: 10 }}
            className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[intensity]} border border-white/5 transition-colors`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={onLeave}
        />
    );
};

const HeatmapColumn = ({ weekData, onHover, onLeave }) => {
    return (
        <div className="flex flex-col gap-1">
            {weekData.map((dayIso) => (
                <HeatmapCell
                    key={dayIso.date}
                    date={dayIso.date}
                    activity={dayIso.activity}
                    onHover={onHover}
                    onLeave={onLeave}
                />
            ))}
        </div>
    );
};

const ActivityHeatmap = () => {
    const [activityMap, setActivityMap] = useState({});
    const [tooltipData, setTooltipData] = useState(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const fetchActivity = async () => {
            const activities = await getAllActivity();
            const map = {};
            activities.forEach(act => {
                map[act.date] = act;
            });
            setActivityMap(map);
        };
        fetchActivity();
    }, []);

    // Generate 52 weeks grid (or 365 days grouped)
    const gridData = useMemo(() => {
        const today = dayjs();
        // Start from 1 year ago? Or Start of Year?
        // User spec: "const startOfYear = dayjs().startOf('year')"
        // But usually heatmaps show the last 365 days rolling, OR the current calendar year.
        // Spec: "for (let i = 0; i < 365; i++)" from startOfYear. 
        // Showing strictly this year (Jan 1 to Dec 31)?
        const startOfYear = dayjs().startOf('year');
        const weeks = [];
        let currentWeek = [];

        // Align to Sunday start for proper grid?
        // If Jan 1 is Wednesday, we need placeholders for Sun, Mon, Tue?
        // The user spec "HeatmapColumn (Week)" implies strict 7-day columns.
        // Let's generate a full calendar year view, padding start.

        let currentDay = startOfYear;
        const dayOfWeek = currentDay.day(); // 0 (Sun) to 6 (Sat)

        // Pad start
        for (let i = 0; i < dayOfWeek; i++) {
            currentWeek.push({ date: `empty-start-${i}`, activity: null, placeholder: true });
        }

        for (let i = 0; i < 365; i++) {
            // Handle leap year? dayjs handles date math correctly.
            // If we overshoot the year, loop handles 365.
            const dateStr = currentDay.format('YYYY-MM-DD');
            currentWeek.push({ date: dateStr, activity: activityMap[dateStr] });

            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            currentDay = currentDay.add(1, 'day');
        }

        // Push remaining
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [activityMap]);

    return (
        <div className="mt-8 p-6 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-x-auto">
            <h3 className="text-lg font-bold text-gray-300 mb-6 flex items-center gap-2">
                <span>📊</span> Contribution Graph
            </h3>

            <div className="relative">
                <div className="flex gap-1 min-w-max pb-2">
                    {gridData.map((week, i) => (
                        <HeatmapColumn
                            key={i}
                            weekData={week}
                            onHover={(data, pos) => {
                                setTooltipData(data);
                                setTooltipPos(pos);
                            }}
                            onLeave={() => setTooltipData(null)}
                        />
                    ))}
                </div>

                <AnimatePresence>
                    {tooltipData && <Tooltip data={tooltipData} position={tooltipPos} />}
                </AnimatePresence>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-400">
                <span>Less</span>
                <div className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[0]}`} />
                <div className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[1]}`} />
                <div className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[2]}`} />
                <div className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[3]}`} />
                <div className={`w-3 h-3 rounded-sm ${INTENSITY_MAP[4]}`} />
                <span>More</span>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
