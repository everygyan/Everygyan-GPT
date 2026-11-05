import { describe, it, expect } from 'vitest';
import {
  cleanMarkdownForSpeech,
  segmentArticleText,
  formatAudioTime,
} from '../utils/textToSpeech';

describe('Text-to-Speech Utilities', () => {
  describe('cleanMarkdownForSpeech', () => {
    it('strips markdown links, keeping only the label', () => {
      const input = 'Read the [full announcement here](https://example.com/news) for details.';
      expect(cleanMarkdownForSpeech(input)).toBe('Read the full announcement here for details.');
    });

    it('strips bold and italic markdown tags', () => {
      const input = 'This is **very important** and *essential* reading.';
      expect(cleanMarkdownForSpeech(input)).toBe('This is very important and essential reading.');
    });

    it('strips code blocks and images', () => {
      const input = 'Here is an image: ![Alt photo](https://cdn.example.com/pic.jpg)\n```const x = 10;```\nEnjoy!';
      expect(cleanMarkdownForSpeech(input)).toBe('Here is an image: Enjoy!');
    });

    it('strips headings and list bullet markers', () => {
      const input = '## Key Takeaways\n* Point one\n* Point two\n1. Numbered item';
      expect(cleanMarkdownForSpeech(input)).toBe('Key Takeaways Point one Point two Numbered item');
    });

    it('strips raw HTML tags', () => {
      const input = '<p>Welcome to <strong>EveryGyan</strong> news portal.</p>';
      expect(cleanMarkdownForSpeech(input)).toBe('Welcome to EveryGyan news portal.');
    });
  });

  describe('segmentArticleText', () => {
    it('creates chunks starting with title and excerpt', () => {
      const result = segmentArticleText({
        title: 'New AI Breakthrough',
        excerpt: 'Researchers announce high efficiency reasoning model.',
        content: 'The new system outperforms prior benchmarks across multiple tasks.',
      });

      expect(result.chunks.length).toBeGreaterThanOrEqual(2);
      expect(result.chunks[0]).toContain('New AI Breakthrough');
      expect(result.chunks[0]).toContain('Researchers announce');
      expect(result.totalWords).toBeGreaterThan(0);
      expect(result.estimatedDurationSeconds).toBeGreaterThan(0);
    });

    it('splits longer paragraphs into bite-sized segments', () => {
      const longPara =
        'Artificial intelligence has continued to evolve at an unprecedented pace over the last twelve months. Many researchers believe that agentic workflows will redefine software development. New models are capable of tool calling and self-correction. This enables automated tasks with minimal human intervention.';

      const result = segmentArticleText({
        title: 'Tech Update',
        content: longPara,
      });

      // Should split into reasonable chunks without dropping text
      expect(result.chunks.length).toBeGreaterThan(1);
      const combined = result.chunks.join(' ');
      expect(combined).toContain('unprecedented pace');
      expect(combined).toContain('minimal human intervention');
    });
  });

  describe('formatAudioTime', () => {
    it('formats seconds into MM:SS format accurately', () => {
      expect(formatAudioTime(0)).toBe('0:00');
      expect(formatAudioTime(45)).toBe('0:45');
      expect(formatAudioTime(60)).toBe('1:00');
      expect(formatAudioTime(125)).toBe('2:05');
      expect(formatAudioTime(615)).toBe('10:15');
    });
  });
});
