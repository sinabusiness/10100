import React from 'react';
import { Gamepad2, Zap, Gift, Trophy, Wallet } from 'lucide-react';
import { sounds } from './SoundEffects';

export type TabType = 'play' | 'upgrades' | 'earn' | 'leaderboard' | 'airdrop';

interface TabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  hasUnclaimedDaily: boolean;
  walletConnected: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  activeTab,
  setActiveTab,
  hasUnclaimedDaily,
  walletConnected
}) => {
  const tabsList = [
    { id: 'play', label: 'Play', icon: Gamepad2, activeColor: 'text-amber-400' },
    { id: 'upgrades', label: 'Boosters', icon: Zap, activeColor: 'text-cyan-400' },
    { id: 'earn', label: 'Earn Hub', icon: Gift, activeColor: 'text-yellow-400', badge: hasUnclaimedDaily },
    { id: 'leaderboard', label: 'Hall', icon: Trophy, activeColor: 'text-emerald-450' },
    { id: 'airdrop', label: 'Airdrop', icon: Wallet, activeColor: 'text-purple-400', dot: !walletConnected }
  ] as const;

  const handleTabClick = (tabId: TabType) => {
    sounds.playClick();
    setActiveTab(tabId);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 bg-slate-950/95 backdrop-blur-md border-t border-slate-900 px-4 py-2 z-40 max-w-lg mx-auto w-full font-plus-jakarta select-none">
      <div className="flex justify-between items-center gap-1">
        {tabsList.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition relative group cursor-pointer"
            >
              {/* Active backing highlight pill */}
              {isActive && (
                <span className="absolute inset-x-2 -top-0.5 h-0.5 rounded-full bg-linear-to-r from-yellow-500 to-indigo-500 opacity-80" />
              )}

              {/* Icon component */}
              <div className="relative">
                <Icon
                  className={`w-[22px] h-[22px] transition ${
                    isActive ? tab.activeColor : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                />
                
                {/* Red warning-badge representing unclaimed rewards */}
                {'badge' in tab && tab.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-[10px] text-white font-extrabold flex items-center justify-center rounded-full border border-slate-950 font-mono animate-pulse">
                    !
                  </span>
                )}

                {/* Subtle notification dots for uncompleted tasks */}
                {'dot' in tab && tab.dot && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-purple-400 rounded-full border border-slate-950 animate-ping" />
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-bold mt-1 tracking-tight transition ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
