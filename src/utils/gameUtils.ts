import { Tile } from '../types';

// Format tile numerical value to Web3 format: 10, 100, 1k, 10k, 100k, 1m, 10m, 100m, 1b, etc.
export function formatTileValue(value: number): string {
  if (value < 1000) return value.toString();
  if (value < 1000000) {
    const kVal = value / 1000;
    return kVal % 1 === 0 ? `${kVal}k` : `${kVal.toFixed(1)}k`;
  }
  if (value < 1000000000) {
    const mVal = value / 1000000;
    return mVal % 1 === 0 ? `${mVal}m` : `${mVal.toFixed(1)}m`;
  }
  if (value < 1000000000000) {
    const bVal = value / 1000000000;
    return bVal % 1 === 0 ? `${bVal}b` : `${bVal.toFixed(1)}b`;
  }
  if (value < 1000000000000000) {
    const tVal = value / 1000000000000;
    return tVal % 1 === 0 ? `${tVal}t` : `${tVal.toFixed(1)}t`;
  }
  if (value < 1000000000000000000) {
    const qVal = value / 1000000000000000;
    return qVal % 1 === 0 ? `${qVal}q` : `${qVal.toFixed(1)}q`;
  }
  return '∞';
}

export function getValueByLevel(level: number): number {
  return 10 * Math.pow(10, level - 1);
}

export interface TileStyle {
  bg: string;
  text: string;
  border: string;
  shadow: string;
  label: string;
  coinName: string;
  icon: string;
}

