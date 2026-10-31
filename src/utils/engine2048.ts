/**
 * Pure 2048 Game Engine & Audio Synthesizer
 * Implements standard 4x4 sliding mechanics, single-merge-per-turn rules,
 * deterministic calculations, and Web Audio API sound effects.
 */

export type Grid2048 = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface MoveResult {
  grid: Grid2048;
  scoreGained: number;
  moved: boolean;
  highestTile: number;
  isWon: boolean;
  isGameOver: boolean;
}

/**
 * Creates an empty 4x4 grid filled with 0s
 */
export function createEmptyGrid(): Grid2048 {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

/**
 * Spawns a random tile (90% chance of 2, 10% chance of 4) in an empty cell
 */
export function spawnRandomTile(grid: Grid2048): Grid2048 {
  const emptyCoords: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) {
        emptyCoords.push([r, c]);
      }
    }
  }

  if (emptyCoords.length === 0) {
    return grid;
  }

  const [r, c] = emptyCoords[Math.floor(Math.random() * emptyCoords.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  const newGrid = grid.map((row) => [...row]);
  newGrid[r][c] = value;
  return newGrid;
}

/**
 * Initializes a new 2048 game board with 2 starting tiles
 */
export function initGrid(): Grid2048 {
  let grid = createEmptyGrid();
  grid = spawnRandomTile(grid);
  grid = spawnRandomTile(grid);
  return grid;
}

/**
 * Slides a single row left according to official 2048 rules:
 * - Compresses zeroes out
 * - Merges adjacent identical values once per turn
 * - Sums merged score
 * - Pads with zeroes
 */
export function slideRowLeft(row: number[]): {
  newRow: number[];
  scoreGained: number;
  merged: boolean;
} {
  const nonZero = row.filter((v) => v !== 0);
  const result: number[] = [];
  let scoreGained = 0;
  let merged = false;

  let i = 0;
  while (i < nonZero.length) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const mergedVal = nonZero[i] * 2;
      result.push(mergedVal);
      scoreGained += mergedVal;
      merged = true;
      i += 2;
    } else {
      result.push(nonZero[i]);
      i += 1;
    }
  }

  while (result.length < 4) {
    result.push(0);
  }

  return { newRow: result, scoreGained, merged };
}

/**
 * Matrix transpose helper (rows become columns)
 */
function transpose(grid: Grid2048): Grid2048 {
  return [0, 1, 2, 3].map((c) => [0, 1, 2, 3].map((r) => grid[r][c]));
}

/**
 * Matrix horizontal reverse helper
 */
function reverseRows(grid: Grid2048): Grid2048 {
  return grid.map((row) => [...row].reverse());
}

/**
 * Checks if two grids are identical in content
 */
function areGridsEqual(a: Grid2048, b: Grid2048): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
}

/**
 * Finds the highest tile number on the board
 */
export function getHighestTile(grid: Grid2048): number {
  let max = 0;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] > max) max = grid[r][c];
    }
  }
  return max;
}

/**
 * Checks if the player has achieved the 2048 tile
 */
export function hasWon2048(grid: Grid2048): boolean {
  return getHighestTile(grid) >= 2048;
}

/**
 * Determines if any moves can be made (empty spaces or adjacent identical tiles)
 */
export function hasMovesLeft(grid: Grid2048): boolean {
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return true;
      // Check horizontal neighbor
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return true;
      // Check vertical neighbor
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
}

/**
 * Executes a move in any of the four directions:
 * - Calculates sliding & merges
 * - Spawns a new tile if tiles actually moved
 * - Evaluates victory and game over states
 */
export function makeMove(grid: Grid2048, direction: Direction): MoveResult {
  let workingGrid: Grid2048;
  let scoreGained = 0;

  if (direction === 'left') {
    workingGrid = grid.map((row) => {
      const res = slideRowLeft(row);
      scoreGained += res.scoreGained;
      return res.newRow;
    });
  } else if (direction === 'right') {
    const reversed = reverseRows(grid);
    const moved = reversed.map((row) => {
      const res = slideRowLeft(row);
      scoreGained += res.scoreGained;
      return res.newRow;
    });
    workingGrid = reverseRows(moved);
  } else if (direction === 'up') {
    const transposed = transpose(grid);
    const moved = transposed.map((row) => {
      const res = slideRowLeft(row);
      scoreGained += res.scoreGained;
      return res.newRow;
    });
    workingGrid = transpose(moved);
  } else {
    // 'down'
    const transposed = transpose(grid);
    const reversed = reverseRows(transposed);
    const moved = reversed.map((row) => {
      const res = slideRowLeft(row);
      scoreGained += res.scoreGained;
      return res.newRow;
    });
    workingGrid = transpose(reverseRows(moved));
  }

  const moved = !areGridsEqual(grid, workingGrid);

  if (moved) {
    workingGrid = spawnRandomTile(workingGrid);
  }

  const highestTile = getHighestTile(workingGrid);
  const isWon = highestTile >= 2048;
  const isGameOver = !hasMovesLeft(workingGrid);

  return {
    grid: workingGrid,
    scoreGained,
    moved,
    highestTile,
    isWon,
    isGameOver,
  };
}

