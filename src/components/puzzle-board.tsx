"use client";

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { saveDailyActivity } from "@/lib/storage";

// Simplified puzzle generator for demonstration
const generatePuzzle = (date: string) => {
    // Use date as seed
    const seed = date.split("-").reduce((a, b) => a + parseInt(b), 0);
    return {
        id: `puzzle-${date}`,
        date,
        difficulty: (seed % 3) + 1, // 1: Easy, 2: Med, 3: Hard
        target: 10 + (seed % 20),
        current: 0,
    };
};

export default function PuzzleBoard() {
    const [puzzle, setPuzzle] = useState<any>(null);
    const [isSolved, setIsSolved] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const today = dayjs().format("YYYY-MM-DD");
        setPuzzle(generatePuzzle(today));
    }, []);

    const handleSolve = async () => {
        if (!puzzle) return;

        setIsSolved(true);
        setMessage("Challenge Completed! +50 Points");

        const score = puzzle.difficulty * 50;
        const timeTaken = 45;

        // Phase 1 Rule: Store locally in IndexedDB, do NOT wait for server
        saveDailyActivity({
            date: puzzle.date,
            solved: true,
            score: score,
            timeTaken: timeTaken,
            difficulty: puzzle.difficulty
        }).then(() => {
            console.log("Saved to IndexedDB locally.");
        });
    };

    if (!puzzle) return <div className="text-gray-400 font-bold animate-pulse">Initializing Terminal...</div>;

    return (
        <div className="w-full max-w-md p-10 bg-white border border-gray-100 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-2xl font-black text-[#222222] tracking-tight leading-none uppercase">Daily Challenge</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Quantitative Analytics</p>
                </div>
                <div className="px-4 py-2 bg-[#D9E2FF] rounded-2xl text-[10px] font-black text-[#414BEA] uppercase tracking-widest">
                    {dayjs(puzzle.date).format("MMM D")}
                </div>
            </div>

            <div className="space-y-8">
                <div className="p-10 bg-gray-50 rounded-[32px] border border-gray-100/50 text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#414BEA] to-[#7752FE] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest font-black">Target Capital</p>
                    <p className="text-7xl font-black text-[#222222] tabular-nums tracking-tighter">${puzzle.target}M</p>
                </div>

                <button
                    onClick={handleSolve}
                    disabled={isSolved}
                    className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all transform active:scale-95 shadow-xl ${isSolved
                            ? "bg-gray-100 text-gray-400 shadow-none cursor-default"
                            : "bg-[#414BEA] text-white hover:bg-[#190482] shadow-[#414BEA]/20"
                        }`}
                >
                    {isSolved ? "Settled" : "Execute Solution"}
                </button>

                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-[10px] font-black text-[#414BEA] uppercase tracking-widest"
                    >
                        {message}
                    </motion.p>
                )}
            </div>

            <div className="mt-10 flex gap-2">
                <div className={`flex-1 h-1.5 rounded-full transition-colors ${puzzle.difficulty >= 1 ? 'bg-[#414BEA]' : 'bg-gray-100'}`} />
                <div className={`flex-1 h-1.5 rounded-full transition-colors ${puzzle.difficulty >= 2 ? 'bg-[#414BEA]' : 'bg-gray-100'}`} />
                <div className={`flex-1 h-1.5 rounded-full transition-colors ${puzzle.difficulty >= 3 ? 'bg-[#414BEA]' : 'bg-gray-100'}`} />
            </div>
            <p className="text-[10px] text-gray-400 font-black mt-3 text-center uppercase tracking-widest">
                Risk Level: <span className="text-[#222222]">{puzzle.difficulty === 3 ? 'High' : puzzle.difficulty === 2 ? 'Medium' : 'Low'}</span>
            </p>
        </div>
    );
}
