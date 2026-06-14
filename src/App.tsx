import { useState, useEffect, useRef } from 'react';
import { Tile, Task, UserStats } from './types';
import { GameGrid } from './components/GameGrid';
import { Tabs, TabType } from './components/Tabs';
import { EarnTab } from './components/EarnTab';
import { UpgradesTab } from './components/UpgradesTab';
import { LeaderboardTab } from './components/LeaderboardTab';
import { AirdropTab } from './components/AirdropTab';
import { FriendsTab } from './components/FriendsTab';
import { sounds } from './components/SoundEffects';
import {
  getValueByLevel,
  getRandomEmptyCell,
  hasAvailableMoves,
  moveTiles,
  formatTileValue
} from './utils/gameUtils';
import { 
  getTelegramUserInfo, 
  initTelegramApp, 
  saveSimulatedTelegramUser, 
  fetchAllScoresHistory, 
  saveScoreEntry, 
  ScoreRun, 
  TelegramUser,
  triggerHapticFeedback
} from './utils/telegram';
import { Send, Sparkles, Coins, Zap, Trophy, ShieldAlert, Wifi, Battery, Users, X } from 'lucide-react';

const LOCAL_STORAGE_STATS_KEY = 'swipe_2048_user_stats';
const LOCAL_STORAGE_TASKS_KEY = 'swipe_2048_tasks';
const LOCAL_STORAGE_BOARD_KEY = 'swipe_2048_active_board';
const LOCAL_STORAGE_SCORE_KEY = 'swipe_2048_active_score';

// Default stats block with Referral metrics
const DEFAULT_STATS: UserStats = {
  highScore: 0,
  totalCoins: 200, // starting balance so they can play around instantly
  playTimeSeconds: 0,
  gamesPlayed: 0,
  maxTileLevel: 1,
  walletConnected: false,
  walletAddress: null,
  dailyStreak: 0,
  lastDailyClaim: null,
  multiplierLevel: 1,
  spawnChanceLevel: 1,
  undoCredits: 5, // start with 5 complimentary undo credits!
  
  // Multi-tier referrals default
  referredByTelegramId: null,
  referralsCountTier1: 0,
  referralsCountTier2: 0,
  referralsTotalPointsEarned: 0,
  unclaimedReferralCommissions: 0,
  totalClaimedReferralCommissions: 0
};

