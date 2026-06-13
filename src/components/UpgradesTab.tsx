import React, { useState } from 'react';
import { UserStats } from '../types';
import { ArrowUpCircle, Zap, Eye, RefreshCw, Coins, Sparkles, Check } from 'lucide-react';
import { sounds } from './SoundEffects';

interface UpgradesTabProps {
  stats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
}

export const UpgradesTab: React.FC<UpgradesTabProps> = ({ stats, updateStats }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Hardcode base costs and formulas for upgrades
  const multiplierCost = 1000 * Math.pow(1.8, stats.multiplierLevel - 1);
  const spawnChanceCost = 1500 * Math.pow(2.2, stats.spawnChanceLevel - 1);
  const undoCost = 500; // Flat cost per undo credit

  const buyMultiplier = () => {
    sounds.playClick();
    const cost = Math.floor(multiplierCost);
    if (stats.totalCoins < cost) {
      triggerError("Insufficient $SWIPE token balance!");
      return;
    }
    if (stats.multiplierLevel >= 10) {
      triggerError("Multiplier upgrade is already at MAX level!");
      return;
    }

    updateStats({
      totalCoins: stats.totalCoins - cost,
      multiplierLevel: stats.multiplierLevel + 1
    });
    sounds.playLevelUp();
    triggerSuccess(`Successfully leveled up coin multiplier to x${stats.multiplierLevel + 1}!`);
  };

  const buySpawnChance = () => {
    sounds.playClick();
    const cost = Math.floor(spawnChanceCost);
    if (stats.totalCoins < cost) {
      triggerError("Insufficient $SWIPE token balance!");
      return;
    }
    if (stats.spawnChanceLevel >= 5) {
      triggerError("Lucky Spawn upgrade is already at MAX level!");
      return;
    }

    updateStats({
      totalCoins: stats.totalCoins - cost,
      spawnChanceLevel: stats.spawnChanceLevel + 1
    });
    sounds.playLevelUp();
    triggerSuccess(`Spawning chance upgraded to level ${stats.spawnChanceLevel + 1}! Higher probability of spawning 100 tiles.`);
  };

  const buyUndoCredit = () => {
    sounds.playClick();
    if (stats.totalCoins < undoCost) {
      triggerError("Insufficient $SWIPE token balance!");
      return;
    }

    updateStats({
      totalCoins: stats.totalCoins - undoCost,
      undoCredits: stats.undoCredits + 1
    });
    sounds.playSuccess();
    triggerSuccess("+1 Undo credit added to your game inventory! Use when stuck!");
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 3000);
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="flex flex-col gap-5 pb-24 font-plus-jakarta max-w-lg mx-auto w-full px-1">
      {/* Balance panel */}
      <div className="text-center py-4 relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
          Airdrop Boosters
        </h2>
        <p className="text-sm text-slate-400 mt-1">Enhance your metrics to speed up production rates.</p>

        {/* Current Coin Balance Display */}
        <div className="mt-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 inline-flex items-center gap-3 shadow-xl mx-auto">
          <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-500 font-mono">Total Earned Tokens</p>
            <h3 className="text-lg font-bold text-white font-mono">{stats.totalCoins.toLocaleString()} <span className="text-xs text-yellow-400">$SWIPE</span></h3>
          </div>
        </div>
      </div>

      {/* Real-time Alerts */}
      {errorMsg && (
        <div className="bg-rose-500/15 border border-rose-500/30 rounded-xl p-3 text-rose-300 text-xs text-center font-semibold">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl p-3 text-yellow-300 text-xs text-center font-semibold animate-pulse">
          ✨ {successMsg}
        </div>
      )}

      {/* Store Boost List */}
      <div className="flex flex-col gap-3">
        {/* BOOSTER 1: Multiplier */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <ArrowUpCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">Score Multiplier</h4>
                  <span className="text-[10px] bg-yellow-500/10 px-2 py-0.5 rounded text-yellow-400 font-mono font-bold">
                    Lv {stats.multiplierLevel}/10
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Multiplies the $SWIPE yield earned on each standard tile merge.</p>
                <p className="text-xs text-emerald-400 font-mono font-bold mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Cur: x{stats.multiplierLevel} multiplier → Next: x{stats.multiplierLevel + 1}
                </p>
              </div>
            </div>

            {stats.multiplierLevel >= 10 ? (
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 text-xs text-slate-500 font-bold flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-400" /> MAX
              </span>
            ) : (
              <button
                onClick={buyMultiplier}
                className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-md shadow-yellow-500/10 flex flex-col items-center"
              >
                <span className="font-sans">Level Up</span>
                <span className="text-[10px] opacity-80 font-mono mt-0.5">-{Math.floor(multiplierCost).toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>

        {/* BOOSTER 2: Spawn Level Chance */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">Lucky Spawn</h4>
                  <span className="text-[10px] bg-cyan-500/10 px-2 py-0.5 rounded text-cyan-400 font-mono font-bold">
                    Lv {stats.spawnChanceLevel}/5
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Increases the probability of spawns starting directly at level 2 (100 tile).</p>
                <p className="text-xs text-emerald-400 font-mono font-bold mt-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Cur: {stats.spawnChanceLevel * 10}% chance of 100-Val spawn
                </p>
              </div>
            </div>

            {stats.spawnChanceLevel >= 5 ? (
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-850 text-xs text-slate-500 font-bold flex items-center gap-1">
                <Check className="w-4 h-4 text-emerald-400" /> MAX
              </span>
            ) : (
              <button
                onClick={buySpawnChance}
                className="bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-md shadow-cyan-500/10 flex flex-col items-center"
              >
                <span className="font-sans">Level Up</span>
                <span className="text-[10px] opacity-80 font-mono mt-0.5">-{Math.floor(spawnChanceCost).toLocaleString()}</span>
              </button>
            )}
          </div>
        </div>

        {/* BOOSTER 3: Undo Move Restock */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <RefreshCw className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white">Undo Credit</h4>
                  <span className="text-[10px] bg-purple-500/15 px-2 py-0.5 rounded text-purple-300 font-mono font-bold">
                    {stats.undoCredits} Available
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Buy move-restoration credits to recover empty boards and secure high scores.</p>
                <p className="text-xs text-slate-500 mt-1">Flat rate. No level limit.</p>
              </div>
            </div>

            <button
              onClick={buyUndoCredit}
              className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow-md shadow-purple-500/10 flex flex-col items-center"
            >
              <span className="font-sans">Buy +1</span>
              <span className="text-[10px] opacity-80 font-mono mt-0.5">-{undoCost}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide segment */}
      <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl text-xs text-left text-slate-500 flex flex-col gap-1 mt-2">
        <h5 className="font-bold text-slate-400">⚡ Upgrade Mechanics:</h5>
        <p>1. Upgrades are written directly to safe storage.</p>
        <p>2. Permanent multipliers will dramatically increase your leaderboard scores and speed up listing share valuations.</p>
      </div>
    </div>
  );
};
