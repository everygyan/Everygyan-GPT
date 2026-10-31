import { describe, it, expect } from 'vitest';
import {
  initGrid,
  slideRowLeft,
  makeMove,
  hasMovesLeft,
  hasWon2048,
  getHighestTile,
  Grid2048,
} from '../utils/engine2048';

describe('2048 Game Engine', () => {
  it('initializes a 4x4 grid with exactly 2 starting tiles (2 or 4)', () => {
    const grid = initGrid();
    expect(grid).toHaveLength(4);
    grid.forEach((row) => expect(row).toHaveLength(4));

    const nonZeroTiles = grid.flat().filter((val) => val !== 0);
    expect(nonZeroTiles).toHaveLength(2);
    nonZeroTiles.forEach((val) => {
      expect([2, 4]).toContain(val);
    });
  });

  describe('slideRowLeft', () => {
    it('slides and compresses non-zero elements to the left', () => {
      const { newRow, scoreGained, merged } = slideRowLeft([0, 2, 0, 4]);
      expect(newRow).toEqual([2, 4, 0, 0]);
      expect(scoreGained).toBe(0);
      expect(merged).toBe(false);
    });

    it('merges adjacent identical values once per turn and increments score', () => {
      const { newRow, scoreGained, merged } = slideRowLeft([2, 2, 0, 0]);
      expect(newRow).toEqual([4, 0, 0, 0]);
      expect(scoreGained).toBe(4);
      expect(merged).toBe(true);
    });

    it('handles multiple merges in a single row without chaining', () => {
      // [2, 2, 2, 2] -> should merge pairs to [4, 4, 0, 0], NOT chain into [8, 0, 0, 0]
      const { newRow, scoreGained } = slideRowLeft([2, 2, 2, 2]);
      expect(newRow).toEqual([4, 4, 0, 0]);
      expect(scoreGained).toBe(8);
    });

    it('prioritizes left-most pair when 3 identical tiles exist', () => {
      // [2, 2, 2, 0] -> [4, 2, 0, 0]
      const { newRow, scoreGained } = slideRowLeft([2, 2, 2, 0]);
      expect(newRow).toEqual([4, 2, 0, 0]);
      expect(scoreGained).toBe(4);
    });
  });

  describe('makeMove', () => {
    it('slides board left correctly', () => {
      const testGrid: Grid2048 = [
        [2, 0, 2, 0],
        [0, 4, 0, 4],
        [0, 0, 0, 0],
        [8, 8, 0, 0],
      ];

      const res = makeMove(testGrid, 'left');
      expect(res.moved).toBe(true);
      expect(res.scoreGained).toBe(4 + 8 + 16); // 28
      // After left, first row has 4 at index 0
      expect(res.grid[0][0]).toBe(4);
      expect(res.grid[1][0]).toBe(8);
      expect(res.grid[3][0]).toBe(16);
    });

    it('slides board up correctly', () => {
      const testGrid: Grid2048 = [
        [2, 0, 0, 0],
        [2, 0, 0, 0],
        [4, 0, 0, 0],
        [0, 0, 0, 0],
      ];

      const res = makeMove(testGrid, 'up');
      expect(res.moved).toBe(true);
      expect(res.scoreGained).toBe(4);
      expect(res.grid[0][0]).toBe(4);
      expect(res.grid[1][0]).toBe(4);
    });
  });

  describe('Game state evaluation', () => {
    it('accurately identifies win condition when 2048 is present', () => {
      const winGrid: Grid2048 = [
        [2, 4, 8, 16],
        [32, 64, 128, 256],
        [512, 1024, 2048, 0],
        [0, 0, 0, 0],
      ];
      expect(hasWon2048(winGrid)).toBe(true);
      expect(getHighestTile(winGrid)).toBe(2048);
    });

    it('identifies game over when no empty cells and no adjacent matches exist', () => {
      const lockedGrid: Grid2048 = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 4, 2],
      ];
      expect(hasMovesLeft(lockedGrid)).toBe(false);
    });

    it('identifies moves available when adjacent cells match even on full board', () => {
      const fullButMovableGrid: Grid2048 = [
        [2, 4, 2, 4],
        [4, 2, 4, 2],
        [2, 4, 2, 4],
        [4, 2, 2, 2], // 2s match here
      ];
      expect(hasMovesLeft(fullButMovableGrid)).toBe(true);
    });
  });
});
