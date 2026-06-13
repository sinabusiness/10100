import React, { useState } from 'react';
import { Tile } from '../types';
import { getTileStyle, formatTileValue } from '../utils/gameUtils';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2, RotateCcw, Volume2, VolumeX, Sparkles, AlertTriangle, ArrowRight, ArrowDown, ArrowUp, ArrowLeft } from 'lucide-react';
import { sounds } from './SoundEffects';

interface GameGridProps {
  tiles: Tile[];
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  undoCredits: number;
  onUndo: () => void;
  onReset: () => void;
  score: number;
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
  gameOver: boolean;
}

export const GameGrid: React.FC<GameGridProps> = ({
  tiles,
  onMove,
  undoCredits,
  onUndo,
  onReset,
  score,
  highScore,
  isMuted,
  onToggleMute,
  gameOver
}) => {
  // Mobile Touch Swipe Handling
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (gameOver) return;
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || gameOver) return;
    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStart.x;
    const diffY = touch.clientY - touchStart.y;

    const threshold = 35; // Minimum travel distance to register swipe
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) >= threshold) {
        if (diffX > 0) {
          onMove('right');
        } else {
          onMove('left');
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) >= threshold) {
        if (diffY > 0) {
          onMove('down');
        } else {
          onMove('up');
        }
      }
    }
    setTouchStart(null);
  };

  // Generate background empty cells (4x4)
  const emptyCells = Array(16).fill(null);

  return (
    <div className="flex flex-col gap-4 font-plus-jakarta max-w-lg mx-auto w-full select-none px-1">
      {/* Game Stats and Quick Controls Bar */}
      <div className="flex items-center justify-between gap-3 mt-1">
        {/* Score blocks */}
        <div className="flex gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[70px] text-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Score</span>
            <span className="text-sm font-bold text-white font-mono">{score.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 min-w-[70px] text-center">
            <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider block font-mono">Best</span>
            <span className="text-sm font-bold text-yellow-400 font-mono">{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex gap-1.5">
          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={undoCredits <= 0}
            className={`flex items-center gap-1 px-3 py-2 border rounded-xl font-bold text-xs transition ${
              undoCredits > 0
                ? 'bg-purple-950/40 border-purple-800 text-purple-300 hover:bg-purple-950/60'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
            title="Rollback latest action"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo ({undoCredits})</span>
          </button>

          {/* Restart Button */}
          <button
            onClick={onReset}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition"
            title="Reset boards"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main 2048 Stage Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="aspect-square w-full bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl shadow-indigo-950/20"
      >
        {/* Background slot grids */}
        <div
          className="absolute inset-0 p-2.5 grid grid-cols-4 grid-rows-4 gap-2.5 pointer-events-none"
          style={{
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'repeat(4, 1fr)'
          }}
        >
          {emptyCells.map((_, i) => (
            <div
              key={i}
              className="bg-slate-900/40 rounded-2xl border border-slate-850/60 w-full h-full"
            />
          ))}
        </div>

        {/* Dynamic active functional tiles overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <AnimatePresence>
            {tiles.map((tile) => {
              const style = getTileStyle(tile.level);

              return (
                <motion.div
                  key={tile.id}
                  initial={tile.isNew ? { scale: 0.1, opacity: 0 } : { scale: 1, opacity: 1 }}
                  animate={{
                    scale: tile.isMerged ? [1, 1.15, 1] : 1,
                    opacity: 1,
                  }}
                  exit={{ scale: 0.1, opacity: 0 }}
                  transition={{
                    scale: {
                      type: 'tween',
                      ease: 'easeOut',
                      duration: 0.15
                    },
                    opacity: {
                      duration: 0.12
                    }
                  }}
                  className="absolute pointer-events-auto"
                  style={{
                    top: `calc(10px + ${tile.row * 25}% - ${tile.row * 2.5}px)`,
                    left: `calc(10px + ${tile.col * 25}% - ${tile.col * 2.5}px)`,
                    width: 'calc(25% - 12.5px)',
                    height: 'calc(25% - 12.5px)',
                    zIndex: tile.isMerged ? 10 : 2,
                    transition: 'top 150ms cubic-bezier(0.16, 1, 0.3, 1), left 150ms cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {/* Tile presentation layer */}
                  <div
                    className={`w-full h-full rounded-2xl border flex flex-col items-center justify-center p-1 cursor-default select-none relative overflow-hidden transition-all ${style.bg} ${style.border} ${style.shadow}`}
                  >
                    {/* Subtle vector details */}
                    <div className="absolute inset-0 bg-coin-glow opacity-30 pointer-events-none" />

                    {/* Coin icon element */}
                    <div className="text-sm filter drop-shadow-md">{style.icon}</div>

                    {/* Math text label */}
                    <div className={`font-mono text-base font-black tracking-tight mt-0.5 ${style.text}`}>
                      {style.label}
                    </div>

                    {/* High Quality Crypto title */}
                    <div className="text-[8px] opacity-70 font-bold uppercase tracking-wider block text-slate-350">
                      {style.coinName}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Game Over overlay card */}
        {gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-30"
          >
            <div className="p-3 bg-red-500/10 rounded-2xl border border-red-500/20 mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-extrabold text-white">Grid Board Locked</h3>
            <p className="text-xs text-slate-400 text-center mt-1 max-w-xs">
              No further cryptographic combinations can be merged. Redeem an Undo Credit or restart the cycle.
            </p>

            <div className="flex gap-2.5 mt-5 w-full max-w-[240px]">
              {undoCredits > 0 ? (
                <button
                  onClick={onUndo}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition flex items-center justify-center gap-1 shadow-md shadow-purple-600/20"
                >
                  <Undo2 className="w-4 h-4" />
                  <span>Undo Move</span>
                </button>
              ) : (
                <button
                  onClick={onReset}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold py-2.5 px-3 rounded-xl text-xs transition shadow-md shadow-yellow-500/20"
                >
                  Start Over
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Swipe control helper (Desktop instruction/Arrows) */}
      <div className="block bg-slate-900/40 border border-slate-800/60 rounded-2xl p-3 text-center">
        <p className="text-[11px] text-slate-500 font-semibold font-mono flex items-center justify-center gap-2">
          <span>SWIPE GRAPHICS OR USE KEYBOARD DIRECTIONS:</span>
          <span className="inline-flex gap-1">
            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-bold text-[9px] text-slate-400 inline-block">↑</span>
            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-bold text-[9px] text-slate-400 inline-block">↓</span>
            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-bold text-[9px] text-slate-400 inline-block">←</span>
            <span className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded font-bold text-[9px] text-slate-400 inline-block">→</span>
          </span>
        </p>
      </div>
    </div>
  );
};
