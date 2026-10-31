/**
 * Pure TypeScript Chess Engine
 * Self-contained move validation, check/checkmate detection, and Minimax AI.
 */

export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export type Board = (Piece | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece | null;
  promotion?: PieceType;
  isCastling?: 'kingside' | 'queenside';
}

export interface CastlingRights {
  wK: boolean; // white kingside
  wQ: boolean; // white queenside
  bK: boolean; // black kingside
  bQ: boolean; // black queenside
}

export interface GameState {
  board: Board;
  turn: PieceColor;
  castling: CastlingRights;
  halfMoves: number;
  fullMoves: number;
  history: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  capturedWhite: Piece[];
  capturedBlack: Piece[];
}

export const INITIAL_BOARD: Board = [
  [
    { type: 'r', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'q', color: 'b' },
    { type: 'k', color: 'b' },
    { type: 'b', color: 'b' },
    { type: 'n', color: 'b' },
    { type: 'r', color: 'b' },
  ],
  Array(8).fill(null).map(() => ({ type: 'p', color: 'b' })),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map(() => ({ type: 'p', color: 'w' })),
  [
    { type: 'r', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'q', color: 'w' },
    { type: 'k', color: 'w' },
    { type: 'b', color: 'w' },
    { type: 'n', color: 'w' },
    { type: 'r', color: 'w' },
  ],
];

export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

export function createInitialGameState(): GameState {
  return {
    board: cloneBoard(INITIAL_BOARD),
    turn: 'w',
    castling: { wK: true, wQ: true, bK: true, bQ: true },
    halfMoves: 0,
    fullMoves: 1,
    history: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    capturedWhite: [],
    capturedBlack: [],
  };
}

export function isInside(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

export function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

/**
 * Checks if a square is attacked by any piece of the opposing color.
 */
export function isSquareAttacked(board: Board, target: Position, byColor: PieceColor): boolean {
  const { row: tr, col: tc } = target;

  // 1. Pawn attacks
  const pawnDir = byColor === 'w' ? 1 : -1; // Pawns moving forward to attack
  const pawnR = tr + pawnDir;
  if (pawnR >= 0 && pawnR < 8) {
    for (const offset of [-1, 1]) {
      const pawnC = tc + offset;
      if (pawnC >= 0 && pawnC < 8) {
        const p = board[pawnR][pawnC];
        if (p && p.color === byColor && p.type === 'p') return true;
      }
    }
  }

  // 2. Knight attacks
  const knightMoves = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1],
  ];
  for (const [dr, dc] of knightMoves) {
    const r = tr + dr;
    const c = tc + dc;
    if (isInside(r, c)) {
      const p = board[r][c];
      if (p && p.color === byColor && p.type === 'n') return true;
    }
  }

  // 3. Straight rays (Rook or Queen)
  const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of straightDirs) {
    let r = tr + dr;
    let c = tc + dc;
    while (isInside(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'r' || p.type === 'q')) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  // 4. Diagonal rays (Bishop or Queen)
  const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagDirs) {
    let r = tr + dr;
    let c = tc + dc;
    while (isInside(r, c)) {
      const p = board[r][c];
      if (p) {
        if (p.color === byColor && (p.type === 'b' || p.type === 'q')) return true;
        break;
      }
      r += dr;
      c += dc;
    }
  }

  // 5. King attacks (adjacent squares)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = tr + dr;
      const c = tc + dc;
      if (isInside(r, c)) {
        const p = board[r][c];
        if (p && p.color === byColor && p.type === 'k') return true;
      }
    }
  }

  return false;
}

export function isCheck(board: Board, color: PieceColor): boolean {
  const king = findKing(board, color);
  if (!king) return false;
  const enemyColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(board, king, enemyColor);
}

/**
 * Generates pseudo-legal moves for a specific piece
 */
