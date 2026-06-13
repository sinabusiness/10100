import React, { useState } from 'react';
import { UserStats, LeaderboardEntry } from '../types';
import { ScoreRun, TelegramUser } from '../utils/telegram';
import { getTileStyle } from '../utils/gameUtils';
import { Trophy, Medal, Crown, Sparkles, Flame, ShieldAlert, History, UserCheck, Calendar, Settings, ChevronRight, Hash, BadgeCheck } from 'lucide-react';

interface LeaderboardTabProps {
  stats: UserStats;
  scoreHistory?: ScoreRun[];
  tgUser?: TelegramUser | null;
  onUpdateSimulatedUser?: (username: string, id: string, name: string) => void;
}

export const LeaderboardTab: React.FC<LeaderboardTabProps> = ({
  stats,
  scoreHistory = [],
  tgUser = null,
  onUpdateSimulatedUser
}) => {
  const [showConfig, setShowConfig] = useState(false);
  const [simId, setSimId] = useState(tgUser?.id || '584102948');
  const [simUsername, setSimUsername] = useState(tgUser?.username || 'sinasadeghi_dev');
  const [simName, setSimName] = useState(tgUser?.name || 'Sina Sadeghi');

  // Static mock leaderboard entries mimicking TG userbase
  const baseLeaderboard: Omit<LeaderboardEntry, 'rank'>[] = [
    { name: "Pavel Durov 👑", score: 875000, isPremium: true },
    { name: "TON_Whale_99", score: 542000, isPremium: true },
    { name: "Crypto_Sultan", score: 389200 },
    { name: "SWIPE_Master_2048", score: 271500, isPremium: true },
    { name: "Degen_God", score: 198000 },
    { name: "Airdrop_Hunter_TG", score: 145000 },
    { name: "Hamster_Survivor", score: 112000, isPremium: true },
    { name: "Solana_Degenerate", score: 87400 },
    { name: "MemeCoin_Maxi", score: 62000 },
  ];

  // Insert current user in correct rank based on high score
  const displayName = tgUser ? `${tgUser.name} ${tgUser.isPremium ? '💎' : ''}` : "You (Airdrop candidate)";
  const userEntry = { name: displayName, score: stats.highScore, isUser: true, isPremium: stats.walletConnected };

  const allEntries = [...baseLeaderboard, userEntry]
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  const userRankIndex = allEntries.findIndex(e => e.isUser);
  const userRankEntry = allEntries[userRankIndex];

  // Calculate score aggregates
  const totalCompletedRunsCount = scoreHistory.length;
  const cumulativeScoreValue = scoreHistory.reduce((sum, run) => sum + run.score, 0);
  const averageRunScoreValue = totalCompletedRunsCount > 0 
    ? Math.round(cumulativeScoreValue / totalCompletedRunsCount) 
    : 0;

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSimulatedUser && simId.trim() && simName.trim()) {
      onUpdateSimulatedUser(
        simUsername.trim() || `user_${simId}`,
        simId.trim(),
        simName.trim()
      );
      setShowConfig(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-24 font-plus-jakarta max-w-lg mx-auto w-full px-1 animate-fade-in text-left">
      {/* Title block */}
      <div className="text-center py-4 relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400 animate-bounce" />
          Hall of Fame
        </h2>
        <p className="text-sm text-slate-400 mt-1">Global ranking list of airdrop league miners.</p>
      </div>

      {/* User Current Standings Sticky */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/15 border border-yellow-500/30 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-xl relative flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-400" />
            <span className="absolute -bottom-1 -right-1 bg-yellow-500 text-[9px] font-black text-slate-950 px-1 py-0.5 rounded font-mono">
              #{userRankEntry.rank}
            </span>
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
              My Rank Standing
              {tgUser?.isPremium && <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold font-mono">Premium</span>}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">High Score: <span className="font-mono text-yellow-400 font-bold">{stats.highScore.toLocaleString()}</span></p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block font-mono">My Playtime</span>
          <span className="text-xs font-bold text-white font-mono flex items-center gap-1 mt-0.5">
            <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
            {(stats.playTimeSeconds / 60).toFixed(1)} mins
          </span>
        </div>
      </div>

      {/* Telegram User Active Identity Block */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-extrabold text-slate-200">Active Telegram Profile</h3>
          </div>
          <button 
            type="button"
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-400 bg-slate-950 border border-slate-800 rounded-xl hover:text-slate-200 hover:border-slate-700 transition"
          >
            <Settings className="w-3 h-3 text-slate-500" />
            <span>ID Simulator</span>
          </button>
        </div>

        {/* Telegram parameters card */}
        <div className="bg-slate-950 border border-slate-850 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-left">
              <span className="text-[9px] text-slate-500 uppercase font-mono block">Unique TG ID</span>
              <span className="font-mono text-slate-300 font-bold tracking-tight">{tgUser?.id || 'detecting...'}</span>
            </div>
            <div className="text-left">
              <span className="text-[9px] text-slate-500 uppercase font-mono block">Username</span>
              <span className="text-slate-300 block truncate">@{tgUser?.username || 'fetching...'}</span>
            </div>
          </div>
          <div className="h-[1px] bg-slate-900 my-1" />
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-[9px] text-slate-500 uppercase font-mono block">Player Name</span>
              <span className="text-white font-bold">{tgUser?.name || 'Loading Account...'}</span>
            </div>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
              tgUser?.isReal 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
            }`}>
              {tgUser?.isReal ? <BadgeCheck className="w-3 h-3 text-emerald-400" /> : '🔌 Sandbox'} 
              {tgUser?.isReal ? 'Verified TMA Session' : 'Simulated Session'}
            </span>
          </div>
        </div>

        {/* Expandable Simulated ID modification Form */}
        {showConfig && (
          <form onSubmit={handleSimulateSubmit} className="bg-slate-950/80 border border-indigo-500/30 rounded-xl p-3 flex flex-col gap-2.5 text-xs animate-fade-in mt-1">
            <p className="text-[11px] text-indigo-300 font-semibold uppercase font-mono">Sandbox Test: Change Player ID</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-slate-400">Telegram UID</label>
                <input 
                  type="text" 
                  value={simId} 
                  onChange={e => setSimId(e.target.value.replace(/\D/g, ''))}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 font-mono text-slate-200"
                  placeholder="e.g. 584902148"
                  required
                />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] text-slate-400">Handle (@)</label>
                <input 
                  type="text" 
                  value={simUsername} 
                  onChange={e => setSimUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 font-mono text-slate-200"
                  placeholder="e.g. custom_handle"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] text-slate-400">First & Last Name</label>
              <input 
                type="text" 
                value={simName} 
                onChange={e => setSimName(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-400 text-slate-200"
                placeholder="e.g. Sina Sadeghi"
                required
              />
            </div>
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-505 text-white font-bold py-1.5 px-3 rounded text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Sync Sandbox Player & Load Scores
            </button>
          </form>
        )}
      </div>

      {/* Aggregate Score Stats for this specific Telegram player ID */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-left relative overflow-hidden">
          <span className="text-[10px] text-slate-500 uppercase font-mono block">All Completed Runs</span>
          <div className="text-xl font-bold font-mono text-white mt-1">{totalCompletedRunsCount}</div>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-left relative overflow-hidden">
          <span className="text-[10px] text-yellow-500 uppercase font-mono block">Cumulative Score</span>
          <div className="text-xl font-bold font-mono text-yellow-400 mt-1">{cumulativeScoreValue.toLocaleString()}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-left">
          <span className="text-[10px] text-cyan-400 uppercase font-mono block">Average Run</span>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{averageRunScoreValue.toLocaleString()}</div>
        </div>
      </div>

      {/* ALL SCORES GATHERED OF THIS SINGLE PLAYER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
        <h3 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
          <History className="w-4 h-4 text-purple-400" />
          <span>My Historical Runs (GATHERED BY TG UNIQUE ID)</span>
        </h3>

        {scoreHistory.length === 0 ? (
          <div className="bg-slate-950/60 rounded-xl p-6 text-center border border-slate-850 mt-1 select-none">
            <span className="text-3xl block filter saturate-50 mb-1">🎮</span>
            <p className="text-xs text-slate-400 font-medium">No completed games found for target ID.</p>
            <p className="text-[10px] text-slate-500 mt-1">Play the game and merge grid tiles to auto-gather and persist your scores here!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto no-scrollbar mt-1">
            {scoreHistory.map((run, i) => {
              const style = getTileStyle(run.level);
              return (
                <div 
                  key={`${run.date}-${run.score}-${i}`} 
                  className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 flex items-center justify-between text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-mono font-bold text-[10px]">
                      #{totalCompletedRunsCount - i}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-bold text-slate-200 font-mono text-sm">{run.score.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">pts</span></div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>{run.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Coin Style display showing max level reached in this run */}
                  <div className={`p-1.5 rounded-lg border flex items-center gap-1.5 max-w-[130px] font-sans ${style.bg} ${style.border}`}>
                    <span className="text-xs filter drop-shadow-sm">{style.icon}</span>
                    <div className="text-left leading-none">
                      <span className={`font-mono text-[10px] font-black tracking-tight block ${style.text}`}>{run.maxTile}</span>
                      <span className="text-[7px] text-slate-350 uppercase tracking-widest">{style.coinName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Leaderboard Table List */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-wider pl-1 font-mono">Global Leaderboard (Airdrop Ranks)</h3>
        
        <div className="bg-slate-900 border border-slate-850 rounded-2xl p-1.5 flex flex-col gap-1 shadow-xl">
          {allEntries.map((player) => {
            return (
              <div
                key={player.name + player.rank}
                className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                  player.isUser
                    ? 'bg-yellow-500/10 border border-yellow-500/30 relative'
                    : 'hover:bg-slate-850/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Medal Icon/Rank Text */}
                  <div className="w-7 h-7 flex items-center justify-center font-mono text-xs font-bold rounded-lg bg-slate-950 border border-slate-800">
                    {player.rank === 1 ? (
                      <Medal className="w-4 h-4 text-yellow-400" />
                    ) : player.rank === 2 ? (
                      <Medal className="w-4 h-4 text-slate-300" />
                    ) : player.rank === 3 ? (
                      <Medal className="w-4 h-4 text-amber-600" />
                    ) : (
                      <span className="text-slate-500">#{player.rank}</span>
                    )}
                  </div>

                  <div className="text-left">
                    <span className={`text-sm font-semibold flex items-center gap-1.5 ${player.isUser ? 'text-yellow-400 font-bold' : 'text-slate-200'}`}>
                      {player.name}
                      {player.isPremium && !player.isUser && (
                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {player.rank <= 3 ? 'Elite Player' : 'Challenger'}
                    </span>
                  </div>
                </div>

                {/* Score label */}
                <div className="text-right font-mono text-sm font-bold text-slate-100">
                  {player.score.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-500 italic px-4 mt-2 flex items-center justify-center gap-1.5 leading-relaxed">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 text-slate-500" />
        Snapshot takes place randomly. Leaderboard standings freeze upon listings start. Maintain your rank!
      </div>
    </div>
  );
};
