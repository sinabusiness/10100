export interface ScoreRun {
  score: number;
  date: string;
  maxTile: string;
  level: number;
}

export interface TelegramUser {
  id: string; // unique telegram ID
  username: string; // handles
  name: string; // full display name
  isPremium?: boolean;
  isReal: boolean; // false if simulated fallback
  startParam?: string | null; // Deep-linked parameter, e.g. ref_123456
}

// Access the global Telegram WebApp from index.html
const getTGObject = () => {
  if (typeof window !== 'undefined') {
    return (window as any).Telegram?.WebApp;
  }
  return null;
};

// Check if currently running inside real Telegram
export function isRunningInTelegram(): boolean {
  const tg = getTGObject();
  return !!(tg && tg.initData);
}

// Check if Telegram CloudStorage is supported (requires WebApp version 6.9+)
export function isCloudStorageSupported(): boolean {
  const tg = getTGObject();
  if (!tg) return false;
  try {
    if (typeof tg.isVersionAtLeast === 'function') {
      return tg.isVersionAtLeast('6.9');
    }
  } catch (e) {
    console.warn("Error checking version capability:", e);
  }
  return false;
}

// Trigger Telegram Haptic Feedback if available
export function triggerHapticFeedback() {
  const tg = getTGObject();
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('medium');
  }
}

// Safe wrapper for initializing the Telegram back-channel
export function initTelegramApp() {
  const tg = getTGObject();
  if (tg) {
    try {
      tg.ready();
      tg.expand();
    } catch (e) {
      console.warn("Telegram WebApp initialization error:", e);
    }
  }
}

// Get the user's primary identifiers or fall back to simulation
export function getTelegramUserInfo(): TelegramUser {
  const tg = getTGObject();
  const user = tg?.initDataUnsafe?.user;
  
  // Extract startParam from native WebApp unsafe fields or from query strings
  let startParam: string | null = null;
  if (tg?.initDataUnsafe?.start_param) {
    startParam = tg.initDataUnsafe.start_param;
  } else if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    startParam = urlParams.get('tgWebAppStartParam') || urlParams.get('start_param') || urlParams.get('startapp');
  }

  if (user) {
    return {
      id: user.id.toString(),
      username: user.username || `user_${user.id}`,
      name: `${user.first_name} ${user.last_name || ''}`.trim(),
      isPremium: !!user.is_premium,
      isReal: true,
      startParam
    };
  }

  // Fallback / simulation for local development or sandbox previews
  // We check if has been saved in localStorage simulation settings first
  try {
    const simulated = localStorage.getItem('swipe_2048_sim_tg_user');
    if (simulated) {
      const parsed = JSON.parse(simulated);
      return { ...parsed, startParam: parsed.startParam || startParam };
    }
  } catch (e) {}

  return {
    id: '584102948', // realistic format
    username: 'sinasadeghi_dev',
    name: 'Sina Sadeghi',
    isPremium: false,
    isReal: false,
    startParam
  };
}

// Update the simulated profile info in browser preview
export function saveSimulatedTelegramUser(user: Omit<TelegramUser, 'isReal'>) {
  try {
    localStorage.setItem(
      'swipe_2048_sim_tg_user',
      JSON.stringify({ ...user, isReal: false })
    );
  } catch (e) {}
}

const LOCAL_STORAGE_SCORES_HISTORY_PREFIX = 'swipe_2048_score_history_';

// Gather all previous score entries from both Telegram CloudStorage and browser LocalStorage
export function fetchAllScoresHistory(
  userId: string,
  onLoaded: (history: ScoreRun[]) => void
) {
  // 1. Fetch from browser LocalStorage immediately for instant UI render
  let localList: ScoreRun[] = [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_SCORES_HISTORY_PREFIX}${userId}`);
    if (raw) {
      localList = JSON.parse(raw);
    }
  } catch (e) {
    console.warn("LocalStorage score fetch error:", e);
  }

  // 2. Query Telegram CloudStorage (persisted on TG's cloud servers per user session)
  const tg = getTGObject();
  if (isCloudStorageSupported() && tg?.CloudStorage) {
    const cloudKey = `scores_${userId}`;
    try {
      tg.CloudStorage.getItem(cloudKey, (error: any, result: string | null) => {
        if (!error && result) {
          try {
            const cloudList: ScoreRun[] = JSON.parse(result);
            if (Array.isArray(cloudList) && cloudList.length > 0) {
              // Merge lists preserving unique items (highest scoring runs or simply sort of matching dates)
              const mergedMap = new Map<string, ScoreRun>();
              // Local items first
              localList.forEach(item => {
                const mapKey = `${item.date}_${item.score}`;
                mergedMap.set(mapKey, item);
              });
              // Cloud items override
              cloudList.forEach(item => {
                const mapKey = `${item.date}_${item.score}`;
                mergedMap.set(mapKey, item);
              });

              const mergedList = Array.from(mergedMap.values()).sort(
                (a, b) => b.score - a.score
              );

              // Update local cache
              localStorage.setItem(
                `${LOCAL_STORAGE_SCORES_HISTORY_PREFIX}${userId}`,
                JSON.stringify(mergedList)
              );
              onLoaded(mergedList);
              return;
            }
          } catch (e) {
            console.error("Failed to parse cloud storage scores value:", e);
          }
        }
        onLoaded(localList);
      });
      return;
    } catch (e) {
      console.warn("Telegram CloudStorage failed:", e);
    }
  }

  onLoaded(localList);
}

// Save a brand new score entry inside history
export function saveScoreEntry(
  userId: string,
  score: number,
  level: number,
  maxTile: string,
  onSaved?: (updatedHistory: ScoreRun[]) => void
) {
  if (score <= 0) return;

  // Gather current ones
  fetchAllScoresHistory(userId, (currentHistory) => {
    // Add new entry
    const newEntry: ScoreRun = {
      score,
      maxTile,
      level,
      date: new Date().toLocaleString(),
    };

    // Filter out potential duplicates or just keep recent 150 runs (TG has 4KB limit per key-value item)
    const nextHistory = [newEntry, ...currentHistory]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // limit to top 50 games for high performance

    // Save back to LocalStorage
    try {
      localStorage.setItem(
        `${LOCAL_STORAGE_SCORES_HISTORY_PREFIX}${userId}`,
        JSON.stringify(nextHistory)
      );
    } catch (e) {}

    // Save to Telegram CloudStorage key 'scores_<id>'
    const tg = getTGObject();
    if (isCloudStorageSupported() && tg?.CloudStorage) {
      const cloudKey = `scores_${userId}`;
      try {
        tg.CloudStorage.setItem(
          cloudKey,
          JSON.stringify(nextHistory),
          (error: any, success: boolean) => {
            if (error) {
              console.warn("Telegram cloud storage save failed:", error);
            }
          }
        );
      } catch (e) {}
    }

    if (onSaved) {
      onSaved(nextHistory);
    }
  });
}
