"use client";

import Container from "@/components/container";
import PuzzleBoard from "@/components/puzzle-board";
import ActivityHeatmap from "@/components/activity-heatmap";
import StreakDisplay from "@/components/streak-display";
import { useSync } from "@/hooks/use-sync";

export default function Home() {
  useSync();

  return (
    <div className="min-h-screen bg-[#F6F5F5] text-[#222222] font-sans selection:bg-[#414BEA]/20">
      <header className="py-16 bg-white border-b border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#414BEA] flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rotate-45" />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.4em] text-[#414BEA]">Bluestock</span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter text-[#222222] max-w-xl leading-[0.9]">
                MASTER THE <span className="text-[#414BEA]">MARKET</span> ONE DAY AT A TIME.
              </h1>
              <p className="text-sm font-medium text-gray-400 mt-6 uppercase tracking-widest max-w-md antialiased">
                Engineering consistency through quantitative daily challenges.
              </p>
            </div>
            <StreakDisplay />
          </div>
        </Container>
      </header>

      <main className="py-24">
        <Container>
          <div className="flex flex-col items-center gap-24">
            <PuzzleBoard />
            <div className="w-full">
              <ActivityHeatmap />
            </div>
          </div>
        </Container>
      </main>

      <footer className="py-24 border-t border-gray-100 bg-white">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            <div>© 2026 Bluestock Fintech</div>
            <div className="flex gap-8">
              <span className="hover:text-[#414BEA] cursor-pointer transition-colors">Architecture</span>
              <span className="hover:text-[#414BEA] cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-[#414BEA] cursor-pointer transition-colors">Scale</span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}