export function getTileStyle(level: number): TileStyle {
  const value = getValueByLevel(level);
  const label = formatTileValue(value);

  // High-fidelity web3 styling corresponding to coins/tokens on Telegram
  switch (level) {
    case 1:
      return {
        bg: 'bg-linear-to-br from-slate-700 to-slate-800',
        text: 'text-slate-200',
        border: 'border-slate-600',
        shadow: 'shadow-sm',
        label,
        coinName: 'Bronze',
        icon: '🥉'
      };
    case 2:
      return {
        bg: 'bg-linear-to-br from-amber-800 to-amber-750',
        text: 'text-amber-100',
        border: 'border-amber-700',
        shadow: 'shadow-sm',
        label,
        coinName: 'Copper',
        icon: '🟫'
      };
    case 3:
      return {
        bg: 'bg-linear-to-br from-slate-400 to-zinc-500',
        text: 'text-white',
        border: 'border-slate-300',
        shadow: 'shadow-md shadow-slate-500/10',
        label,
        coinName: 'Silver',
        icon: '🥈'
      };
    case 4:
      return {
        bg: 'bg-linear-to-br from-amber-400 via-yellow-500 to-amber-600',
        text: 'text-neutral-950 font-black',
        border: 'border-yellow-300',
        shadow: 'shadow-lg shadow-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.25)]',
        label,
        coinName: 'Gold',
        icon: '🥇'
      };
    case 5:
      return {
        bg: 'bg-linear-to-br from-emerald-500 via-teal-600 to-emerald-700',
        text: 'text-white font-extrabold',
        border: 'border-emerald-400',
        shadow: 'shadow-lg shadow-emerald-500/25 shadow-[0_0_18px_rgba(16,185,129,0.3)]',
        label,
        coinName: 'Emerald',
        icon: '🟢'
      };
    case 6: // 1m
      return {
        bg: 'bg-linear-to-br from-cyan-400 via-blue-500 to-indigo-600',
        text: 'text-white font-extrabold',
        border: 'border-cyan-300',
        shadow: 'shadow-lg shadow-cyan-500/30 glow-cyan',
        label,
        coinName: 'TON Star',
        icon: '💎'
      };
    case 7: // 10m
      return {
        bg: 'bg-linear-to-br from-purple-500 via-fuchsia-600 to-pink-600',
        text: 'text-white font-extrabold',
        border: 'border-purple-300',
        shadow: 'shadow-xl shadow-purple-500/35 glow-purple',
        label,
        coinName: 'Solana Flare',
        icon: '🔮'
      };
    case 8: // 100m
      return {
        bg: 'bg-linear-to-br from-rose-500 via-red-600 to-amber-600',
        text: 'text-white font-black',
        border: 'border-rose-400',
        shadow: 'shadow-xl shadow-red-500/40 shadow-[0_0_22px_rgba(239,68,68,0.4)]',
        label,
        coinName: 'Ether Gas',
        icon: '🔥'
      };
    case 9: // 1b
      return {
        bg: 'bg-linear-to-br from-sky-400 via-indigo-500 to-purple-800',
        text: 'text-cyan-50 font-black',
        border: 'border-indigo-300',
        shadow: 'shadow-2xl shadow-indigo-500/45 shadow-[0_0_25px_rgba(99,102,241,0.5)]',
        label,
        coinName: 'Bitcoin Matrix',
        icon: '⚡'
      };
    case 10: // 10b
      return {
        bg: 'bg-linear-to-br from-yellow-300 via-amber-500 to-orange-700',
        text: 'text-amber-950 font-black',
        border: 'border-yellow-200',
        shadow: 'shadow-2xl shadow-amber-500/50 glow-gold',
        label,
        coinName: 'Binance Smart',
        icon: '🔶'
      };
    case 11: // 100b
      return {
        bg: 'bg-linear-to-br from-violet-600 via-purple-700 to-fuchsia-900',
        text: 'text-transparent bg-clip-text bg-linear-to-r from-teal-200 to-pink-200 font-black',
        border: 'border-fuchsia-400',
        shadow: 'shadow-2xl shadow-fuchsia-500/60 shadow-[0_0_30px_rgba(217,70,239,0.6)] animate-pulse',
        label,
        coinName: 'Gemini Galaxy',
        icon: '♊'
      };
    case 12: // 1t
      return {
        bg: 'bg-linear-to-br from-pink-500 via-rose-500 to-yellow-500',
        text: 'text-white font-black',
        border: 'border-pink-300',
        shadow: 'shadow-2xl shadow-rose-500/70 shadow-[0_0_35px_rgba(244,63,94,0.7)]',
        label,
        coinName: 'Hyper Cosmos',
        icon: '🌟'
      };
    case 13: // 10t
      return {
        bg: 'bg-linear-to-br from-indigo-500 via-violet-600 to-purple-900',
        text: 'text-cyan-200 font-extrabold',
        border: 'border-indigo-400',
        shadow: 'shadow-2xl shadow-indigo-500/80 shadow-[0_0_38px_rgba(99,102,241,0.8)] animate-pulse',
        label,
        coinName: 'Cosmic Singularity',
        icon: '🪐'
      };
    case 14: // 100t
      return {
        bg: 'bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-600',
        text: 'text-white font-black',
        border: 'border-emerald-300',
        shadow: 'shadow-2xl shadow-teal-500/80 shadow-[0_0_40px_rgba(20,184,166,0.8)]',
        label,
        coinName: 'Galactic Quantum',
        icon: '🛰️'
      };
    case 15: // 1q
      return {
        bg: 'bg-linear-to-br from-fuchsia-500 via-pink-600 to-cyan-500',
        text: 'text-white font-black',
        border: 'border-fuchsia-300',
        shadow: 'shadow-2xl shadow-fuchsia-500/90 shadow-[0_0_45px_rgba(217,70,239,0.9)] animate-pulse',
        label,
        coinName: 'Multiverse Core',
        icon: '🌀'
      };
    case 16: // 10q
      return {
        bg: 'bg-linear-to-br from-amber-400 via-yellow-500 to-red-650',
        text: 'text-yellow-105 font-black uppercase tracking-wider',
        border: 'border-yellow-250',
        shadow: 'shadow-2xl shadow-yellow-500/90 shadow-[0_0_50px_rgba(234,179,8,1)] animate-bounce',
        label,
        coinName: 'Airdrop Overlord',
        icon: '👑'
      };
    default: // Level 17+ (Infinity range)
      // Custom calculation for values/colors beyond level 16
      const colors = [
        'from-fuchsia-500 to-cyan-500',
        'from-yellow-400 to-pink-500',
        'from-cyan-500 to-emerald-500',
        'from-blue-600 to-purple-600',
        'from-red-500 to-yellow-500'
      ];
      const selectedColor = colors[(level - 17) % colors.length];
      return {
        bg: `bg-linear-to-br ${selectedColor}`,
        text: 'text-white font-black',
        border: 'border-white',
        shadow: 'shadow-2xl shadow-white/50 shadow-[0_0_40px_rgba(255,255,255,0.8)]',
        label,
        coinName: `Omega Level ${level - 16}`,
        icon: '♾️'
      };
  }
}

