import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  Undo2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import {
  initGrid,
  makeMove,
  getTileStyle,
  sound2048,
  Grid2048,
  Direction,
  getHighestTile,
} from '../../utils/engine2048';
import {
  get2048Stats,
  record2048Score,
  recordGameReset,
  resetAllStats,
  GameStats,
} from '../../services/gameStatsService';
import { useAuth } from '../../contexts/AuthContext';

interface Game2048ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatsUpdated?: (stats: GameStats) => void;
}

interface ScorePopup {
  id: number;
  val: number;
}

export const Game2048Modal: React.FC<Game2048ModalProps> = ({
  isOpen,
  onClose,
  onStatsUpdated,
}) => {
  const { user } = useAuth();

  // Board & Score State
  const [grid, setGrid] = useState<Grid2048>(initGrid);
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(0);
  const [previousState, setPreviousState] = useState<{
    grid: Grid2048;
    score: number;
  } | null>(null);

  // Status Overlays
  const [isWon, setIsWon] = useState<boolean>(false);
  const [dismissedWin, setDismissedWin] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sound2048.enabled);
  const [scorePopups, setScorePopups] = useState<ScorePopup[]>([]);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Touch Gesture tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Prevent re-render loop on parent callback
  const onStatsUpdatedRef = useRef(onStatsUpdated);
  useEffect(() => {
    onStatsUpdatedRef.current = onStatsUpdated;
  }, [onStatsUpdated]);

  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    resetsCount: 0,
    bestScore: 0,
    highestTile: 0,
  });

  // Load user 2048 stats on mount
  useEffect(() => {
    let isMounted = true;
    get2048Stats(user?.id).then((s) => {
      if (isMounted) {
        setStats(s);
        setBestScore(s.bestScore ?? 0);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const highestTile = getHighestTile(grid);

  // Move dispatcher
  const handleMove = useCallback(
    (dir: Direction) => {
      if (isGameOver) return;
      if (isWon && !dismissedWin) return;

      const result = makeMove(grid, dir);
      if (!result.moved) return;

      // Save previous state for 1 undo step
      setPreviousState({
        grid: grid.map((r) => [...r]),
        score,
      });

      const newScore = score + result.scoreGained;
      setGrid(result.grid);
      setScore(newScore);

      // Audio feedback
      if (result.scoreGained > 0) {
        sound2048.playMerge(result.highestTile);
        // Floating score popup
        const pid = Date.now() + Math.random();
        setScorePopups((prev) => [...prev, { id: pid, val: result.scoreGained }]);
        setTimeout(() => {
          setScorePopups((prev) => prev.filter((p) => p.id !== pid));
        }, 800);
      } else {
        sound2048.playMove();
      }

      // Update High Score immediately in UI
      if (newScore > bestScore) {
        setBestScore(newScore);
      }

      // Check Victory
      if (result.isWon && !isWon && !dismissedWin) {
        setIsWon(true);
        sound2048.playWin();
        record2048Score(
          {
            score: newScore,
            highestTile: result.highestTile,
            isWin: true,
          },
          user?.id
        ).then((up) => {
          setStats(up);
          onStatsUpdatedRef.current?.(up);
        });
      } else if (result.isGameOver) {
        // Game Over
        setIsGameOver(true);
        sound2048.playGameOver();
        record2048Score(
          {
            score: newScore,
            highestTile: result.highestTile,
            isGameOver: true,
          },
          user?.id
        ).then((up) => {
          setStats(up);
          onStatsUpdatedRef.current?.(up);
        });
      } else if (result.scoreGained > 0) {
        // Debounced save for best score progression
        record2048Score(
          {
            score: newScore,
            highestTile: result.highestTile,
          },
          user?.id
        ).then((up) => {
          setStats(up);
        });
      }
    },
    [grid, score, bestScore, isGameOver, isWon, dismissedWin, user?.id]
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove('up');
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove('down');
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove('left');
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove('right');
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleMove, onClose]);

  // Touch Swipe handlers
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Minimum swipe threshold
    if (Math.max(absDx, absDy) < 30) return;

    if (absDx > absDy) {
      // Horizontal swipe
      if (dx > 0) handleMove('right');
      else handleMove('left');
    } else {
      // Vertical swipe
      if (dy > 0) handleMove('down');
      else handleMove('up');
    }
  };

  // Reset Game
  const handleResetGame = () => {
    recordGameReset(user?.id, '2048').then((up) => {
      setStats(up);
      onStatsUpdatedRef.current?.(up);
    });
    setGrid(initGrid());
    setScore(0);
    setPreviousState(null);
    setIsWon(false);
    setDismissedWin(false);
    setIsGameOver(false);
  };

  // Undo Move (1 step)
  const handleUndo = () => {
    if (!previousState) return;
    setGrid(previousState.grid);
    setScore(previousState.score);
    setPreviousState(null);
    setIsGameOver(false);
  };

  const toggleSound = () => {
    const newState = sound2048.toggle();
    setSoundEnabled(newState);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-2048-title"
    >
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[96vh]">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Bar */}
        <div className="relative z-10 px-5 py-4 border-b border-slate-800/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-amber-500/20">
              2048
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 id="game-2048-title" className="text-lg font-bold text-white tracking-tight">
                  2048 Puzzle Master
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  <Zap className="w-3 h-3" /> Arcade
                </span>
              </div>
              <p className="text-xs text-slate-400">Join matching numbers to reach 2048!</p>
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowStatsModal(true)}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="View Statistics"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
            </button>
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-400 text-slate-400 transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Game Main Body */}
        <div className="relative z-10 p-4 sm:p-6 overflow-y-auto flex flex-col items-center gap-4">
          {/* Scoreboard Row */}
          <div className="w-full flex items-center justify-between gap-3 max-w-[420px]">
            {/* Current Score */}
            <div className="relative flex-1 bg-slate-800/80 border border-slate-700/60 rounded-2xl py-2 px-3 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Score
              </span>
              <span className="text-xl sm:text-2xl font-black text-white">{score}</span>

              {/* Floating +Points animations */}
              {scorePopups.map((popup) => (
                <span
                  key={popup.id}
                  className="absolute -top-3 right-3 text-xs sm:text-sm font-black text-amber-400 animate-bounce pointer-events-none drop-shadow-md"
                >
                  +{popup.val}
                </span>
              ))}
            </div>

            {/* Best Score */}
            <div className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-2xl py-2 px-3 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" /> Best
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-300">{bestScore}</span>
            </div>

            {/* Highest Tile */}
            <div className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-2xl py-2 px-3 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 block flex items-center justify-center gap-1">
                <Award className="w-3 h-3 text-purple-400" /> Highest
              </span>
              <span className="text-xl sm:text-2xl font-black text-purple-300">{highestTile}</span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="w-full flex items-center justify-between gap-3 max-w-[420px]">
            <button
              onClick={handleUndo}
              disabled={!previousState || isGameOver}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-xs font-semibold text-slate-300 transition-colors"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </button>
            <button
              onClick={handleResetGame}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-xs font-semibold text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> New Game
            </button>
          </div>

          {/* 4x4 Game Board Container */}
          <div
            className="relative w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] p-2.5 sm:p-3 bg-slate-950/90 border-2 border-slate-800 rounded-3xl shadow-inner select-none touch-none"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            {/* The 16 Tile Grid */}
            <div className="grid grid-cols-4 grid-rows-4 gap-2 sm:gap-2.5 w-full h-full">
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const style = getTileStyle(val);
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`relative rounded-2xl flex items-center justify-center transition-all duration-100 ${style.bg} ${style.glow || ''}`}
                    >
                      {val > 0 && (
                        <span className={`${style.text} ${style.fontSize} select-none`}>
                          {val}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Victory Overlay */}
            {isWon && !dismissedWin && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 animate-spin" />
                </div>
                <h2 className="text-2xl font-black text-white mb-1">You Reached 2048!</h2>
                <p className="text-xs text-slate-300 max-w-xs mb-4">
                  Outstanding mastery! You merged all the way to 2048. Would you like to keep going to 4096+ or start a fresh round?
                </p>
                <div className="flex gap-2 w-full max-w-xs">
                  <button
                    onClick={() => setDismissedWin(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
                  >
                    Keep Playing
                  </button>
                  <button
                    onClick={handleResetGame}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                  >
                    New Game
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                <h2 className="text-2xl sm:text-3xl font-black text-rose-500 mb-1">Game Over!</h2>
                <p className="text-xs text-slate-300 max-w-xs mb-3">
                  No more moves are possible.
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl py-2 px-4 mb-4">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Final Score
                  </span>
                  <span className="text-xl font-black text-amber-400">{score}</span>
                </div>
                <button
                  onClick={handleResetGame}
                  className="py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-sm shadow-xl active:scale-95 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Mobile Directional D-Pad Controls */}
          <div className="flex flex-col items-center gap-1.5 pt-1 sm:hidden">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Touch D-Pad
            </span>
            <button
              onClick={() => handleMove('up')}
              className="p-3 bg-slate-800 active:bg-slate-700 rounded-xl text-slate-200"
              aria-label="Move Up"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleMove('left')}
                className="p-3 bg-slate-800 active:bg-slate-700 rounded-xl text-slate-200"
                aria-label="Move Left"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove('down')}
                className="p-3 bg-slate-800 active:bg-slate-700 rounded-xl text-slate-200"
                aria-label="Move Down"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove('right')}
                className="p-3 bg-slate-800 active:bg-slate-700 rounded-xl text-slate-200"
                aria-label="Move Right"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Keyboard Hint */}
          <p className="hidden sm:block text-[11px] text-slate-500 text-center">
            Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Arrow Keys</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">W A S D</kbd> to slide tiles. On touch devices, swipe anywhere on the board!
          </p>
        </div>

        {/* Footer / Account Sync Indicator */}
        <div className="relative z-10 px-5 py-3 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${user ? 'bg-emerald-400' : 'bg-amber-400'}`}
            />
            <span className="text-[11px]">
              {user ? (
                <>Stats synced with <strong>{user.email?.split('@')[0]}</strong></>
              ) : (
                'Playing as Guest · Stats saved locally'
              )}
            </span>
          </div>

          <span className="text-[11px] text-slate-500">
            Resets: <strong className="text-slate-300">{stats.resetsCount}</strong>
          </span>
        </div>
      </div>

      {/* Stats Details Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                2048 Player Statistics
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">All-Time Best Score:</span>
                <strong className="text-amber-400">{stats.bestScore ?? bestScore}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Highest Tile Achieved:</span>
                <strong className="text-purple-400">{stats.highestTile ?? highestTile}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">2048 Victories:</span>
                <strong className="text-emerald-400">{stats.gamesWon}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Games Completed (Game Over):</span>
                <strong className="text-slate-200">{stats.gamesLost}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Board Restarts (Resets):</span>
                <strong className="text-slate-200">{stats.resetsCount}</strong>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={async () => {
                  if (window.confirm('Reset all your 2048 statistics to 0?')) {
                    const fresh = await resetAllStats(user?.id, '2048');
                    setStats(fresh);
                    setBestScore(0);
                    onStatsUpdatedRef.current?.(fresh);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-red-500/20 hover:text-red-300 text-xs font-semibold text-slate-400 transition-colors"
              >
                Reset Stats
              </button>
              <button
                onClick={() => setShowStatsModal(false)}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