// Default high-value tasks list
const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: 'Join SWIPE Game TG Channel', reward: 1000, icon: 'telegram', completed: false, actionUrl: 'https://t.me', type: 'telegram' },
  { id: 't2', title: 'Join official TG Community Group', reward: 1500, icon: 'telegram', completed: false, actionUrl: 'https://t.me', type: 'telegram' },
  { id: 't3', title: 'Follow SWIPE Ecosystem on X', reward: 1500, icon: 'twitter', completed: false, actionUrl: 'https://x.com', type: 'twitter' },
  { id: 't4', title: 'Retweet Airdrop Listing Announcement', reward: 2000, icon: 'twitter', completed: false, actionUrl: 'https://x.com', type: 'twitter' },
  { id: 't5', title: 'Subscribe to YT Channel & Watch Video', reward: 2000, icon: 'youtube', completed: false, actionUrl: 'https://youtube.com', type: 'youtube' },
  { id: 't6', title: 'Complete first 1k merge point target', reward: 3000, icon: 'gift', completed: false, type: 'daily' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('play');
  const [isMuted, setIsMuted] = useState(false);
  const [score, setScore] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Telegram States
  const [tgUser, setTgUser] = useState<TelegramUser | null>(null);
  const [scoreHistory, setScoreHistory] = useState<ScoreRun[]>([]);

  // Stats and task lists
  const [stats, setModelStats] = useState<UserStats>(DEFAULT_STATS);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);

  // Board undo history queue, storing arrays of cloned tiles and score states
  const [history, setHistory] = useState<{ tiles: Tile[]; score: number }[]>([]);

  // Time metrics tracker reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Keep references to state variables for synchronous access in rapid touch/keyboard gesture events
  const tilesRef = useRef<Tile[]>([]);
  const scoreRef = useRef<number>(0);
  const statsRef = useRef<UserStats>(DEFAULT_STATS);
  const gameOverRef = useRef<boolean>(false);
  const historyRef = useRef<{ tiles: Tile[]; score: number }[]>([]);

  useEffect(() => {
    tilesRef.current = tiles;
  }, [tiles]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  // Passive Referral Welcome Modal state
  const [welcomeModal, setWelcomeModal] = useState<{ isOpen: boolean; referrerName: string; rewardAmount: number } | null>(null);

  // Referral Live Toast notification state
  const [notificationToast, setNotificationToast] = useState<{ id: string; message: string } | null>(null);

  // Safe parameters wrapper
  const updateStats = (newFields: Partial<UserStats>) => {
    setModelStats((prev) => {
      const merged = { ...prev, ...newFields };
      if (merged.highScore < score) {
        merged.highScore = score;
      }
      localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(merged));
      return merged;
    });
  };

  // Synchronize dynamic scores
  useEffect(() => {
    if (score > stats.highScore) {
      updateStats({ highScore: score });
    }
  }, [score]);

  // Load persistence states on startup
  useEffect(() => {
    try {
      // Telegram Mini App initial steps
      initTelegramApp();
      const user = getTelegramUserInfo();
      setTgUser(user);
      fetchAllScoresHistory(user.id, (hist) => {
        setScoreHistory(hist);
      });

      const storedStats = localStorage.getItem(LOCAL_STORAGE_STATS_KEY);
      let parsedStats = DEFAULT_STATS;
      if (storedStats) {
        const parsed = JSON.parse(storedStats);
        parsedStats = { ...DEFAULT_STATS, ...parsed };
        setModelStats(parsedStats);
      }

      // Referral Program deep link start_param check
      const isNewUser = parsedStats.gamesPlayed === 0;
      const hasReferred = parsedStats.referredByTelegramId;
      if (user.startParam && user.startParam.startsWith('ref_') && !hasReferred && isNewUser) {
        const referrerId = user.startParam.replace('ref_', '');
        const welcomeReward = 5000;

        parsedStats = {
          ...parsedStats,
          referredByTelegramId: referrerId,
          totalCoins: parsedStats.totalCoins + welcomeReward
        };

        localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(parsedStats));
        setModelStats(parsedStats);

        setWelcomeModal({
          isOpen: true,
          referrerName: referrerId === '584102948' ? 'Sina Sadeghi' : `User #${referrerId}`,
          rewardAmount: welcomeReward
        });
        
        triggerHapticFeedback();
        sounds.playLevelUp();
      }

      const storedTasks = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }

      const storedBoard = localStorage.getItem(LOCAL_STORAGE_BOARD_KEY);
      const storedScore = localStorage.getItem(LOCAL_STORAGE_SCORE_KEY);
      if (storedBoard && storedScore !== null) {
        setTiles(JSON.parse(storedBoard));
        setScore(parseInt(storedScore, 10));
      } else {
        // Fallback initialization
        initializeGame(parsedStats);
      }
    } catch (e) {
      // Fallback
      initializeGame();
    }
  }, []);

  // Sync tasks
  useEffect(() => {
    if (tasks !== DEFAULT_TASKS) {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  // Save board status changes
  useEffect(() => {
    if (tiles.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_BOARD_KEY, JSON.stringify(tiles));
      localStorage.setItem(LOCAL_STORAGE_SCORE_KEY, score.toString());
    }
  }, [tiles, score]);

  // Handle periodic Active Time Counter running every 1 second, and passive referral generation!
  useEffect(() => {
    let tickCount = 0;
    timerRef.current = setInterval(() => {
      tickCount++;

      setModelStats((prev) => {
        const nextTime = prev.playTimeSeconds + 1;
        let nextUnclaimed = prev.unclaimedReferralCommissions;
        let coinBonus = 0;
        let simulatedMsg = "";

        // Passive referral commissions ticking (check every 15 seconds)
        if (tickCount % 15 === 0 && (prev.referralsCountTier1 > 0 || prev.referralsCountTier2 > 0)) {
          // 40% probability of active referred person making a merge
          if (Math.random() < 0.40) {
            const isTier1 = prev.referralsCountTier2 === 0 || Math.random() < 0.65;
            if (isTier1 && prev.referralsCountTier1 > 0) {
              const scoreGained = Math.floor(Math.random() * 400) + 150;
              coinBonus = Math.ceil(scoreGained * 0.10); // 10% royalty commission rate
              nextUnclaimed += coinBonus;
              simulatedMsg = `Passive Fren: +${coinBonus} $SWIPE earned from direct buddy merge! ⚡`;
            } else if (!isTier1 && prev.referralsCountTier2 > 0) {
              const scoreGained = Math.floor(Math.random() * 300) + 100;
              coinBonus = Math.ceil(scoreGained * 0.05); // 5% tier 2 royalty commission rate
              nextUnclaimed += coinBonus;
              simulatedMsg = `Network Royalty: +${coinBonus} $SWIPE earned from Tier 2 play! 👑`;
            }
          }
        }

        const updated = { 
          ...prev, 
          playTimeSeconds: nextTime,
          unclaimedReferralCommissions: nextUnclaimed
        };
        localStorage.setItem(LOCAL_STORAGE_STATS_KEY, JSON.stringify(updated));

        if (simulatedMsg) {
          triggerHapticFeedback();
          // Trigger a beautiful, temporary sliding in-app notification
          setNotificationToast({
            id: `toast-${Date.now()}`,
            message: simulatedMsg
          });
          // Auto fade after 4.5 seconds
          setTimeout(() => {
            setNotificationToast(null);
          }, 4500);
        }

        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Play Sound toggler
  const toggleMute = () => {
    const nextMuted = sounds.toggleMute();
    setIsMuted(nextMuted);
  };

  // Roll starting values relative to upgrade parameters (Lucky spawn probability chance)
  const rollTileLevel = (overrideStats?: UserStats) => {
    const targetStats = overrideStats || stats;
    // level 1: 10, level 2: 100. Spawn chance level 1 -> 10% chance of 100, level 5 -> 50% chance of 100.
    const rolled = Math.random() < (targetStats.spawnChanceLevel * 0.1);
    return rolled ? 2 : 1;
  };

  // Core grid initial setup
  const initializeGame = (overrideStats?: UserStats) => {
    sounds.playClick();

    // Auto-save active progress to the player's unique Telegram score history before resetting boards
    if (score > 0 && !gameOver && tgUser) {
      const maxLvlInGrid = tiles.length > 0 ? Math.max(...tiles.map(t => t.level)) : stats.maxTileLevel;
      const maxTileValueStr = formatTileValue(getValueByLevel(maxLvlInGrid));
      saveScoreEntry(tgUser.id, score, maxLvlInGrid, maxTileValueStr, (updatedHist) => {
        setScoreHistory(updatedHist);
      });
    }
    
    // Grid Setup (Spawn exactly 2 starter tiles placed on random empty spots)
    const activeStats = overrideStats || stats;
    const cell1 = getRandomEmptyCell([]);
    if (!cell1) return;

    const level1 = rollTileLevel(activeStats);
    const tile1: Tile = {
      id: `tile-${Date.now()}-1`,
      value: getValueByLevel(level1),
      level: level1,
      row: cell1.row,
      col: cell1.col,
      isNew: true
    };

    const cell2 = getRandomEmptyCell([tile1]);
    if (!cell2) {
      setTiles([tile1]);
      setScore(0);
      setHistory([]);
      setGameOver(false);
      return;
    }

    const level2 = rollTileLevel(activeStats);
    const tile2: Tile = {
      id: `tile-${Date.now()}-2`,
      value: getValueByLevel(level2),
      level: level2,
      row: cell2.row,
      col: cell2.col,
      isNew: true
    };

    setTiles([tile1, tile2]);
    setScore(0);
    setHistory([]);
    setGameOver(false);
    updateStats({ gamesPlayed: stats.gamesPlayed + 1 });
  };

  // Movement Trigger Execution
  const handleMove = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOverRef.current) return;

    const currentTiles = tilesRef.current;
    const currentScore = scoreRef.current;
    const currentStats = statsRef.current;

    // Simulate shifts
    const result = moveTiles(currentTiles, direction);

    if (result.hasMoved) {
      // Record historical undo reference state
      const preMoveTiles = currentTiles.map(t => ({ ...t }));
      setHistory(prev => {
        const nextHist = [...prev, { tiles: preMoveTiles, score: currentScore }];
        // Cap history depth to 15 slots for performance
        if (nextHist.length > 15) {
          nextHist.shift();
        }
        return nextHist;
      });

      // Update positions
      let nextTiles = result.newTiles;

      // Apply upgrades permanent multiplier score
      const totalEarnedPoints = result.scoreIncrement * currentStats.multiplierLevel;
      const nextScore = currentScore + totalEarnedPoints;

      // Trigger standard swipe chime
      if (result.scoreIncrement > 0) {
        sounds.playMerge();
        // Credit extra $SWIPE values to user total profile pool
        updateStats({
          totalCoins: currentStats.totalCoins + totalEarnedPoints
        });
      } else {
        sounds.playMove();
      }

      // Spawn exactly one new random tile
      const emptySpot = getRandomEmptyCell(nextTiles);
      if (emptySpot) {
        const spawnLevel = rollTileLevel(currentStats);
        const spawnedTile: Tile = {
          id: `tile-spawn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          value: getValueByLevel(spawnLevel),
          level: spawnLevel,
          row: emptySpot.row,
          col: emptySpot.col,
          isNew: true
        };
        nextTiles = [...nextTiles, spawnedTile];
      }

      setTiles(nextTiles);
      setScore(nextScore);

      // Analyze maximum tile reached dynamically
      const maxLvlInGrid = Math.max(...nextTiles.map(t => t.level));
      if (maxLvlInGrid > currentStats.maxTileLevel) {
        updateStats({ maxTileLevel: maxLvlInGrid });
        sounds.playLevelUp();
      }

      // Check tasks goals (1k merge point trigger)
      if (nextScore >= 1000) {
        setTasks(prev => prev.map(t => {
          if (t.id === 't6' && !t.completed) {
            updateStats({ totalCoins: currentStats.totalCoins + t.reward });
            return { ...t, completed: true };
          }
          return t;
        }));
      }

      // Audit potential future moves
      if (!hasAvailableMoves(nextTiles)) {
        setGameOver(true);
        triggerHapticFeedback();
        if (tgUser) {
          const maxTileValueStr = formatTileValue(getValueByLevel(maxLvlInGrid));
          saveScoreEntry(tgUser.id, nextScore, maxLvlInGrid, maxTileValueStr, (updatedHist) => {
            setScoreHistory(updatedHist);
          });
        }
      }
    }
  };

  // Board undo logic
  const handleUndo = () => {
    const currentStats = statsRef.current;
    const currentHistory = historyRef.current;
    if (currentStats.undoCredits <= 0 || currentHistory.length === 0) return;

    sounds.playMove();
    const lastState = currentHistory[currentHistory.length - 1];
    setTiles(lastState.tiles);
    setScore(lastState.score);
    setGameOver(false);

    // Consume undo credit
    updateStats({
      undoCredits: currentStats.undoCredits - 1
    });

    setHistory(prev => prev.slice(0, prev.length - 1));
  };

  // Synchronously swap targeted Telegram player details to sandbox test individual results
  const handleUpdateSimulatedUser = (username: string, id: string, name: string) => {
    const updated = { id, username, name, isReal: false };
    saveSimulatedTelegramUser(updated);
    setTgUser(updated);
    fetchAllScoresHistory(id, (histList) => {
      setScoreHistory(histList);
    });
  };

  // Keyboard navigation Hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'play' || gameOverRef.current) return;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  // Assess if daily has unclaimed status today
  const hasUnclaimedDaily = stats.lastDailyClaim !== new Date().toDateString();

  return (
    <div className="h-screen h-[100dvh] w-full bg-slate-950 flex items-center justify-center p-0 md:p-4 text-slate-100 antialiased overflow-hidden selection:bg-yellow-500/30 selection:text-white">
      {/* Immersive Telegram Smartphone Mock Frame */}
      <div className="w-full max-w-lg h-full max-h-screen max-h-[100dvh] md:h-[812px] md:max-h-[850px] bg-slate-950 md:rounded-[40px] md:border-4 md:border-slate-900 shadow-2xl relative flex flex-col overflow-hidden">
        {/* Telephone top status bar mimic */}
        <div className="bg-slate-950 px-6 pt-3 pb-1.5 flex justify-between items-center z-50 text-xs text-slate-500 font-mono font-bold select-none border-b border-slate-900/40">
          <div className="flex items-center gap-1">
            <span>12:45</span>
            <span className="text-[10px] text-yellow-500/80 uppercase">● SWIPE MINER</span>
          </div>
          <div className="w-20 h-4.5 bg-slate-900 rounded-full border border-slate-800/50 flex items-center justify-center text-[10px] text-slate-500">
            Mini App
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3.5 h-3.5 text-slate-500" />
            <Battery className="w-4 h-4 text-emerald-500" fill="currentColor" />
          </div>
        </div>

        {/* Telegram active app bar */}
        <div className="bg-slate-950 px-5 py-3 border-b border-slate-900 flex items-center justify-between z-40 select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-linear-to-br from-yellow-400 to-amber-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md border border-yellow-300">
              ⚡
            </div>
            <div className="text-left">
              <h1 className="text-13px font-extrabold tracking-tight text-white flex items-center gap-1.5 justify-start">
                2048 SWIPE Coin
                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">Airdrop Distribution League</p>
            </div>
          </div>

          {/* Quick $SWIPE profile status ticker */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-800 py-1 px-2.5 rounded-full select-none">
            <Coins className="w-4 h-4 text-yellow-400" />
            <span className="text-xs font-mono font-black text-slate-100">{stats.totalCoins.toLocaleString()}</span>
          </div>
        </div>

        {/* Core dynamic body screen wrapper */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-20 z-10 bg-radial-gradient">
          {activeTab === 'play' && (
            <div className="flex flex-col gap-4 animate-fade-in animate-once duration-300">
              {/* Promotional Telegram Header card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 text-left relative overflow-hidden shadow-lg shadow-indigo-950/10">
                <div className="absolute -right-3 -bottom-3 w-28 h-28 bg-yellow-500/[0.03] blur-2xl rounded-full" />
                <p className="text-[11px] text-yellow-400 font-extrabold uppercase tracking-wider">Airdrop Live Mining</p>
                <h3 className="text-base font-bold text-white mt-1 leading-tight max-w-xs md:max-w-md">
                  Combine matching multiplier coins to unlock the high-tier <span className="text-yellow-400">100b Galactic Star</span> and forge onwards to <span className="text-indigo-400">Trillions, Quadrillions, & Infinite Omega</span>!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Earned points are converted directly to Mainnet $SWIPE tokens on Listings date.
                </p>
              </div>

              {/* Functional Grid Matrix */}
              <GameGrid
                tiles={tiles}
                onMove={handleMove}
                undoCredits={stats.undoCredits}
                onUndo={handleUndo}
                onReset={() => initializeGame()}
                score={score}
                highScore={stats.highScore}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                gameOver={gameOver}
              />
            </div>
          )}

          {activeTab === 'friends' && (
            <FriendsTab
              stats={stats}
              updateStats={updateStats}
              tgUser={tgUser}
            />
          )}

          {activeTab === 'earn' && (
            <EarnTab
              stats={stats}
              updateStats={updateStats}
              tasks={tasks}
              setTasks={setTasks}
            />
          )}

          {activeTab === 'upgrades' && (
            <UpgradesTab
              stats={stats}
              updateStats={updateStats}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardTab 
              stats={stats}
              scoreHistory={scoreHistory}
              tgUser={tgUser}
              onUpdateSimulatedUser={handleUpdateSimulatedUser}
            />
          )}

          {activeTab === 'airdrop' && (
            <AirdropTab
              stats={stats}
              updateStats={updateStats}
            />
          )}
        </div>

        {/* Live Passive Commission Multi-Tier Toast Alert */}
        {notificationToast && (
          <div className="absolute top-16 right-4 left-4 bg-slate-900/95 border border-indigo-500/30 backdrop-blur-xs shadow-2xl rounded-2xl p-3 z-45 flex items-center gap-2.5 text-left font-sans text-xs animate-fade-in select-none">
            <span className="p-1 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-xs">⚡</span>
            <p className="font-semibold text-slate-200 leading-snug flex-1 text-[11px]">
              {notificationToast.message}
            </p>
            <button 
              onClick={() => setNotificationToast(null)}
              className="text-slate-500 hover:text-slate-300 cursor-pointer p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Start-param Referral Welcome Modal */}
        {welcomeModal?.isOpen && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-slate-900 border-2 border-indigo-500/30 rounded-3xl p-6 w-full max-w-xs shadow-2xl relative text-center">
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16 h-16 bg-indigo-500/10 border-2 border-indigo-500 rounded-full flex items-center justify-center text-2xl animate-bounce">
                🎁
              </div>
              
              <button 
                onClick={() => setWelcomeModal(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-sm font-extrabold text-white mt-6 uppercase tracking-wider">Referral Welcome!</h3>
              <p className="text-xs text-slate-400 mt-2">
                You were invited to swipe by <span className="text-indigo-400 font-bold">{welcomeModal.referrerName}</span>.
              </p>

              <div className="my-4 bg-indigo-950/20 border border-indigo-900/50 p-3.5 rounded-2xl">
                <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block">Instant Mining Gift</span>
                <span className="text-xl font-black text-yellow-405 font-mono block mt-1">
                  +{welcomeModal.rewardAmount.toLocaleString()} $SWIPE
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-normal">
                Gift added! Solve merging combos, load multipliers, and invite buddies of your own to compile royalty streams!
              </p>

              <button
                onClick={() => setWelcomeModal(null)}
                className="w-full mt-4 bg-indigo-600 hover:bg-indigo-550 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                Start Mining
              </button>
            </div>
          </div>
        )}

        {/* Dynamic TMA custom Bottom footer tabs navigation */}
        <Tabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          hasUnclaimedDaily={hasUnclaimedDaily}
          walletConnected={stats.walletConnected}
        />
      </div>
    </div>
  );
}
