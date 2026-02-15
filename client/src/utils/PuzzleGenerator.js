import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';

class PuzzleGenerator {
    constructor() {
        this.puzzleTypes = ['NumberMatrix', 'PatternMatching', 'SequenceSolver', 'DeductionGrid', 'BinaryLogic'];
    }

    // Generate a deterministic seed from the date string (YYYY-MM-DD)
    getSeed(dateString) {
        if (!dateString) dateString = dayjs().format('YYYY-MM-DD');
        const hash = CryptoJS.SHA256(dateString).toString();
        // Convert hash to a number for seeding
        return parseInt(hash.substring(0, 8), 16);
    }

    // Simple Linear Congruential Generator for deterministic random numbers
    seededRandom(seed) {
        let currentSeed = seed;
        return () => {
            currentSeed = (currentSeed * 9301 + 49297) % 233280;
            return currentSeed / 233280;
        };
    }

    generateDailyPuzzle(dateString) {
        const seed = this.getSeed(dateString);
        const rng = this.seededRandom(seed);

        // Select puzzle type based on day of year or rotation
        const typeIndex = Math.floor(rng() * this.puzzleTypes.length);
        const type = this.puzzleTypes[typeIndex];

        return this.generateSpecificPuzzle(type, rng);
    }

    generateSpecificPuzzle(type, rng) {
        switch (type) {
            case 'NumberMatrix':
                return this.generateNumberMatrix(rng);
            default:
                return this.generateNumberMatrix(rng); 
        }
    }

    generateNumberMatrix(rng) {
        // Generate a simple 4x4 grid where rows and columns sum to target numbers
        const size = 4;
        const grid = Array.from({ length: size }, () =>
            Array.from({ length: size }, () => Math.floor(rng() * 9) + 1)
        );

        const rowTargets = grid.map(row => row.reduce((a, b) => a + b, 0));
        const colTargets = Array.from({ length: size }, (_, colIndex) =>
            grid.reduce((sum, row) => sum + row[colIndex], 0)
        );

        const maskedGrid = grid.map(row => row.map(val => (rng() > 0.5 ? null : val)));

        return {
            type: 'NumberMatrix',
            grid: maskedGrid,
            rowTargets,
            colTargets,
            solution: grid,
            instructions: 'Fill the grid so that each row and column sums to the target numbers.',
        };
    }
}

export default new PuzzleGenerator();
