import React, { useState } from 'react';
import { Task, UserStats } from '../types';
import { CheckCircle2, ChevronRight, Loader2, Sparkles, Coins, Gift, Calendar, Twitter, Send, Youtube, Wallet } from 'lucide-react';
import { sounds } from './SoundEffects';

interface EarnTabProps {
  stats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export const EarnTab: React.FC<EarnTabProps> = ({ stats, updateStats, tasks, setTasks }) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Daily Streak Claim
  const handleDailyClaim = () => {
    sounds.playClick();
    const todayStr = new Date().toDateString();
    
    if (stats.lastDailyClaim === todayStr) {
      setSuccessMsg("Already claimed today's reward! Come back tomorrow.");
      setTimeout(() => setSuccessMsg(null), 3000);
      return;
    }

    const nextStreak = stats.dailyStreak + 1;
    // Reward base is 500 * streak
    const reward = 500 * nextStreak;
    
    updateStats({
      totalCoins: stats.totalCoins + reward,
      dailyStreak: nextStreak,
      lastDailyClaim: todayStr,
      undoCredits: stats.undoCredits + 1 // Plus 1 free undo credit!
    });

    sounds.playLevelUp();
    setSuccessMsg(`Daily Claim Success! +${reward} $SWIPE & +1 Undo Credit! Streak: ${nextStreak} Days 🔥`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  const startTaskVerification = (task: Task) => {
    if (task.completed) return;
    sounds.playClick();
    
    // Simulating verified external redirect
    if (task.actionUrl) {
      window.open(task.actionUrl, '_blank', 'noopener,noreferrer');
    }

    setClaimingId(task.id);

    // Simulate standard telegram API backend verification which takes 2.5 seconds
    setTimeout(() => {
      setTasks(prev => prev.map(t => {
        if (t.id === task.id) {
          return { ...t, completed: true };
        }
        return t;
      }));
      
      updateStats({
        totalCoins: stats.totalCoins + task.reward
      });

      setClaimingId(null);
      sounds.playSuccess();
      setSuccessMsg(`Missions Accomplished! +${task.reward} $SWIPE credited to your balance.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 2500);
  };

  const getTaskIcon = (iconName: string) => {
    switch (iconName) {
      case 'telegram':
        return <Send className="w-5 h-5 text-sky-400" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-neutral-400" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'wallet':
        return <Wallet className="w-5 h-5 text-purple-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-yellow-400" />;
    }
  };

  const isDailyClaimable = stats.lastDailyClaim !== new Date().toDateString();

  return (
    <div className="flex flex-col gap-5 pb-24 font-plus-jakarta max-w-lg mx-auto w-full px-1">
      {/* Head Panel */}
      <div className="text-center py-4 relative">
        <div className="absolute top-0 inset-x-0 h-40 bg-radial-gradient opacity-10 pointer-events-none" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Gift className="w-6 h-6 text-yellow-400 animate-bounce" />
          Earn Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1">Complete daily tasks to maximize your $SWIPE allocation.</p>
        
        {/* Token Balance Card */}
        <div className="mt-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <Coins className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="text-left">
              <p className="text-xs text-slate-500 font-medium font-mono">My $SWIPE Balance</p>
              <h3 className="text-xl font-bold text-white font-mono">{stats.totalCoins.toLocaleString()}</h3>
            </div>
          </div>
          <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-lg px-2.5 py-1 text-xs text-yellow-300 font-semibold font-mono">
            Score x{stats.multiplierLevel} Multiplier
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 text-emerald-300 text-xs text-center font-medium animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Daily Check-in Card */}
      <div className="bg-linear-to-r from-indigo-950/40 via-slate-900/50 to-amber-950/20 border border-slate-800/80 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-3 -top-3 w-16 h-16 bg-yellow-500/10 blur-xl rounded-full" />
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div className="mt-1 p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Calendar className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Daily Reward Strike</h4>
              <p className="text-xs text-slate-400 mt-0.5">Consecutive check-in multiplier rewards.</p>
              <div className="flex items-center gap-1.5 mt-2 bg-slate-800/60 w-fit px-2.5 py-1 rounded-full border border-slate-700/50">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs text-emerald-400 font-semibold">{stats.dailyStreak} Day Streak</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleDailyClaim}
            disabled={!isDailyClaimable}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              isDailyClaimable 
                ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-md shadow-yellow-500/15'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
            }`}
          >
            {isDailyClaimable ? 'Claim' : 'Claimed'}
          </button>
        </div>

        {/* Calendar visual days */}
        <div className="grid grid-cols-7 gap-1.5 mt-4">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const isCompleted = day <= stats.dailyStreak;
            const isCurrent = day === stats.dailyStreak + 1 && isDailyClaimable;
            return (
              <div
                key={day}
                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all ${
                  isCompleted
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                    : isCurrent
                    ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400 animate-pulse'
                    : 'bg-slate-900 border-slate-800/60 text-slate-500'
                }`}
              >
                <span className="text-[10px] font-mono block opacity-80">Day</span>
                <span className="text-xs font-bold block">{day}</span>
                <span className="text-[9px] font-mono mt-1 font-semibold">
                  {day * 500}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Missions Header */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-2.5 pl-1">Airdrop Tasks</h3>
        
        <div className="flex flex-col gap-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => startTaskVerification(task)}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                task.completed
                  ? 'bg-slate-950/25 border-slate-900 text-slate-500'
                  : claimingId === task.id
                  ? 'bg-slate-900 border-indigo-500/30 text-indigo-300'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${task.completed ? 'bg-slate-950 text-slate-600' : 'bg-slate-950 border border-slate-800'}`}>
                  {getTaskIcon(task.icon)}
                </div>
                <div className="text-left">
                  <h5 className={`text-sm font-bold transition-colors ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                    {task.title}
                  </h5>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-yellow-400 mt-0.5 font-semibold">
                    <Coins className="w-3.5 h-3.5" />
                    +{task.reward.toLocaleString()} $SWIPE
                  </div>
                </div>
              </div>

              <div>
                {task.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : claimingId === task.id ? (
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    Checking...
                  </div>
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram Banner */}
      <div className="bg-radial-gradient text-center p-5 rounded-2xl border border-slate-800/80 mt-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-yellow-500/5 opacity-40 pointer-events-none" />
        <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider">Airdrop Distribution Guild</p>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Tasks are validated using the TON network smart signature. DO NOT leave groups after verification, or your allocation will be disqualified during the snapshot!
        </p>
      </div>
    </div>
  );
};
