import React, { useState } from 'react';
import { UserStats } from '../types';
import { Wallet, Check, AlertCircle, ArrowUpRight, TrendingUp, HelpCircle, Coins, ShieldCheck, Sparkles, Download, Image as ImageIcon } from 'lucide-react';
import { sounds } from './SoundEffects';

import bannerNew from '../assets/images/swipe_telegram_banner_1781338861218.jpg';
import bannerGold from '../assets/images/swipe_promo_banner_1781336533018.jpg';

interface AirdropTabProps {
  stats: UserStats;
  updateStats: (newStats: Partial<UserStats>) => void;
}

export const AirdropTab: React.FC<AirdropTabProps> = ({ stats, updateStats }) => {
  const [addressInput, setAddressInput] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [showHelper, setShowHelper] = useState(false);
  const [downloadingBanner, setDownloadingBanner] = useState<string | null>(null);

  const downloadBannerSized = (imgSrc: string, nameTag: string) => {
    sounds.playClick();
    setDownloadingBanner(nameTag);
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imgSrc;
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, 640, 360);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
          
          const link = document.createElement('a');
          link.download = `swipe2048_${nameTag}_640x360.jpg`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          sounds.playSuccess();
        }
      } catch (err) {
        console.error("Canvas export failed:", err);
        const link = document.createElement('a');
        link.download = `swipe2048_${nameTag}_640x360.jpg`;
        link.href = imgSrc;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } finally {
        setDownloadingBanner(null);
      }
    };

    img.onerror = () => {
      const link = document.createElement('a');
      link.download = `swipe2048_${nameTag}_640x360.jpg`;
      link.href = imgSrc;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadingBanner(null);
    };
  };

  const mockConnect = () => {
    sounds.playClick();
    setConnecting(true);

    setTimeout(() => {
      // Create a deterministic mock TON address
      const randomHex = Math.random().toString(36).substring(2, 10).toUpperCase();
      const mockAddr = `EQA7_v0${randomHex}z4P9_kQ_TON_` + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      updateStats({
        walletConnected: true,
        walletAddress: mockAddr,
        totalCoins: stats.totalCoins + 2500 // reward for connecting wallet!
      });
      setConnecting(false);
      sounds.playSuccess();
    }, 1800);
  };

  const manualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim()) return;
    
    sounds.playClick();
    setConnecting(true);

    setTimeout(() => {
      updateStats({
        walletConnected: true,
        walletAddress: addressInput.trim(),
        totalCoins: stats.totalCoins + 2500
      });
      setConnecting(false);
      sounds.playSuccess();
    }, 1500);
  };

  const disconnectWallet = () => {
    sounds.playClick();
    updateStats({
      walletConnected: false,
      walletAddress: null
    });
  };

  // Formula matching $SWIPE metrics to USD/Tokens
  const estimatedTokens = stats.totalCoins * 0.12 + stats.highScore * 0.35 + (stats.playTimeSeconds * 0.05);
  // Estimate value: $0.005 per token
  const estimatedValueUsd = estimatedTokens * 0.0065;

  return (
    <div className="flex flex-col gap-5 pb-24 font-plus-jakarta max-w-lg mx-auto w-full px-1">
      {/* Premium header logo */}
      <div className="text-center py-4 relative">
        <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          <Wallet className="w-6 h-6 text-purple-400 animate-pulse" />
          Airdrop Station
        </h2>
        <p className="text-sm text-slate-400 mt-1">Connect your TON signature wallet to guarantee qualifying rights.</p>
      </div>

      {/* Wallet interactive terminal */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-2xl rounded-full" />
        
        {stats.walletConnected ? (
          <div className="flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1 rounded-full">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Connected
              </span>
              <button
                onClick={disconnectWallet}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition"
              >
                Disconnect
              </button>
            </div>

            <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 font-mono text-center">
              <p className="text-[10px] text-slate-500 text-left mb-1 uppercase tracking-wider">TON Wallet Signature</p>
              <div className="text-xs text-slate-350 truncate">{stats.walletAddress}</div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2 text-xs text-emerald-300">
              <Check className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>Wallet linked successfully! +2,500 $SWIPE bonus applied to your miner account. You are eligible for snapshot.</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20 w-14 h-14 flex items-center justify-center">
              <Wallet className="w-7 h-7 text-purple-400" />
            </div>
            
            <div>
              <h3 className="text-base font-bold text-slate-100">Connect Telegram Wallet</h3>
              <p className="text-xs text-slate-400 mt-1">Connect your TON signature or manually paste your compatible address below.</p>
            </div>

            {/* Quick Generator */}
            <button
              onClick={mockConnect}
              disabled={connecting}
              className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-505 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-purple-500/15 flex items-center justify-center gap-2"
            >
              {connecting ? (
                <span>Securing contract channel...</span>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect via Telegram Wallet (Instant)</span>
                </>
              )}
            </button>

            <div className="flex items-center my-1">
              <div className="h-[1px] bg-slate-800 flex-1" />
              <span className="text-[10px] text-slate-500 font-mono mx-3">OR TYPE ADDRESS</span>
              <div className="h-[1px] bg-slate-800 flex-1" />
            </div>

            {/* Manual input form */}
            <form onSubmit={manualConnect} className="flex gap-2">
              <input
                type="text"
                placeholder="Paste compatible TON address EQ..."
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 flex-1 focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                type="submit"
                disabled={connecting || !addressInput.trim()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-755 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Link
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Estimation metrics */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-left flex flex-col gap-4 relative">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-1.5 uppercase">
            <Coins className="w-4 h-4 text-yellow-400" /> Airdrop Share Valuation
          </h3>
          <button onClick={() => setShowHelper(!showHelper)} className="text-slate-500 hover:text-slate-350">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {showHelper && (
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-[11px] text-slate-400 flex flex-col gap-1">
            <p><strong>How allocation is calculated:</strong></p>
            <p>• Total Coins metric contributes 12% factor.</p>
            <p>• High Score provides 35% performance factor.</p>
            <p>• Playtime provides 0.05 tokens per minute miners remain productive.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 bg-yellow-500/[0.03] blur-md rounded-full" />
            <span className="text-[10px] uppercase text-slate-500 font-mono">Estimated $SWIPE</span>
            <div className="text-xl font-black text-yellow-400 mt-1 font-mono">
              {Math.floor(estimatedTokens).toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400 block mt-1 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> Listing Factor
            </span>
          </div>

          <div className="bg-slate-950/50 border border-slate-850 p-4 rounded-2xl text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/[0.03] blur-md rounded-full" />
            <span className="text-[10px] uppercase text-slate-500 font-mono">Estimated Value (USD)</span>
            <div className="text-xl font-black text-emerald-400 mt-1 font-mono">
              ${estimatedValueUsd.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Based on simulated pool rate</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 justify-center border-t border-slate-850 pt-3">
          <ArrowUpRight className="w-4 h-4 text-yellow-400" />
          Earn more multipliers by keeping your daily active streak alive!
        </div>
      </div>

      {/* Airdrop phases / roadmap */}
      <div className="text-left">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 pl-1">Airdrop Phases</h3>
        
        <div className="flex flex-col gap-2 font-sans">
          {/* Phase 1: Mine */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-extrabold text-white">Interactive Token Mining</h4>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">Active</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Merge grid tiles to generate points and climb leaderboard rungs.</p>
            </div>
          </div>

          {/* Phase 2: Snap */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex gap-3 items-start opacity-75">
            <div className="w-5 h-5 rounded-full bg-yellow-500/10 border border-yellow-500/40 text-[10px] font-mono font-bold text-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-semibold text-slate-300">Wallet Snapshot Verification</h4>
                <span className="text-[9px] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.2 rounded font-mono">Q3 2026</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">All linked wallet chains locked. Anti-sybil verification scans executed.</p>
            </div>
          </div>

          {/* Phase 3: Listings */}
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex gap-3 items-start opacity-50">
            <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-mono font-bold text-slate-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-normal text-slate-400">Mainnet Listing & Claim</h4>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">Q4 2026</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Deploy tokens directly to non-custodial wallet balances. Official DEX transactions commence.</p>
            </div>
          </div>
        </div>
      </div>

      {/* TMA Mini-App Marketing Kit Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 text-left flex flex-col gap-4 relative mt-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full" />
        
        <div>
          <h3 className="font-extrabold text-sm text-slate-200 flex items-center gap-1.5 uppercase">
            <ImageIcon className="w-4 h-4 text-indigo-400" /> TMA Mini-App Marketing Kit
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            Download game banners resized and optimized to meet BotFather's requirement of **exactly 640x360 pixels**.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Banner 1: Supercharged Blast */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex flex-col gap-3">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800">
              <img 
                src={bannerNew} 
                alt="SWIPE 2048 Supercharged Blast" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 bg-indigo-500/80 backdrop-blur-xs text-[9px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Featured 16:9
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Supercharged Blast Banner</h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> Sized: exactly 640 x 360 px
                </span>
              </div>
              
              <button
                onClick={() => downloadBannerSized(bannerNew, 'supercharged')}
                disabled={downloadingBanner !== null}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition duration-200 flex items-center gap-1.5 shadow-lg shadow-indigo-600/15 cursor-pointer"
              >
                {downloadingBanner === 'supercharged' ? (
                  <span className="animate-pulse">Resizing...</span>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Banner 2: Cosmic Golden Sparkle */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-850 flex flex-col gap-3">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800">
              <img 
                src={bannerGold} 
                alt="SWIPE 2048 Cosmic Golden Sparkle" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-2 left-2 bg-amber-500/80 backdrop-blur-xs text-[9px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Theme Gold
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cosmic Golden Sparkle</h4>
                <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                  <Check className="w-3 h-3" /> Sized: exactly 640 x 360 px
                </span>
              </div>
              
              <button
                onClick={() => downloadBannerSized(bannerGold, 'cosmic_gold')}
                disabled={downloadingBanner !== null}
                className="bg-slate-800 hover:bg-slate-750 disabled:bg-slate-850 text-slate-200 hover:text-white border border-slate-700 font-bold py-2 px-3.5 rounded-xl text-xs transition duration-200 flex items-center gap-1.5 cursor-pointer"
              >
                {downloadingBanner === 'cosmic_gold' ? (
                  <span className="animate-pulse">Resizing...</span>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

