import { useEffect } from 'react'
import PuzzleBoard from './components/PuzzleBoard'
import { StreakCounter, ActivityHeatmap } from './components/Engagement'
import { useDispatch } from 'react-redux'
import { loadUserStats } from './store/slices/userSlice'

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserStats());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4">
      <header className="w-full max-w-4xl flex justify-between items-center mb-12 mt-4">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Logic Looper
          </h1>
          <p className="text-sm text-gray-400">Daily Brain Training</p>
        </div>
        <StreakCounter />
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center pb-12">
        <PuzzleBoard />
        <ActivityHeatmap />
      </main>
    </div>
  )
}

export default App