// Check if any merges or open cells are available on the board
export function hasAvailableMoves(tiles: Tile[]): boolean {
  if (tiles.length < 16) return true;

  // Build grid representation to trace adjacent values easily
  const grid: (number | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null));
  tiles.forEach(tile => {
    grid[tile.row][tile.col] = tile.value;
  });

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      const val = grid[r][c];
      if (val === null) return true;

      // Check right neighbor
      if (c < 3 && grid[r][c + 1] === val) return true;
      // Check down neighbor
      if (r < 3 && grid[r + 1][c] === val) return true;
    }
  }

  return false;
}

// Generate new random tile (row, col) that is currently empty
export function getRandomEmptyCell(tiles: Tile[]): { row: number; col: number } | null {
  const occupied = new Set(tiles.map(t => `${t.row},${t.col}`));
  const empty: { row: number; col: number }[] = [];

  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (!occupied.has(`${r},${c}`)) {
        empty.push({ row: r, col: c });
      }
    }
  }

  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

// Full 2048 movement system
export function moveTiles(
  tiles: Tile[],
  direction: 'up' | 'down' | 'left' | 'right'
): { newTiles: Tile[]; scoreIncrement: number; hasMoved: boolean } {
  let scoreIncrement = 0;
  let hasMoved = false;

  // Clone state to protect references
  const newTilesMap = new Map<string, Tile>();
  tiles.forEach(t => {
    newTilesMap.set(t.id, { ...t, isNew: false, isMerged: false });
  });

  const lines = [0, 1, 2, 3];

  if (direction === 'left' || direction === 'right') {
    lines.forEach(r => {
      // Get all tiles in current row, sorted by column
      const rowTiles = Array.from(newTilesMap.values()).filter(t => t.row === r);
      rowTiles.sort((a, b) => direction === 'left' ? a.col - b.col : b.col - a.col);

      if (rowTiles.length === 0) return;

      const targetCols = direction === 'left' ? [0, 1, 2, 3] : [3, 2, 1, 0];
      const result: Tile[] = [];
      
      for (let i = 0; i < rowTiles.length; i++) {
        const current = rowTiles[i];
        const next = rowTiles[i + 1];

        if (next && current.level === next.level) {
          const nextLevel = current.level + 1;
          const mergedVal = getValueByLevel(nextLevel);
          const merged: Tile = {
            id: current.id, // preserve ID for animation consistency
            level: nextLevel,
            value: mergedVal,
            row: r,
            col: targetCols[result.length],
            isMerged: true
          };
          result.push(merged);
          newTilesMap.delete(next.id); // delete merged partner from simulation
          scoreIncrement += mergedVal;
          i++; // bypass next tile
          hasMoved = true;
        } else {
          result.push({
            ...current,
            row: r,
            col: targetCols[result.length]
          });
        }

        // Detect if position shifted indices
        if (result[result.length - 1].col !== current.col) {
          hasMoved = true;
        }
      }

      // Re-map row updates
      rowTiles.forEach(t => newTilesMap.delete(t.id));
      result.forEach(t => newTilesMap.set(t.id, t));
    });
  } else {
    // Up or Down shift
    lines.forEach(c => {
      // Get all tiles in current column, sorted by row
      const colTiles = Array.from(newTilesMap.values()).filter(t => t.col === c);
      colTiles.sort((a, b) => direction === 'up' ? a.row - b.row : b.row - a.row);

      if (colTiles.length === 0) return;

      const targetRows = direction === 'up' ? [0, 1, 2, 3] : [3, 2, 1, 0];
      const result: Tile[] = [];

      for (let i = 0; i < colTiles.length; i++) {
        const current = colTiles[i];
        const next = colTiles[i + 1];

        if (next && current.level === next.level) {
          const nextLevel = current.level + 1;
          const mergedVal = getValueByLevel(nextLevel);
          const merged: Tile = {
            id: current.id,
            level: nextLevel,
            value: mergedVal,
            row: targetRows[result.length],
            col: c,
            isMerged: true
          };
          result.push(merged);
          newTilesMap.delete(next.id);
          scoreIncrement += mergedVal;
          i++;
          hasMoved = true;
        } else {
          result.push({
            ...current,
            row: targetRows[result.length],
            col: c
          });
        }

        if (result[result.length - 1].row !== current.row) {
          hasMoved = true;
        }
      }

      // Re-map column updates
      colTiles.forEach(t => newTilesMap.delete(t.id));
      result.forEach(t => newTilesMap.set(t.id, t));
    });
  }

  return {
    newTiles: Array.from(newTilesMap.values()),
    scoreIncrement,
    hasMoved
  };
}

