"use client";

import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { saveDailyActivity, savePuzzleProgress, getPuzzleProgress, getAllActivity, DailyActivity } from "@/lib/storage";
import { generateDailyPuzzle, Puzzle } from "@/lib/puzzle-engine";
import { Timer, Lightbulb, Play, CheckCircle, RotateCcw } from "lucide-react";

export default function PuzzleBoard({ date }: { date?: string }) {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [isSolved, setIsSolved] = useState(false);
    const [currentValue, setCurrentValue] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [message, setMessage] = useState("");
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const targetDate = date || dayjs().format("YYYY-MM-DD");
        const p = generateDailyPuzzle(targetDate);
        setPuzzle(p);

        // Reset local state for new date selection
        setIsSolved(false);
        setCurrentValue(0);
        setElapsedTime(0);
        setHintsUsed(0);
        setMessage("");

        // Load progress from IndexedDB
        getPuzzleProgress(targetDate).then((saved) => {
            if (saved) {
                setCurrentValue(saved.currentValue);
                setElapsedTime(saved.elapsedTime);
                setHintsUsed(saved.hintsUsed);
            }
        });

        // Check if ALREADY solved
        getAllActivity().then((all: DailyActivity[]) => {
            const act = all.find((a: DailyActivity) => a.date === targetDate);
            if (act?.solved) {
                setIsSolved(true);
                setMessage(`Challenge Completed! Score: ${act.score}`);
            }
        });
    }, [date]);

    // Timer logic
    useEffect(() => {
        if (puzzle && !isSolved) {
            timerRef.current = setInterval(() => {
                setElapsedTime((prev) => {
                    const next = prev + 1;
                    // Auto-save every 5 seconds
                    if (next % 5 === 0) {
                        savePuzzleProgress({
                            date: puzzle.date,
                            elapsedTime: next,
                            hintsUsed,
                            currentValue
                        });
                    }
                    return next;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [puzzle, isSolved, hintsUsed, currentValue]);

    const handleAction = (increment: number) => {
        if (isSolved) return;
        setCurrentValue((prev) => {
            const next = Math.max(0, prev + increment);
            if (next === puzzle?.target) {
                handleSolve(next);
            }
            return next;
        });
    };

    const handleSolve = async (finalValue: number) => {
        if (!puzzle) return;

        setIsSolved(true);
        setMessage(`Challenge Completed! Score: ${calculateScore()}`);

        saveDailyActivity({
            date: puzzle.date,
            solved: true,
            score: calculateScore(),
            timeTaken: elapsedTime,
            difficulty: puzzle.difficulty
        }).then(() => {
            console.log("Activity synced to IndexedDB.");
        });
    };

    const handleHint = () => {
        if (hintsUsed >= 3 || isSolved || !puzzle) return;

        setHintsUsed(prev => prev + 1);
        // Give a tactical hint: adjust currentValue closer to target
        const diff = puzzle.target - currentValue;
        const adjustment = Math.floor(diff / 2);
        setCurrentValue(prev => prev + adjustment);
    };

    const calculateScore = () => {
        if (!puzzle) return 0;
        const base = puzzle.difficulty * 100;
        const timeBonus = Math.max(0, 100 - Math.floor(elapsedTime / 10));
        const hintPenalty = hintsUsed * 25;
        return Math.max(50, base + timeBonus - hintPenalty);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (!puzzle) return <div className="text-gray-400 font-bold animate-pulse">Initializing Terminal...</div>;

    return (
        <div className="w-full max-w-md p-8 bg-white border border-gray-100 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative overflow-hidden">
            {/* Header Info */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-[#414BEA] animate-pulse" />
                        <span className="text-[10px] font-black text-[#414BEA] uppercase tracking-[0.2em]">
                            {puzzle.type.replace('_', ' ')}
                        </span>
                    </div>
                    <h2 className="text-2xl font-black text-[#222222] tracking-tight leading-none uppercase">Daily Puzzle</h2>
                </div>
                <div className="flex flex-col items-end">
                    <div className="px-3 py-1 bg-[#F6F5F5] rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                        {dayjs(puzzle.date).format("MMM D")}
                    </div>
                    <div className="flex items-center gap-1 text-[#222222] font-mono text-xs font-bold">
                        <Timer size={12} className="text-[#414BEA]" />
                        {formatTime(elapsedTime)}
                    </div>
                </div>
            </div>

            {/* Main Display */}
            <div className="space-y-6">
                <div className="p-8 bg-gray-50 rounded-[32px] border border-gray-100/50 text-center relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 px-4">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Active State</span>
                        <span className="text-[10px] font-black text-[#7752FE] uppercase tracking-widest">Target: {puzzle.target}</span>
                    </div>

                    <p className="text-7xl font-black text-[#222222] tabular-nums tracking-tighter transition-all duration-300">
                        {currentValue}
                    </p>

                    {puzzle.type === "STOCKS_LOGIC" && (
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#D9E2FF] rounded-full text-[10px] font-bold text-[#414BEA]">
                            Ticker: {puzzle.data.ticker}
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleAction(puzzle.difficulty * 5)}
                        disabled={isSolved}
                        className="py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-xs uppercase text-[#414BEA] hover:border-[#414BEA] hover:bg-[#F8EDFF] transition-all disabled:opacity-50"
                    >
                        Add Volume (+{puzzle.difficulty * 5})
                    </button>
                    <button
                        onClick={() => handleAction(-puzzle.difficulty * 2)}
                        disabled={isSolved}
                        className="py-4 bg-white border-2 border-gray-100 rounded-2xl font-black text-xs uppercase text-[#F05537] hover:border-[#F05537] hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                        Sell Position (-{puzzle.difficulty * 2})
                    </button>
                </div>

                {/* Tactical Hint */}
                <div className="flex justify-center">
                    <button
                        onClick={handleHint}
                        disabled={isSolved || hintsUsed >= 3}
                        className="flex items-center gap-2 px-6 py-2 bg-gray-50 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#414BEA] hover:bg-[#DDF2FD] transition-all disabled:opacity-30"
                    >
                        <Lightbulb size={12} />
                        Hint ({3 - hintsUsed} left)
                    </button>
                </div>
            </div>

            {/* Feedback Overlay */}
            <AnimatePresence>
                {isSolved && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-8 text-center z-10"
                    >
                        <motion.div
                            initial={{ y: 20 }}
                            animate={{ y: 0 }}
                        >
                            <CheckCircle size={64} className="text-[#414BEA] mb-6 inline-block" />
                            <h3 className="text-3xl font-black text-[#222222] mb-2 uppercase tracking-tighter">Settlement Successful</h3>
                            <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">{message}</p>

                            <div className="flex gap-4">
                                <button className="px-8 py-3 bg-[#414BEA] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[#414BEA]/20">
                                    Share Score
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="p-3 border border-gray-200 rounded-xl text-gray-400 hover:text-[#414BEA] hover:bg-gray-50 transition-all"
                                >
                                    <RotateCcw size={18} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 flex gap-2">
                <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${currentValue / puzzle.target >= 0.3 ? 'bg-[#414BEA]' : 'bg-gray-100'}`} />
                <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${currentValue / puzzle.target >= 0.7 ? 'bg-[#414BEA]' : 'bg-gray-100'}`} />
                <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${currentValue / puzzle.target >= 1 ? 'bg-[#414BEA]' : 'bg-gray-100'}`} />
            </div>
            <p className="text-[10px] text-gray-400 font-black mt-4 text-center uppercase tracking-[0.3em]">
                Consistency Engine v1.0
            </p>
        </div>
    );
}