/**
 * Tile visual styling dictionary: background colors, text colors, shadow
 */
export interface TileStyle {
  bg: string;
  text: string;
  fontSize: string;
  shadow?: string;
  glow?: string;
}

export function getTileStyle(val: number): TileStyle {
  switch (val) {
    case 0:
      return { bg: 'bg-slate-800/40 border border-slate-700/30', text: 'text-transparent', fontSize: 'text-2xl' };
    case 2:
      return { bg: 'bg-[#eee4da] text-[#776e65]', text: 'text-[#776e65]', fontSize: 'text-2xl sm:text-3xl font-extrabold' };
    case 4:
      return { bg: 'bg-[#ede0c8] text-[#776e65]', text: 'text-[#776e65]', fontSize: 'text-2xl sm:text-3xl font-extrabold' };
    case 8:
      return { bg: 'bg-[#f2b179] text-white shadow-md shadow-[#f2b179]/30', text: 'text-white', fontSize: 'text-2xl sm:text-3xl font-black' };
    case 16:
      return { bg: 'bg-[#f59563] text-white shadow-md shadow-[#f59563]/40', text: 'text-white', fontSize: 'text-2xl sm:text-3xl font-black' };
    case 32:
      return { bg: 'bg-[#f67c5f] text-white shadow-lg shadow-[#f67c5f]/40', text: 'text-white', fontSize: 'text-2xl sm:text-3xl font-black' };
    case 64:
      return { bg: 'bg-[#f65e3b] text-white shadow-lg shadow-[#f65e3b]/50', text: 'text-white', fontSize: 'text-2xl sm:text-3xl font-black' };
    case 128:
      return {
        bg: 'bg-[#edcf72] text-white shadow-xl shadow-[#edcf72]/50 ring-2 ring-[#f1d77d]',
        text: 'text-white',
        fontSize: 'text-xl sm:text-2xl font-black',
        glow: 'animate-pulse',
      };
    case 256:
      return {
        bg: 'bg-[#edcc61] text-white shadow-xl shadow-[#edcc61]/60 ring-2 ring-[#f2ce54]',
        text: 'text-white',
        fontSize: 'text-xl sm:text-2xl font-black',
        glow: 'animate-pulse',
      };
    case 512:
      return {
        bg: 'bg-[#edc850] text-white shadow-xl shadow-[#edc850]/70 ring-2 ring-[#f4c636]',
        text: 'text-white',
        fontSize: 'text-xl sm:text-2xl font-black',
      };
    case 1024:
      return {
        bg: 'bg-[#edc53f] text-white shadow-2xl shadow-[#edc53f]/80 ring-3 ring-amber-300',
        text: 'text-white',
        fontSize: 'text-lg sm:text-xl font-black',
      };
    case 2048:
      return {
        bg: 'bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 text-white shadow-2xl shadow-yellow-500/80 ring-4 ring-yellow-300',
        text: 'text-white',
        fontSize: 'text-base sm:text-xl font-black tracking-tight',
        glow: 'animate-pulse',
      };
    default:
      // 4096+
      return {
        bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white shadow-2xl shadow-pink-500/80 ring-4 ring-pink-400',
        text: 'text-white',
        fontSize: 'text-sm sm:text-lg font-black',
      };
  }
}

// =========================================================================
// Synthesized Web Audio Effects (No external audio files needed)
// =========================================================================

class SoundManager2048 {
  private ctx: AudioContext | null = null;
  public enabled = true;

  constructor() {
    try {
      const stored = localStorage.getItem('everygyan_2048_sound');
      if (stored !== null) {
        this.enabled = stored === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    try {
      localStorage.setItem('everygyan_2048_sound', String(this.enabled));
    } catch {
      // ignore
    }
    return this.enabled;
  }

  private initCtx(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public playMove(): void {
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext safe fail
    }
  }

  public playMerge(tileValue = 4): void {
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const baseFreq = Math.min(300 + Math.log2(tileValue) * 80, 1100);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Safe fail
    }
  }

  public playWin(): void {
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {
      // Safe fail
    }
  }

  public playGameOver(): void {
    const ctx = this.initCtx();
    if (!ctx) return;
    try {
      const notes = [220, 196, 174.6, 155.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.18);
      });
    } catch {
      // Safe fail
    }
  }
}

export const sound2048 = new SoundManager2048();