function getPseudoMovesForPiece(
  board: Board,
  r: number,
  c: number,
  castling: CastlingRights
): Move[] {
  const piece = board[r][c];
  if (!piece) return [];

  const moves: Move[] = [];
  const color = piece.color;
  const enemy = color === 'w' ? 'b' : 'w';

  if (piece.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const promoRow = color === 'w' ? 0 : 7;

    // 1-step forward
    const nextR = r + dir;
    if (isInside(nextR, c) && !board[nextR][c]) {
      if (nextR === promoRow) {
        for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
          moves.push({ from: { row: r, col: c }, to: { row: nextR, col: c }, piece, promotion: promo });
        }
      } else {
        moves.push({ from: { row: r, col: c }, to: { row: nextR, col: c }, piece });
      }

      // 2-step forward from starting row
      const doubleR = r + 2 * dir;
      if (r === startRow && isInside(doubleR, c) && !board[doubleR][c]) {
        moves.push({ from: { row: r, col: c }, to: { row: doubleR, col: c }, piece });
      }
    }

    // Diagonal captures
    for (const offset of [-1, 1]) {
      const capC = c + offset;
      if (isInside(nextR, capC)) {
        const target = board[nextR][capC];
        if (target && target.color === enemy) {
          if (nextR === promoRow) {
            for (const promo of ['q', 'r', 'b', 'n'] as PieceType[]) {
              moves.push({
                from: { row: r, col: c },
                to: { row: nextR, col: capC },
                piece,
                captured: target,
                promotion: promo,
              });
            }
          } else {
            moves.push({
              from: { row: r, col: c },
              to: { row: nextR, col: capC },
              piece,
              captured: target,
            });
          }
        }
      }
    }
  } else if (piece.type === 'n') {
    const knightOffsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1],
    ];
    for (const [dr, dc] of knightOffsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (isInside(nr, nc)) {
        const target = board[nr][nc];
        if (!target || target.color === enemy) {
          moves.push({
            from: { row: r, col: c },
            to: { row: nr, col: nc },
            piece,
            captured: target,
          });
        }
      }
    }
  } else if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
    const dirs: number[][] = [];
    if (piece.type === 'b' || piece.type === 'q') {
      dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
    }
    if (piece.type === 'r' || piece.type === 'q') {
      dirs.push([-1, 0], [1, 0], [0, -1], [0, 1]);
    }

    for (const [dr, dc] of dirs) {
      let nr = r + dr;
      let nc = c + dc;
      while (isInside(nr, nc)) {
        const target = board[nr][nc];
        if (!target) {
          moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc }, piece });
        } else {
          if (target.color === enemy) {
            moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc }, piece, captured: target });
          }
          break;
        }
        nr += dr;
        nc += dc;
      }
    }
  } else if (piece.type === 'k') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (isInside(nr, nc)) {
          const target = board[nr][nc];
          if (!target || target.color === enemy) {
            moves.push({ from: { row: r, col: c }, to: { row: nr, col: nc }, piece, captured: target });
          }
        }
      }
    }

    // Castling
    const isWhite = color === 'w';
    const kingRow = isWhite ? 7 : 0;
    if (r === kingRow && c === 4) {
      const kingsideRight = isWhite ? castling.wK : castling.bK;
      const queensideRight = isWhite ? castling.wQ : castling.bQ;

      // Kingside: e-f-g clear, f & g not under attack, king not in check
      if (kingsideRight && !board[kingRow][5] && !board[kingRow][6]) {
        const rook = board[kingRow][7];
        if (rook && rook.type === 'r' && rook.color === color) {
          if (
            !isCheck(board, color) &&
            !isSquareAttacked(board, { row: kingRow, col: 5 }, enemy) &&
            !isSquareAttacked(board, { row: kingRow, col: 6 }, enemy)
          ) {
            moves.push({
              from: { row: r, col: c },
              to: { row: kingRow, col: 6 },
              piece,
              isCastling: 'kingside',
            });
          }
        }
      }

      // Queenside: b-c-d clear, c & d not under attack, king not in check
      if (queensideRight && !board[kingRow][1] && !board[kingRow][2] && !board[kingRow][3]) {
        const rook = board[kingRow][0];
        if (rook && rook.type === 'r' && rook.color === color) {
          if (
            !isCheck(board, color) &&
            !isSquareAttacked(board, { row: kingRow, col: 2 }, enemy) &&
            !isSquareAttacked(board, { row: kingRow, col: 3 }, enemy)
          ) {
            moves.push({
              from: { row: r, col: c },
              to: { row: kingRow, col: 2 },
              piece,
              isCastling: 'queenside',
            });
          }
        }
      }
    }
  }

  return moves;
}

