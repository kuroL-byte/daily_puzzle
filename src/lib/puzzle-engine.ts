import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_PUZZLE_SECRET || "bluestock-fintech-2026";

/**
 * Generates a deterministic numerical seed for a given date.
 * Ensures all users get the same puzzle on the same day.
 */
export function getSeedForDate(date: string): number {
    const hash = CryptoJS.SHA256(date + SECRET_KEY).toString();
    // Take first 8 characters and convert to integer
    return parseInt(hash.substring(0, 8), 16);
}

export type PuzzleType = "MATH_CHALLENGE" | "STOCKS_LOGIC";

export interface Puzzle {
    id: string;
    type: PuzzleType;
    date: string;
    difficulty: number;
    data: any;
    target: number;
}

/**
 * Core Engine to generate puzzles based on seed
 */
export function generateDailyPuzzle(date: string): Puzzle {
    const seed = getSeedForDate(date);

    // Alternate puzzle types based on seed (e.g., even/odd)
    const type: PuzzleType = seed % 2 === 0 ? "MATH_CHALLENGE" : "STOCKS_LOGIC";

    const difficulty = (seed % 3) + 1; // 1: Easy, 2: Med, 3: Hard

    if (type === "MATH_CHALLENGE") {
        const target = 20 + (seed % 80); // Target between 20 and 100
        return {
            id: `math-${date}`,
            type,
            date,
            difficulty,
            target,
            data: {
                base: 5 + (seed % 10),
                multiplier: (seed % 5) + 2
            }
        };
    } else {
        // STOCKS_LOGIC variant
        const target = 100 + (seed % 400); // Simulated stock target
        return {
            id: `stocks-${date}`,
            type,
            date,
            difficulty,
            target,
            data: {
                ticker: ["AAPL", "TSLA", "NVDA", "GOOGL"][seed % 4],
                volatility: (seed % 10) / 10
            }
        };
    }
}
