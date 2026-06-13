import React, { useState, useEffect, useRef } from 'react';
import { Tile } from '../types';
import { getTileStyle, formatTileValue } from '../utils/gameUtils';
import { motion, AnimatePresence } from 'motion/react';
import { Undo2, RotateCcw, Volume2, VolumeX, AlertTriangle, Lock, Unlock } from 'lucide-react';
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
  const boardRef = useRef<HTMLDivElement>(null);
  const [isScreenLocked, setIsScreenLocked] = useState(false);

  // Sync document level overflow/scrolling state when screen is locked
  useEffect(() => {
    if (isScreenLocked) {
      document.body.classList.add('overflow-hidden', 'touch-none', 'overscroll-none');
      document.documentElement.classList.add('overflow-hidden', 'touch-none', 'overscroll-none');
    } else {
      document.body.classList.remove('overflow-hidden', 'touch-none', 'overscroll-none');
      document.documentElement.classList.remove('overflow-hidden', 'touch-none', 'overscroll-none');
    }
    return () => {
      document.body.classList.remove('overflow-hidden', 'touch-none', 'overscroll-none');
      document.documentElement.classList.remove('overflow-hidden', 'touch-none', 'overscroll-none');
    };
  }, [isScreenLocked]);

  // Setup active native touch event listeners to lock body-level scrolling and prevent default actions while dragging inside the board
  useEffect(() => {
    const element = boardRef.current;
    if (!element) return;

    let startX = 0;
    let startY = 0;

    const lockDocumentScroll = () => {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.overscrollBehavior = 'none';
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.touchAction = 'none';
      document.documentElement.style.overscrollBehavior = 'none';
    };

    const unlockDocumentScroll = () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.touchAction = '';
      document.documentElement.style.overscrollBehavior = '';
    };

    const nativeTouchStart = (e: TouchEvent) => {
      if (gameOver) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      lockDocumentScroll();
    };

    const nativeTouchMove = (e: TouchEvent) => {
      // Hard prevent browser page container scrolling or bounce during tile movement gestures
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    const nativeTouchEnd = (e: TouchEvent) => {
      unlockDocumentScroll();
      if (gameOver) return;

      const touch = e.changedTouches[0];
      const diffX = touch.clientX - startX;
      const diffY = touch.clientY - startY;

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
    };

    const nativeTouchCancel = () => {
      unlockDocumentScroll();
    };

    element.addEventListener('touchstart', nativeTouchStart, { passive: false });
    element.addEventListener('touchmove', nativeTouchMove, { passive: false });
    element.addEventListener('touchend', nativeTouchEnd, { passive: false });
    element.addEventListener('touchcancel', nativeTouchCancel, { passive: false });

    return () => {
      unlockDocumentScroll();
      element.removeEventListener('touchstart', nativeTouchStart);
      element.removeEventListener('touchmove', nativeTouchMove);
      element.removeEventListener('touchend', nativeTouchEnd);
      element.removeEventListener('touchcancel', nativeTouchCancel);
    };
  }, [gameOver, onMove]);

  // Generate background empty cells (4x4)
  const emptyCells = Array(16).fill(null);

  return (
    <div className={`flex flex-col gap-4 font-plus-jakarta max-w-lg mx-auto w-full select-none px-1 ${isScreenLocked ? 'relative z-50' : ''}`}>
      {/* Full viewport touch blocking glass backdrop when Locked state is enabled */}
      {isScreenLocked && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs touch-none overscroll-none select-none pointer-events-auto flex flex-col justify-between items-center p-6 text-center"
          onTouchStart={(e) => {
            if (e.cancelable) e.preventDefault();
          }}
          onTouchMove={(e) => {
            if (e.cancelable) e.preventDefault();
          }}
        >
          <div className="mt-8 animate-pulse">
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 font-extrabold font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-inner shadow-amber-500/5">
              ⚡ Safe Play Mode Active
            </span>
          </div>
          <div className="mb-24 flex flex-col items-center gap-1">
            <span className="text-slate-300 font-mono text-xs font-semibold">
              Screen scrolling and zoom are completely locked.
            </span>
            <span className="text-slate-500 font-mono text-[10px]">
              Tap the highlighted "Locked" button above to unlock.
            </span>
          </div>
        </div>
      )}

      {/* Game Stats and Quick Controls Bar */}
      <div className="flex items-center justify-between gap-1 mt-1">
        {/* Score blocks */}
        <div className="flex gap-1 sm:gap-2">
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 min-w-[55px] sm:min-w-[70px] text-center animate-once duration-350">
            <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Score</span>
            <span className="text-xs sm:text-sm font-bold text-white font-mono">{score.toLocaleString()}</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 sm:px-3 sm:py-1.5 min-w-[55px] sm:min-w-[70px] text-center">
            <span className="text-[9px] sm:text-[10px] text-yellow-500 font-bold uppercase tracking-wider block font-mono">Best</span>
            <span className="text-xs sm:text-sm font-bold text-yellow-400 font-mono">{highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex gap-1 sm:gap-1.5">
          {/* Lock Screen Toggle Button */}
          <button
            onClick={() => setIsScreenLocked(!isScreenLocked)}
            className={`flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-xl font-bold text-[10px] sm:text-xs transition active:scale-95 ${
              isScreenLocked
                ? 'bg-amber-500 hover:bg-amber-400 border-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={isScreenLocked ? "Unlock screen scrolling" : "Lock screen view to block wobble"}
          >
            {isScreenLocked ? (
              <>
                <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-950" />
                <span>Locked</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                <span>Lock</span>
              </>
            )}
          </button>

          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition"
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />}
          </button>

          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={undoCredits <= 0}
            className={`flex items-center gap-0.5 sm:gap-1 px-2 py-1.5 sm:px-3 sm:py-2 border rounded-xl font-bold text-[10px] sm:text-xs transition ${
              undoCredits > 0
                ? 'bg-purple-950/40 border-purple-800 text-purple-300 hover:bg-purple-950/60'
                : 'bg-slate-950 border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
            title="Rollback latest action"
          >
            <Undo2 className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            <span>Undo ({undoCredits})</span>
          </button>

          {/* Restart Button */}
          <button
            onClick={onReset}
            className="p-1.5 sm:p-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition"
            title="Reset boards"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Main 2048 Stage Container */}
      <div
        ref={boardRef}
        className="aspect-square w-full bg-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl shadow-indigo-950/20 touch-none"
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
