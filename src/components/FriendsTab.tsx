import React, { useState, useEffect } from 'react';
import { UserStats, ReferredFriend } from '../types';
import { 
  Users, 
  UserPlus, 
  Coins, 
  Copy, 
  Check, 
  Share2, 
  Award, 
  TrendingUp, 
  Sparkles, 
  RefreshCw, 
  ArrowUpRight, 
  MessageSquare,
  HelpCircle,
  HelpCircle as QuestionIcon
} from 'lucide-react';
import { sounds } from './SoundEffects';
import { triggerHapticFeedback } from '../utils/telegram';

interface FriendsTabProps {
  stats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
  tgUser: { id: string; username: string; name: string } | null;
}

// Key for persisting simulated friends list
const LOCAL_STORAGE_FRIENDS_KEY = 'swipe_2048_referred_friends';

export const FriendsTab: React.FC<FriendsTabProps> = ({ stats, updateStats, tgUser }) => {
  const [friends, setFriends] = useState<ReferredFriend[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'tier1' | 'tier2'>('tier1');
  const [claiming, setClaiming] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [simLog, setSimLog] = useState<string | null>(null);
  const [showHelper, setShowHelper] = useState(false);

  // Load or initialize referred friends
  useEffect(() => {
    const cached = localStorage.getItem(LOCAL_STORAGE_FRIENDS_KEY);
    if (cached) {
      setFriends(JSON.parse(cached));
    } else {
      // Default initial mocked list if they have some referrals, otherwise start empty to let them build it
      const defaultFrens: ReferredFriend[] = [];
      setFriends(defaultFrens);
    }
  }, []);

  // Save friends to localStorage whenever updated
  const saveFriends = (updatedList: ReferredFriend[]) => {
    setFriends(updatedList);
    localStorage.setItem(LOCAL_STORAGE_FRIENDS_KEY, JSON.stringify(updatedList));

    // Calculate count totals
    const countT1 = updatedList.filter(f => f.tier === 1).length;
    const countT2 = updatedList.filter(f => f.tier === 2).length;
    const totalNetScore = updatedList.reduce((sum, f) => sum + f.scoreEarned, 0);

    updateStats({
      referralsCountTier1: countT1,
      referralsCountTier2: countT2,
      referralsTotalPointsEarned: totalNetScore
    });
  };

  // Referral link builder
  const userId = tgUser?.id || '584102948';
  const referralLink = `https://t.me/swipe2048_bot/app?startapp=ref_${userId}`;

  const copyToClipboard = () => {
    sounds.playClick();
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    triggerHapticFeedback();
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaTelegram = () => {
    sounds.playClick();
    triggerHapticFeedback();
    const shareText = `🎮 Play Swipe 2048, merge high-multiplier tiles with me, and mine free $SWIPE airdrop tokens! Live now! 🚀`;
    const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    window.open(tgShareUrl, '_blank', 'noopener,noreferrer');
  };

  // Claim network commissions
  const claimCommissions = () => {
    if (stats.unclaimedReferralCommissions <= 0) return;
    
    sounds.playSuccess();
    setClaiming(true);
    triggerHapticFeedback();

    const amountToClaim = stats.unclaimedReferralCommissions;

    setTimeout(() => {
      updateStats({
        totalCoins: stats.totalCoins + amountToClaim,
        unclaimedReferralCommissions: 0,
        totalClaimedReferralCommissions: (stats.totalClaimedReferralCommissions || 0) + amountToClaim
      });
      setClaiming(false);
      setSuccessMsg(`Commissions claimed! +${amountToClaim.toLocaleString()} $SWIPE added to your balance.`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1200);
  };

  // DEVELOPER SIGN-UP SIMULATOR
  const simulateInvite = (isPremium: boolean = false) => {
    sounds.playLevelUp();
    triggerHapticFeedback();

    const directUsernames = ['ton_chad', 'crypto_queen', 'swipe_whale', 'airdrop_hunter', 'gemini_codex', 'tg_wizard', 'nodeminer_pro'];
    const randomUsername = directUsernames[Math.floor(Math.random() * directUsernames.length)] + '_' + Math.floor(Math.random() * 900 + 100);
    const randomName = randomUsername.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const newFriend: ReferredFriend = {
      id: `sim-friend-${Date.now()}`,
      name: randomName,
      username: `@${randomUsername}`,
      isPremium,
      scoreEarned: 0,
      tier: 1,
      lastPlayTimestamp: new Date().toLocaleTimeString(),
      isActiveNow: true
    };

    // Instant registration bonus for referrer (5,000 base, 15,000 for Premium)
    const inviteReward = isPremium ? 15000 : 5000;
    
    const updated = [newFriend, ...friends];
    saveFriends(updated);

    updateStats({
      totalCoins: stats.totalCoins + inviteReward,
      unclaimedReferralCommissions: stats.unclaimedReferralCommissions + (isPremium ? 1500 : 500) // extra direct sign up kickback!
    });

    setSimLog(`🎉 Simulated referral! @${randomUsername} registered. You got +${inviteReward.toLocaleString()} $SWIPE direct bonus!`);
    setTimeout(() => setSimLog(null), 6000);
  };

  // DEVELOPER SIMULATE TIER 2 REFERRAL
  const simulateTier2Invite = () => {
    const tier1Frens = friends.filter(f => f.tier === 1);
    if (tier1Frens.length === 0) {
      sounds.playClick();
      setSimLog("❌ Invite some Tier 1 friends first to let them recruit Tier 2 referrees!");
      setTimeout(() => setSimLog(null), 4000);
      return;
    }

    sounds.playLevelUp();
    triggerHapticFeedback();

    const parentFren = tier1Frens[Math.floor(Math.random() * tier1Frens.length)];
    const t2Usernames = ['ton_ninja', 'luna_defi', 'air_snip', 'swipe_minerX', 'pulse_sol', 'web3_champ'];
    const randomUsername = t2Usernames[Math.floor(Math.random() * t2Usernames.length)] + '_' + Math.floor(Math.random() * 900 + 100);
    const randomName = randomUsername.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const newFriend: ReferredFriend = {
      id: `sim-friend-t2-${Date.now()}`,
      name: randomName,
      username: `@${randomUsername}`,
      isPremium: Math.random() < 0.3,
      scoreEarned: 0,
      tier: 2,
      invitedBy: parentFren.name,
      lastPlayTimestamp: new Date().toLocaleTimeString(),
      isActiveNow: true
    };

    // Minor kickback for player when a sub-referral joins!
    const subReferralBonus = 2000;

    const updated = [newFriend, ...friends];
    saveFriends(updated);

    updateStats({
      totalCoins: stats.totalCoins + subReferralBonus,
    });

    setSimLog(`⚡ Multi-tier trigger! Your fren ${parentFren.name} invited ${newFriend.name} (Tier 2). You won +${subReferralBonus.toLocaleString()} $SWIPE!`);
    setTimeout(() => setSimLog(null), 6000);
  };

  // DEVELOPER SIMULATE FRIEND ACTIVE GAMEPLAY
  const simulateGameplay = () => {
    if (friends.length === 0) {
      sounds.playClick();
      setSimLog("❌ No friends in your network to play. Invite some using the simulator!");
      setTimeout(() => setSimLog(null), 4000);
      return;
    }

    sounds.playSuccess();
    triggerHapticFeedback();

    // Select 1 to 3 friends to increment scores
    const countToUpdate = Math.min(friends.length, Math.floor(Math.random() * 2) + 1);
    const indicesToUpdate = new Set<number>();
    
    while(indicesToUpdate.size < countToUpdate) {
      indicesToUpdate.add(Math.floor(Math.random() * friends.length));
    }

    let calculatedPlayerCommission = 0;
    let logBuffer: string[] = [];

    const nextFriends = friends.map((friend, idx) => {
      if (indicesToUpdate.has(idx)) {
        // Friend increments score by merging
        const scoreGain = Math.floor(Math.random() * 800) + 200;
        const commissionPct = friend.tier === 1 ? 0.10 : 0.05; // 10% Tier 1, 5% Tier 2
        const commissionPoints = Math.ceil(scoreGain * commissionPct);

        calculatedPlayerCommission += commissionPoints;
        logBuffer.push(`${friend.username} earned ${scoreGain} pts (+${commissionPoints} commission)`);
        
        return {
          ...friend,
          scoreEarned: friend.scoreEarned + scoreGain,
          lastPlayTimestamp: new Date().toLocaleTimeString(),
          isActiveNow: true
        };
      }
      return { ...friend, isActiveNow: Math.random() < 0.4 };
    });

    saveFriends(nextFriends);

    updateStats({
      unclaimedReferralCommissions: stats.unclaimedReferralCommissions + calculatedPlayerCommission,
      referralsTotalPointsEarned: stats.referralsTotalPointsEarned + nextFriends.reduce((sum, f) => sum + f.scoreEarned, 0) - friends.reduce((sum, f) => sum + f.scoreEarned, 0)
    });

    setSimLog(`🎮 Active network play! ${logBuffer.join(', ')}.`);
    setTimeout(() => setSimLog(null), 6000);
  };

  const filteredFriends = friends.filter(friend => 
    activeSubTab === 'tier1' ? friend.tier === 1 : friend.tier === 2
  );

  return (
    <div className="flex flex-col gap-5 pb-24 font-plus-jakarta max-w-lg mx-auto w-full px-1">
      {/* Tab head */}
      <div className="text-center py-4 relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" />
          Frens Hub
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Invite buddies and unlock passive Multi-Level earnings.
        </p>
      </div>

      {/* Success logs */}
      {successMsg && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4 text-emerald-300 text-xs text-center font-medium animate-pulse">
          {successMsg}
        </div>
      )}

      {/* Sim Log Banner */}
      {simLog && (
        <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-2xl p-3 text-indigo-300 text-xs text-center font-mono font-bold animate-fade-in">
          {simLog}
        </div>
      )}

      {/* Referral Link Sharing Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full" />
        
        <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <UserPlus className="w-4.5 h-4.5 text-indigo-400" />
          Invite Multiplier Links
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Share your custom path. When a buddy signs up, you win direct instant tokens, plus permanent royalties from all their merges!
        </p>

        {/* Copy block */}
        <div className="mt-4 flex gap-2">
          <div className="bg-slate-950 px-3.5 py-3 rounded-xl border border-slate-800 text-xs text-slate-300 truncate font-mono flex-1 text-left flex items-center">
            {referralLink}
          </div>
          
          <button
            onClick={copyToClipboard}
            className={`px-3.5 py-3 rounded-xl border font-bold text-xs transition duration-200 cursor-pointer flex items-center justify-center ${
              copied 
                ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4.5 h-4.5" />}
          </button>
        </div>

        {/* Action button share */}
        <button
          onClick={shareViaTelegram}
          className="w-full mt-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-xl text-xs transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Send Invite via Telegram Message</span>
        </button>
      </div>

      {/* Multi-Tier Commissions Tracker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 relative overflow-hidden shadow-xl text-left">
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-500/[0.03] blur-2xl rounded-full" />
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
            <Coins className="w-4.5 h-4.5 text-yellow-405" />
            My Commission Pool
          </h3>
          <button 
            onClick={() => setShowHelper(!showHelper)}
            className="text-slate-500 hover:text-slate-400 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {showHelper && (
          <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl text-[11px] text-slate-400 flex flex-col gap-1.5 mb-3">
            <p><strong>Commission Splits:</strong></p>
            <p>• <strong>Tier 1 (Direct)</strong>: Earn 10% of their total game scores from matching tile operations.</p>
            <p>• <strong>Tier 2 (Indirect)</strong>: Earn 5% of their score when direct buddies bring in their own sub-referrals.</p>
            <p className="text-yellow-400 font-medium">✨ Real-time passive income converts immediately to claims!</p>
          </div>
        )}

        {/* Multi tier stats grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4 font-mono">
          <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
            <span className="text-[9px] uppercase text-slate-500 block">Direct (T1)</span>
            <span className="text-sm font-black text-white mt-1 block">
              {stats.referralsCountTier1 || 0}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
            <span className="text-[9px] uppercase text-slate-500 block">Indirect (T2)</span>
            <span className="text-sm font-black text-slate-300 mt-1 block">
              {stats.referralsCountTier2 || 0}
            </span>
          </div>

          <div className="bg-slate-950/60 border border-slate-850 p-3 rounded-2xl">
            <span className="text-[9px] uppercase text-slate-500 block">Paid Out</span>
            <span className="text-sm font-black text-emerald-400 mt-1 block">
              {((stats.totalClaimedReferralCommissions || 0)).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Claim Bar */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850/80 flex items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] uppercase text-slate-500 font-mono font-bold block">Claimable Commissions</span>
            <div className="text-lg font-black text-yellow-400 font-mono mt-0.5 flex items-center gap-1">
              <Sparkles className={`w-4 h-4 text-yellow-405 ${stats.unclaimedReferralCommissions > 0 ? 'animate-spin' : ''}`} />
              {(stats.unclaimedReferralCommissions || 0).toLocaleString()}
              <span className="text-xs text-slate-400 font-medium font-sans ml-1">$SWIPE</span>
            </div>
          </div>

          <button
            onClick={claimCommissions}
            disabled={claiming || !stats.unclaimedReferralCommissions}
            className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition active:scale-95 duration-200 cursor-pointer ${
              stats.unclaimedReferralCommissions > 0
                ? 'bg-yellow-500 text-slate-950 hover:bg-yellow-400 shadow-md shadow-yellow-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-750'
            }`}
          >
            {claiming ? 'Securing...' : 'Claim Pools'}
          </button>
        </div>
      </div>

      {/* Network List View */}
      <div className="text-left">
        <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest mb-2.5 pl-1">
          Your Referred Network
        </h3>

        {/* Tab selection */}
        <div className="grid grid-cols-2 bg-slate-900 border border-slate-850 p-1.5 rounded-2xl mb-3 text-center select-none font-sans">
          <button
            onClick={() => setActiveSubTab('tier1')}
            className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'tier1'
                ? 'bg-slate-950 text-white shadow-inner'
                : 'text-slate-450 hover:text-slate-300'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            Tier 1 Direct (10%)
          </button>

          <button
            onClick={() => setActiveSubTab('tier2')}
            className={`py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${
              activeSubTab === 'tier2'
                ? 'bg-slate-950 text-white shadow-inner'
                : 'text-slate-450 hover:text-slate-300'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
            Tier 2 Sub (5%)
          </button>
        </div>

        {/* Filtered friends list */}
        <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto no-scrollbar">
          {filteredFriends.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-900/60 rounded-2xl py-8 px-4 text-center text-slate-500 select-none flex flex-col items-center justify-center gap-2">
              <Users className="w-8 h-8 text-slate-600 animate-pulse" />
              <p className="text-xs font-medium max-w-xs leading-normal">
                No frens registered in {activeSubTab === 'tier1' ? 'Tier 1' : 'Tier 2'} yet. 
                Invite people using your premium link or check the live Dev Demo Center below to preview network mechanics!
              </p>
            </div>
          ) : (
            filteredFriends.map((friend) => {
              const commissionVal = Math.ceil(friend.scoreEarned * (friend.tier === 1 ? 0.10 : 0.05));
              return (
                <div
                  key={friend.id}
                  className="bg-slate-900/80 border border-slate-850 p-3.5 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    {/* User profile bubble mock */}
                    <div className="w-9 h-9 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-slate-300 text-xs font-mono relative">
                      {friend.name.substring(0, 2).toUpperCase()}
                      {friend.isPremium && (
                        <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center text-[8px] text-slate-950 border border-slate-950 shadow-md" title="Telegram Premium User">
                          ★
                        </div>
                      )}
                    </div>
                    
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-100">{friend.name}</span>
                        {friend.isActiveNow && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">
                        {friend.username} {friend.tier === 2 && friend.invitedBy ? `· invited by ${friend.invitedBy}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      {friend.scoreEarned.toLocaleString()} <span className="text-[8px] text-slate-500">pts</span>
                    </span>
                    <span className="text-[10px] text-yellow-405 font-bold flex items-center gap-0.5 justify-end mt-0.5">
                      +{commissionVal.toLocaleString()} $SWIPE
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Developer Demo simulation module */}
      <div className="bg-slate-900/50 border border-indigo-950/60 rounded-3xl p-4 mt-1 text-left relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
        
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="p-1.5 bg-indigo-500/10 rounded-lg border border-indigo-500/20 text-[10px] font-bold text-indigo-400">TMA Sandbox</span>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider">
            Developer Referral Simulator
          </h4>
        </div>

        <p className="text-[10px] text-slate-400 leading-normal mb-3">
          Since testing real Telegram accounts requires multiple mobile numbers, use this sandbox panel to emulate viral flows. Verify commissions, sign-up multipliers, and real-time ledger claims instantly!
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => simulateInvite(false)}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 font-sans font-bold py-2.5 px-2 rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 cursor-pointer select-none"
          >
            <UserPlus className="w-3.5 h-3.5 text-indigo-400" />
            Invite Direct (T1)
          </button>

          <button
            onClick={simulateTier2Invite}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 font-sans font-bold py-2.5 px-2 rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 cursor-pointer select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Invite Sub-fren (T2)
          </button>

          <button
            onClick={simulateGameplay}
            className="bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 hover:border-slate-600 font-sans font-bold py-2.5 px-2 rounded-xl text-[10px] transition duration-150 flex items-center justify-center gap-1 cursor-pointer select-none"
          >
            <RefreshCw className="w-3.5 h-3.5 text-yellow-405" />
            Trigger Team play
          </button>
        </div>

        <div className="mt-2.5 border-t border-indigo-950/50 pt-2 flex items-center justify-between text-[9px] text-slate-500 font-mono">
          <span>Simulation writes direct to offline local storage</span>
          <span className="text-indigo-400">Haptics & Multipliers active ⚡</span>
        </div>
      </div>
    </div>
  );
};
