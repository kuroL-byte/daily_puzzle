import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPuzzle, completePuzzle } from '../store/slices/puzzleSlice';
import { updateStreak, addPoints } from '../store/slices/userSlice';
import PuzzleGenerator from '../utils/PuzzleGenerator';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const PuzzleBoard = () => {
    const dispatch = useDispatch();
    const { currentPuzzle, isSolved } = useSelector((state) => state.puzzle);
    const [grid, setGrid] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const today = dayjs().format('YYYY-MM-DD');
        const puzzle = PuzzleGenerator.generateDailyPuzzle(today);
        dispatch(setPuzzle(puzzle));
        setGrid(puzzle.grid);
    }, [dispatch]);

    const handleCellChange = (rowIndex, colIndex, value) => {
        if (isSolved) return;
        const newGrid = [...grid.map(row => [...row])];
        newGrid[rowIndex][colIndex] = value === '' ? null : parseInt(value) || 0;
        setGrid(newGrid);
    };

    const checkSolution = () => {
        if (isSolved) return;

        // Verify row sums
        const rowSums = grid.map(row => row.reduce((a, b) => (a || 0) + (b || 0), 0));
        const colSums = Array.from({ length: 4 }, (_, colIndex) =>
            grid.reduce((sum, row) => sum + (row[colIndex] || 0), 0)
        );

        const rowsCorrect = rowSums.every((sum, i) => sum === currentPuzzle.rowTargets[i]);
        const colsCorrect = colSums.every((sum, i) => sum === currentPuzzle.colTargets[i]);

        if (rowsCorrect && colsCorrect) {
            setMessage('Correct! 🎉');
            const today = dayjs().format('YYYY-MM-DD');

            dispatch(completePuzzle({
                date: today,
                score: 100,
                timeTaken: 60 // Mock time for now
            }));

            dispatch(updateStreak({ date: today }));
            dispatch(addPoints(100));
        } else {
            setMessage('Incorrect, try again.');
        }
    };

    if (!currentPuzzle) return <div className="text-white">Loading Puzzle...</div>;

    return (
        <div className="p-8 max-w-2xl mx-auto bg-gray-800 rounded-xl shadow-lg border border-gray-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Daily Puzzle
                </h2>
                {isSolved && <span className="text-green-400 font-bold px-3 py-1 bg-green-900/30 rounded-full">SOLVED</span>}
            </div>

            <p className="text-gray-300 mb-6">{currentPuzzle.instructions}</p>

            <div className="grid grid-cols-5 gap-2 mb-6">
                {/* Render the grid cells */}
                {grid.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {row.map((cell, colIndex) => {
                            const isFixed = currentPuzzle.grid[rowIndex][colIndex] !== null;
                            return (
                                <motion.div
                                    key={`${rowIndex}-${colIndex}`}
                                    whileHover={{ scale: 1.05 }}
                                    className="relative"
                                >
                                    {isFixed ? (
                                        <div className="w-12 h-12 flex items-center justify-center rounded-lg text-xl font-bold bg-indigo-600 text-white shadow-md">
                                            {cell}
                                        </div>
                                    ) : (
                                        <input
                                            type="number"
                                            className={`w-12 h-12 text-center rounded-lg text-xl font-bold bg-gray-700 text-yellow-400 border-2 border-dashed border-gray-600 focus:border-yellow-400 focus:outline-none transition-colors ${isSolved ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            value={cell || ''}
                                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                                            disabled={isSolved}
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                        {/* Row Target */}
                        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-900/50 text-green-200 font-bold border border-green-700/50">
                            {currentPuzzle.rowTargets[rowIndex]}
                        </div>
                    </React.Fragment>
                ))}

                {/* Column Targets */}
                {currentPuzzle.colTargets.map((target, index) => (
                    <div key={`col-${index}`} className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-900/50 text-green-200 font-bold border border-green-700/50">
                        {target}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={checkSolution}
                    disabled={isSolved}
                    className={`px-8 py-3 rounded-lg text-white font-bold transition-all duration-300 transform hover:-translate-y-1 shadow-lg
            ${isSolved
                            ? 'bg-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-indigo-500/50'
                        }`}
                >
                    {isSolved ? 'Completed' : 'Check Solution'}
                </button>
                {message && (
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`font-bold ${message.includes('Correct') ? 'text-green-400' : 'text-red-400'}`}
                    >
                        {message}
                    </motion.span>
                )}
            </div>
        </div>
    );
};

export default PuzzleBoard;
