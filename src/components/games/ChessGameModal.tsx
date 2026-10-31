import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X, RotateCcw, Volume2, VolumeX, Bot, Users, Trophy,
  Undo2, RefreshCw, Maximize2, Minimize2,
} from 'lucide-react';
import {
  GameState,
  Position,
  PieceColor,
  createInitialGameState,
  getLegalMoves,
  makeMove,
  getAIMove,
  AIDifficulty,
  sound,
  moveToAlgebraic,
} from '../../utils/chessEngine';
import { ChessPieceView } from './ChessPieceView';
import {
  getChessStats,
  recordGameResult,
  recordGameReset,
  resetAllStats,
  GameStats,
} from '../../services/gameStatsService';
import { useAuth } from '../../contexts/AuthContext';

interface ChessGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatsUpdated?: (stats: GameStats) => void;
}

type GameMode = 'ai' | 'pass_and_play';

export const ChessGameModal: React.FC<ChessGameModalProps> = ({
  isOpen,
  onClose,
  onStatsUpdated,
}) => {
  const { user } = useAuth();

  // Core Game State
  const [gameState, setGameState] = useState<GameState>(createInitialGameState);
  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('medium');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Keep a stable ref to callback to prevent infinite re-render loops
  const onStatsUpdatedRef = useRef(onStatsUpdated);
  useEffect(() => {
    onStatsUpdatedRef.current = onStatsUpdated;
  }, [onStatsUpdated]);

  const hasHandledGameOverRef = useRef(false);

  // User Stats
  const [stats, setStats] = useState<GameStats>({
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    gamesDrawn: 0,
    resetsCount: 0,
  });

  // Load stats once on mount
  useEffect(() => {
    let isMounted = true;
    getChessStats(user?.id).then((s) => {
      if (isMounted) setStats(s);
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Compute legal moves for current selection
  const currentLegalMoves = useMemo(() => {
    if (!selectedPos) return [];
    const all = getLegalMoves(gameState.board, gameState.turn, gameState.castling);
    return all.filter(
      (m) => m.from.row === selectedPos.row && m.from.col === selectedPos.col
    );
  }, [selectedPos, gameState]);

  // Handle Game Over
  useEffect(() => {
    if (!gameState.isCheckmate && !gameState.isDraw) {
      hasHandledGameOverRef.current = false;
      return;
    }

    if (hasHandledGameOverRef.current) return;
    hasHandledGameOverRef.current = true;

    if (soundEnabled) sound.playGameOver();

    let result: 'win' | 'loss' | 'draw' = 'draw';
    if (gameState.isCheckmate) {
      const winningColor = gameState.turn === 'w' ? 'b' : 'w';
      if (gameMode === 'ai') {
        result = winningColor === playerColor ? 'win' : 'loss';
      } else {
        result = 'win';
      }
    }

    recordGameResult(result, user?.id).then((updated) => {
      setStats(updated);
      onStatsUpdatedRef.current?.(updated);
    });
  }, [gameState.isCheckmate, gameState.isDraw, gameState.turn, gameMode, playerColor, user?.id, soundEnabled]);

  // AI Move Trigger
  useEffect(() => {
    // Only trigger when in AI mode, game active, and it is the bot's turn
    if (
      gameMode !== 'ai' ||
      gameState.isCheckmate ||
      gameState.isDraw ||
      gameState.turn === playerColor
    ) {
      setIsAiThinking(false);
      return;
    }

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const move = getAIMove(gameState, aiDifficulty);
      if (move) {
        const nextState = makeMove(gameState, move);
        setGameState(nextState);

        if (soundEnabled) {
          if (nextState.isCheckmate || nextState.isCheck) {
            sound.playCheck();
          } else if (move.captured) {
            sound.playCapture();
          } else {
            sound.playMove();
          }
        }
      }
      setIsAiThinking(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [gameState, gameMode, playerColor, aiDifficulty, soundEnabled]);

  // Reset Game
  const handleResetGame = async () => {
    hasHandledGameOverRef.current = false;
    setGameState(createInitialGameState());
    setSelectedPos(null);
    setIsAiThinking(false);
    const updated = await recordGameReset(user?.id);
    setStats(updated);
    onStatsUpdatedRef.current?.(updated);
  };

  // Undo Move
  const handleUndoMove = () => {
    if (gameState.history.length === 0 || isAiThinking) return;

    // In AI mode, undo 2 moves (AI move + human move)
    const undoCount = gameMode === 'ai' && gameState.history.length >= 2 ? 2 : 1;
    let st = createInitialGameState();
    const remainingMoves = gameState.history.slice(0, gameState.history.length - undoCount);

    for (const mv of remainingMoves) {
      st = makeMove(st, mv);
    }

    setGameState(st);
    setSelectedPos(null);
  };

  // Click on a board square
  const handleSquareClick = (row: number, col: number) => {
    if (isAiThinking || gameState.isCheckmate || gameState.isDraw) return;
    if (gameMode === 'ai' && gameState.turn !== playerColor) return;

    const pieceAtSquare = gameState.board[row][col];

    // If already selected a piece, check if clicked square is a valid target
    if (selectedPos) {
      const matchedMove = currentLegalMoves.find(
        (m) => m.to.row === row && m.to.col === col
      );

      if (matchedMove) {
        // Execute move
        const nextState = makeMove(gameState, matchedMove);
        setGameState(nextState);
        setSelectedPos(null);

        if (soundEnabled) {
          if (nextState.isCheckmate || nextState.isCheck) {
            sound.playCheck();
          } else if (matchedMove.captured) {
            sound.playCapture();
          } else {
            sound.playMove();
          }
        }
        return;
      }
    }

    // Select piece if it belongs to current player
    if (pieceAtSquare && pieceAtSquare.color === gameState.turn) {
      setSelectedPos({ row, col });
    } else {
      setSelectedPos(null);
    }
  };

  // Handle Clear Stats
  const handleClearStats = async () => {
    if (!confirm('Are you sure you want to reset all your chess statistics to zero?')) return;
    const cleared = await resetAllStats(user?.id);
    setStats(cleared);
    onStatsUpdatedRef.current?.(cleared);
  };

  if (!isOpen) return null;

  // Board orientation
  const isFlipped = boardFlipped || (gameMode === 'ai' && playerColor === 'b');
  const rows = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = isFlipped ? [7, 6, 5, 4, 3, 2, 1, 0] : [0, 1, 2, 3, 4, 5, 6, 7];
  const lastMove = gameState.history[gameState.history.length - 1];

  // Win percentage
  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={`bg-[#0f172a] text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col w-full transition-all duration-300 ${
          isFullscreen ? 'max-w-7xl h-[96vh]' : 'max-w-5xl max-h-[94vh]'
        }`}
      >
        {/* Top Navbar */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">♟️</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  EveryGyan Chess
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
                  {gameMode === 'ai' ? `vs AI (${aiDifficulty})` : '2-Player Local'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Master classical chess directly in your browser
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowStatsModal(!showStatsModal)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors border border-amber-500/20"
              title="View Statistics"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stats</span>
              <span className="text-[11px] font-mono px-1 rounded bg-amber-500/10 text-amber-300">
                {stats.gamesWon}W
              </span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="hidden sm:flex p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-red-600 transition-colors"
              title="Close Game"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Chess Board Area */}
          <div className="lg:col-span-8 flex flex-col items-center">
            {/* Top Opponent Banner */}
            <div className="w-full max-w-[500px] mb-2 flex items-center justify-between px-3 py-2 bg-slate-800/80 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-sm border border-slate-700">
                  {gameMode === 'ai' ? <Bot className="w-4 h-4 text-purple-400" /> : '👤'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{gameMode === 'ai' ? `AI (${aiDifficulty})` : isFlipped ? 'White' : 'Black'}</span>
                    {gameState.turn === (isFlipped ? 'w' : 'b') && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    {isAiThinking ? (
                      <span className="text-purple-400 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Thinking...
                      </span>
                    ) : (
                      <span>{isFlipped ? 'White pieces' : 'Black pieces'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Captured by Opponent */}
              <div className="flex items-center gap-0.5 max-w-[180px] overflow-x-auto">
                {(isFlipped ? gameState.capturedBlack : gameState.capturedWhite).map((p, idx) => (
                  <ChessPieceView key={idx} piece={p} className="w-4 h-4 opacity-80" />
                ))}
              </div>
            </div>

            {/* Chess Board (8x8) */}
            <div className="relative p-2 bg-[#1e293b] rounded-2xl shadow-2xl border-4 border-[#334155] select-none">
              <div className="grid grid-cols-8 grid-rows-8 w-[310px] h-[310px] sm:w-[460px] sm:h-[460px] md:w-[480px] md:h-[480px]">
                {rows.map((r) =>
                  cols.map((c) => {
                    const isLightSquare = (r + c) % 2 === 0;
                    const piece = gameState.board[r][c];
                    const isSelected = selectedPos?.row === r && selectedPos?.col === c;
                    const isLegalTarget = currentLegalMoves.some(
                      (m) => m.to.row === r && m.to.col === c
                    );
                    const isLastMoveSquare =
                      lastMove &&
                      ((lastMove.from.row === r && lastMove.from.col === c) ||
                        (lastMove.to.row === r && lastMove.to.col === c));
                    const isKingInCheckSquare =
                      piece &&
                      piece.type === 'k' &&
                      piece.color === gameState.turn &&
                      gameState.isCheck;

                    // Square background color logic
                    let bgClass = isLightSquare ? 'bg-[#ebd7b2]' : 'bg-[#9b724c]';
                    if (isLastMoveSquare) {
                      bgClass = isLightSquare ? 'bg-[#cdd26a]' : 'bg-[#aaa23a]';
                    }
                    if (isSelected) {
                      bgClass = 'bg-[#f6e05e]/90 ring-2 ring-amber-400 ring-inset';
                    }
                    if (isKingInCheckSquare) {
                      bgClass = 'bg-red-500/90 animate-pulse';
                    }

                    return (
                      <div
                        key={`${r}-${c}`}
                        onClick={() => handleSquareClick(r, c)}
                        className={`relative flex items-center justify-center cursor-pointer transition-colors ${bgClass}`}
                      >
                        {/* Rank and File Labels */}
                        {c === (isFlipped ? 7 : 0) && (
                          <span
                            className={`absolute top-0.5 left-1 text-[9px] font-bold select-none ${
                              isLightSquare ? 'text-[#9b724c]' : 'text-[#ebd7b2]'
                            }`}
                          >
                            {8 - r}
                          </span>
                        )}
                        {r === (isFlipped ? 0 : 7) && (
                          <span
                            className={`absolute bottom-0.5 right-1 text-[9px] font-bold select-none ${
                              isLightSquare ? 'text-[#9b724c]' : 'text-[#ebd7b2]'
                            }`}
                          >
                            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'][c]}
                          </span>
                        )}

                        {/* Chess Piece */}
                        {piece && (
                          <ChessPieceView
                            piece={piece}
                            className="w-8 h-8 sm:w-11 sm:h-11 drop-shadow-md z-10 transition-transform hover:scale-105 active:scale-95"
                          />
                        )}

                        {/* Move Dot Indicator */}
                        {isLegalTarget && !piece && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-slate-900/35 z-20" />
                        )}

                        {/* Capture Target Ring */}
                        {isLegalTarget && piece && (
                          <div className="absolute inset-0 rounded-full border-4 border-red-500/70 z-20 animate-pulse" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Game Over Overlay */}
              {(gameState.isCheckmate || gameState.isDraw) && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-200 z-30">
                  <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-3xl mb-3 border border-amber-500/30">
                    🏆
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    {gameState.isCheckmate
                      ? `${gameState.turn === 'w' ? 'Black' : 'White'} Wins!`
                      : 'Game Drawn!'}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xs">
                    {gameState.isCheckmate
                      ? 'Victory by Checkmate! Brilliant tactical execution.'
                      : 'Stalemate reached. No legal moves remaining.'}
                  </p>
                  <div className="flex items-center gap-3 mt-5">
                    <button
                      onClick={handleResetGame}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg transition-transform active:scale-95"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Play Again
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Player Banner */}
            <div className="w-full max-w-[500px] mt-2 flex items-center justify-between px-3 py-2 bg-slate-800/80 rounded-2xl border border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  {user?.email?.charAt(0).toUpperCase() || 'P'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{user?.email ? user.email.split('@')[0] : 'You'}</span>
                    {gameState.turn === (isFlipped ? 'b' : 'w') && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Playing as {isFlipped ? 'Black' : 'White'}
                  </p>
                </div>
              </div>

              {/* Captured by Player */}
              <div className="flex items-center gap-0.5 max-w-[180px] overflow-x-auto">
                {(isFlipped ? gameState.capturedWhite : gameState.capturedBlack).map((p, idx) => (
                  <ChessPieceView key={idx} piece={p} className="w-4 h-4 opacity-80" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Controls, Move History, and Settings */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Game Controls Panel */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Match Options</span>
                <span className="text-[10px] text-slate-500 font-normal">Turn: {gameState.turn === 'w' ? 'White' : 'Black'}</span>
              </h3>

              {/* Game Mode Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                  Play Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setGameMode('ai');
                      handleResetGame();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                      gameMode === 'ai'
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-750 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>vs AI Bot</span>
                  </button>
                  <button
                    onClick={() => {
                      setGameMode('pass_and_play');
                      handleResetGame();
                    }}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-colors ${
                      gameMode === 'pass_and_play'
                        ? 'bg-red-600 text-white shadow'
                        : 'bg-slate-750 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>2-Player</span>
                  </button>
                </div>
              </div>

              {/* AI Difficulty Selector */}
              {gameMode === 'ai' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1.5">
                    Bot Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setAiDifficulty(lvl)}
                        className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
                          aiDifficulty === lvl
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-700/60 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Reset & Undo */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/60">
                <button
                  onClick={handleResetGame}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-red-600 text-slate-200 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Board</span>
                </button>
                <button
                  onClick={handleUndoMove}
                  disabled={gameState.history.length === 0 || isAiThinking}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-700/80 hover:bg-slate-600 text-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>Undo</span>
                </button>
              </div>

              {/* Board Flip and Color Switch */}
              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  onClick={() => setBoardFlipped(!boardFlipped)}
                  className="text-slate-400 hover:text-white text-[11px] font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Flip Board
                </button>
                {gameMode === 'ai' && (
                  <button
                    onClick={() => {
                      const next = playerColor === 'w' ? 'b' : 'w';
                      setPlayerColor(next);
                      handleResetGame();
                    }}
                    className="text-slate-400 hover:text-white text-[11px] font-semibold"
                  >
                    Play as {playerColor === 'w' ? 'Black' : 'White'}
                  </button>
                )}
              </div>
            </div>

            {/* Move History / Notation Log */}
            <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/60 space-y-2 flex-1 max-h-[160px] sm:max-h-[220px] overflow-hidden flex flex-col">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Move Notation ({gameState.history.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-1 pr-1 font-mono text-xs">
                {gameState.history.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-4 text-center">
                    No moves played yet. White begins.
                  </p>
                ) : (
                  Array.from({ length: Math.ceil(gameState.history.length / 2) }).map((_, i) => {
                    const whiteMv = gameState.history[i * 2];
                    const blackMv = gameState.history[i * 2 + 1];
                    return (
                      <div key={i} className="flex items-center justify-between py-0.5 px-2 rounded hover:bg-slate-700/40 text-[11px]">
                        <span className="text-slate-500 w-8">{i + 1}.</span>
                        <span className="text-white font-semibold flex-1">
                          {moveToAlgebraic(whiteMv)}
                        </span>
                        <span className="text-slate-300 font-semibold flex-1">
                          {blackMv ? moveToAlgebraic(blackMv) : ''}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* In-Game User Statistics Preview */}
            <div className="bg-gradient-to-r from-red-950/40 to-slate-800/80 rounded-2xl p-4 border border-red-900/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> Your Record
                </span>
                <span className="text-[11px] text-slate-400">
                  {winRate}% Win Rate
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-700/40">
                  <span className="text-[10px] text-slate-400 block">Played</span>
                  <span className="font-black text-white">{stats.gamesPlayed}</span>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-2 border border-emerald-900/30">
                  <span className="text-[10px] text-emerald-400 block">Won</span>
                  <span className="font-black text-emerald-300">{stats.gamesWon}</span>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-2 border border-rose-900/30">
                  <span className="text-[10px] text-rose-400 block">Lost</span>
                  <span className="font-black text-rose-300">{stats.gamesLost}</span>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-2 border border-amber-900/30">
                  <span className="text-[10px] text-amber-400 block">Resets</span>
                  <span className="font-black text-amber-300">{stats.resetsCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Detailed Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Player Statistics
              </h3>
              <button
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/80">
                <span className="text-slate-400">Total Games Played</span>
                <span className="font-bold text-white">{stats.gamesPlayed}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
                <span className="text-emerald-300">Games Won</span>
                <span className="font-bold text-emerald-400">{stats.gamesWon}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-rose-950/40 border border-rose-800/40">
                <span className="text-rose-300">Games Lost</span>
                <span className="font-bold text-rose-400">{stats.gamesLost}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/80">
                <span className="text-slate-400">Games Drawn</span>
                <span className="font-bold text-white">{stats.gamesDrawn}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-amber-950/40 border border-amber-800/40">
                <span className="text-amber-300">Board Resets</span>
                <span className="font-bold text-amber-400">{stats.resetsCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-800/80">
                <span className="text-slate-400">Win Rate</span>
                <span className="font-bold text-white">{winRate}%</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={handleClearStats}
                className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline"
              >
                Reset All Statistics
              </button>
              <button
                onClick={() => setShowStatsModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
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