/**
 * Applies a move to the board (pure function, returns cloned new board)
 */
export function applyMoveOnBoard(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  const { from, to, piece, promotion, isCastling } = move;

  next[from.row][from.col] = null;
  next[to.row][to.col] = promotion
    ? { type: promotion, color: piece.color }
    : { ...piece };

  // Handle rook movement on castling
  if (isCastling === 'kingside') {
    const row = to.row;
    next[row][7] = null;
    next[row][5] = { type: 'r', color: piece.color };
  } else if (isCastling === 'queenside') {
    const row = to.row;
    next[row][0] = null;
    next[row][3] = { type: 'r', color: piece.color };
  }

  return next;
}

/**
 * Gets all legal moves for a color, strictly filtering moves that leave king in check.
 */
export function getLegalMoves(
  board: Board,
  color: PieceColor,
  castling: CastlingRights
): Move[] {
  const legal: Move[] = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const pseudo = getPseudoMovesForPiece(board, r, c, castling);
        for (const mv of pseudo) {
          const testBoard = applyMoveOnBoard(board, mv);
          if (!isCheck(testBoard, color)) {
            legal.push(mv);
          }
        }
      }
    }
  }

  return legal;
}

export function makeMove(state: GameState, move: Move): GameState {
  const { from, piece } = move;
  const newBoard = applyMoveOnBoard(state.board, move);
  const nextTurn: PieceColor = state.turn === 'w' ? 'b' : 'w';

  // Update castling rights
  const newCastling: CastlingRights = { ...state.castling };
  if (piece.type === 'k') {
    if (piece.color === 'w') {
      newCastling.wK = false;
      newCastling.wQ = false;
    } else {
      newCastling.bK = false;
      newCastling.bQ = false;
    }
  }
  if (piece.type === 'r') {
    if (from.row === 7 && from.col === 7) newCastling.wK = false;
    if (from.row === 7 && from.col === 0) newCastling.wQ = false;
    if (from.row === 0 && from.col === 7) newCastling.bK = false;
    if (from.row === 0 && from.col === 0) newCastling.bQ = false;
  }

  // Update captured pieces
  const capturedWhite = [...state.capturedWhite];
  const capturedBlack = [...state.capturedBlack];
  if (move.captured) {
    if (move.captured.color === 'w') {
      capturedWhite.push(move.captured);
    } else {
      capturedBlack.push(move.captured);
    }
  }

  const inCheck = isCheck(newBoard, nextTurn);
  const nextLegalMoves = getLegalMoves(newBoard, nextTurn, newCastling);
  const isCheckmate = inCheck && nextLegalMoves.length === 0;
  const isStalemate = !inCheck && nextLegalMoves.length === 0;

  return {
    board: newBoard,
    turn: nextTurn,
    castling: newCastling,
    halfMoves: move.captured || piece.type === 'p' ? 0 : state.halfMoves + 1,
    fullMoves: state.turn === 'b' ? state.fullMoves + 1 : state.fullMoves,
    history: [...state.history, move],
    isCheck: inCheck,
    isCheckmate,
    isStalemate,
    isDraw: isStalemate || state.halfMoves >= 100,
    capturedWhite,
    capturedBlack,
  };
}

// ── Square notation & algebraic notation ──

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export function toSquareNotation(pos: Position): string {
  return `${FILES[pos.col]}${8 - pos.row}`;
}

export function moveToAlgebraic(move: Move): string {
  if (move.isCastling === 'kingside') return 'O-O';
  if (move.isCastling === 'queenside') return 'O-O-O';

  const pieceName = move.piece.type.toUpperCase();
  const dest = toSquareNotation(move.to);

  if (move.piece.type === 'p') {
    if (move.captured) {
      const srcFile = FILES[move.from.col];
      return `${srcFile}x${dest}${move.promotion ? `=${move.promotion.toUpperCase()}` : ''}`;
    }
    return `${dest}${move.promotion ? `=${move.promotion.toUpperCase()}` : ''}`;
  }

  const captureSymbol = move.captured ? 'x' : '';
  return `${pieceName}${captureSymbol}${dest}`;
}

