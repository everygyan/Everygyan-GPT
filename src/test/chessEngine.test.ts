import { describe, it, expect } from 'vitest';
import {
  createInitialGameState,
  makeMove,
  getLegalMoves,
  getAIMove,
} from '../utils/chessEngine';

describe('Chess Engine & AI', () => {
  it('generates 20 initial legal moves for White', () => {
    const state = createInitialGameState();
    const moves = getLegalMoves(state.board, 'w', state.castling);
    // 16 pawn moves (8 single + 8 double) + 4 knight moves = 20
    expect(moves.length).toBe(20);
  });

  it('generates AI moves correctly for Easy, Medium, and Hard', () => {
    const state = createInitialGameState();
    // Human plays e4
    const whitePawnMove = getLegalMoves(state.board, 'w', state.castling).find(
      (m) => m.from.row === 6 && m.from.col === 4 && m.to.row === 4 && m.to.col === 4
    );
    expect(whitePawnMove).toBeDefined();

    const afterWhite = makeMove(state, whitePawnMove!);
    expect(afterWhite.turn).toBe('b');

    // Test Easy AI
    const easyMove = getAIMove(afterWhite, 'easy');
    expect(easyMove).toBeDefined();
    expect(easyMove?.piece.color).toBe('b');

    // Test Medium AI
    const medMove = getAIMove(afterWhite, 'medium');
    expect(medMove).toBeDefined();
    expect(medMove?.piece.color).toBe('b');

    // Test Hard AI
    const hardMove = getAIMove(afterWhite, 'hard');
    expect(hardMove).toBeDefined();
    expect(hardMove?.piece.color).toBe('b');

    // Applying AI move should transition turn back to white
    const afterBlack = makeMove(afterWhite, easyMove!);
    expect(afterBlack.turn).toBe('w');
  });

  it('simulates 5 consecutive turns between AI and player', () => {
    let state = createInitialGameState();
    for (let turn = 0; turn < 5; turn++) {
      const legal = getLegalMoves(state.board, state.turn, state.castling);
      expect(legal.length).toBeGreaterThan(0);
      const move = getAIMove(state, 'easy');
      expect(move).toBeDefined();
      state = makeMove(state, move!);
    }
    expect(state.history.length).toBe(5);
  });
});
