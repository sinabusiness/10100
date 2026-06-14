export interface Tile {
  id: string;
  value: number; // e.g. 10, 100, 1000...
  level: number; // e.g. 1, 2, 3...
  row: number;    // 0 to 3
  col: number;    // 0 to 3
  isNew?: boolean;
  isMerged?: boolean;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  icon: string;
  completed: boolean;
  actionUrl?: string;
  type: 'telegram' | 'twitter' | 'youtube' | 'wallet' | 'daily';
}

export interface Upgrade {
  id: string;
  title: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  isUser?: boolean;
  isPremium?: boolean;
}

export interface UserStats {
  highScore: number;
  totalCoins: number; // Accumulated scores + task rewards
  playTimeSeconds: number;
  gamesPlayed: number;
  maxTileLevel: number; // Level 1 (10), Level 2 (100)...
  walletConnected: boolean;
  walletAddress: string | null;
  dailyStreak: number;
  lastDailyClaim: string | null; // Date string
  multiplierLevel: number; // Score multiplier level
  spawnChanceLevel: number; // Start game tile level spawn upgrade
  undoCredits: number;
  
  // Multi-tier Referral Program Metrics
  referredByTelegramId?: string | null;
  referralsCountTier1: number; // Direct invitations (Tier 1 frens)
  referralsCountTier2: number; // Indirect invitations (Tier 2 frens)
  referralsTotalPointsEarned: number; // Combined total coins produced by network
  unclaimedReferralCommissions: number; // Current claimable idle points pool
  totalClaimedReferralCommissions: number; // Historically converted commissions
}

export interface ReferredFriend {
  id: string;
  name: string;
  username: string;
  isPremium?: boolean;
  scoreEarned: number;
  tier: 1 | 2;
  invitedBy?: string; // name of Tier 1 friend who recruited them (for Tier 2 frens)
  lastPlayTimestamp: string;
  isActiveNow?: boolean;
}