// ── Web Audio Synth for Chess Sound Effects ──

class SoundFx {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  playMove() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  playCapture() {
    const ctx = this.getContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  playCheck() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    [520, 680].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.25, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.12);
    });
  }

  playGameOver() {
    const ctx = this.getContext();
    if (!ctx) return;
    const notes = [440, 554, 659, 880];
    const now = ctx.currentTime;
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      gain.gain.setValueAtTime(0.25, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.3);
    });
  }
}

export const sound = new SoundFx();

// ── Minimax AI Evaluation ──

const PIECE_VALUES: Record<PieceType, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square table (Pawn encouragement to center and advance)
const PAWN_TABLE_WHITE = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_TABLE = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

function evaluateBoard(board: Board): number {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = PIECE_VALUES[p.type];
      let posBonus = 0;

      if (p.type === 'p') {
        posBonus = p.color === 'w' ? PAWN_TABLE_WHITE[r][c] : PAWN_TABLE_WHITE[7 - r][c];
      } else if (p.type === 'n') {
        posBonus = KNIGHT_TABLE[r][c];
      }

      if (p.color === 'w') {
        score += val + posBonus;
      } else {
        score -= val + posBonus;
      }
    }
  }
  return score;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export function getAIMove(state: GameState, difficulty: AIDifficulty): Move | null {
  const legal = getLegalMoves(state.board, state.turn, state.castling);
  if (legal.length === 0) return null;

  // Easy: Random move with slight preference for captures
  if (difficulty === 'easy') {
    const captures = legal.filter((m) => m.captured);
    if (captures.length > 0 && Math.random() < 0.6) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legal[Math.floor(Math.random() * legal.length)];
  }

  // Medium: 1-ply evaluation with random noise
  if (difficulty === 'medium') {
    const isBlack = state.turn === 'b';
    let bestScore = isBlack ? Infinity : -Infinity;
    let bestMoves: Move[] = [];

    for (const move of legal) {
      const nextBoard = applyMoveOnBoard(state.board, move);
      const evalScore = evaluateBoard(nextBoard) + (Math.random() * 20 - 10);
      if (isBlack) {
        if (evalScore < bestScore) {
          bestScore = evalScore;
          bestMoves = [move];
        } else if (evalScore === bestScore) {
          bestMoves.push(move);
        }
      } else {
        if (evalScore > bestScore) {
          bestScore = evalScore;
          bestMoves = [move];
        } else if (evalScore === bestScore) {
          bestMoves.push(move);
        }
      }
    }
    return bestMoves[Math.floor(Math.random() * bestMoves.length)] || legal[0];
  }

  // Hard: 2-ply Minimax with capture-ordered alpha-beta pruning
  const isBlack = state.turn === 'b';
  let bestScore = isBlack ? Infinity : -Infinity;
  let bestMoves: Move[] = [];

  // Sort candidate moves so captures are analyzed first for optimal pruning
  const sortedLegal = [...legal].sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

  for (const move of sortedLegal) {
    const nextBoard = applyMoveOnBoard(state.board, move);
    const score = minimax(
      nextBoard,
      1,
      -Infinity,
      Infinity,
      !isBlack,
      state.castling
    );

    if (isBlack) {
      if (score < bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    } else {
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [move];
      } else if (score === bestScore) {
        bestMoves.push(move);
      }
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)] || sortedLegal[0];
}

function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  castling: CastlingRights
): number {
  if (depth === 0) {
    return evaluateBoard(board);
  }

  const turn: PieceColor = isMaximizing ? 'w' : 'b';
  const legal = getLegalMoves(board, turn, castling);

  if (legal.length === 0) {
    if (isCheck(board, turn)) {
      return isMaximizing ? -25000 : 25000;
    }
    return 0; // Stalemate
  }

  // Prioritize captures for maximum alpha-beta cutoff
  legal.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legal) {
      const next = applyMoveOnBoard(board, move);
      const evalScore = minimax(next, depth - 1, alpha, beta, false, castling);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legal) {
      const next = applyMoveOnBoard(board, move);
      const evalScore = minimax(next, depth - 1, alpha, beta, true, castling);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}
