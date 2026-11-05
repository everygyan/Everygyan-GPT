/**
 * Utilities for cleaning article content, segmenting prose for Web Speech API synthesis,
 * and estimating listening times.
 */

/**
 * Strips markdown symbols, raw HTML, links, code blocks, and formatting
 * to produce clean, natural spoken prose.
 */
export function cleanMarkdownForSpeech(text: string): string {
  if (!text) return '';

  return (
    text
      // Remove code blocks ```...```
      .replace(/```[\s\S]*?```/g, ' ')
      // Remove inline code `...`
      .replace(/`([^`]+)`/g, '$1')
      // Remove image syntax ![alt](url)
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, ' ')
      // Convert markdown links [label](url) to just the label
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      // Remove markdown headings (#, ##, ###)
      .replace(/^#{1,6}\s+/gm, '')
      // Remove blockquotes (> )
      .replace(/^>\s+/gm, '')
      // Remove bold and italic markers (*, _, ~~)
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      // Remove markdown horizontal rules
      .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')
      // Remove markdown list bullets/numbers
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      // Remove HTML tags
      .replace(/<[^>]*>/g, ' ')
      // Replace multiple newlines/spaces with a single space
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export interface SpeechSegmentation {
  chunks: string[];
  totalWords: number;
  estimatedDurationSeconds: number;
}

/**
 * Segments an article into manageable spoken chunks (sentences/paragraphs).
 * Browser SpeechSynthesis engines (especially Chrome & Safari) can timeout or pause
 * if a single utterance string exceeds ~15 seconds. Chunking ensures smooth, continuous
 * playback and enables precise seeking.
 */
export function segmentArticleText(article: {
  title: string;
  excerpt?: string;
  content: string;
}): SpeechSegmentation {
  const rawChunks: string[] = [];

  // Introduction chunk: Title and Excerpt
  const cleanTitle = cleanMarkdownForSpeech(article.title);
  const cleanExcerpt = cleanMarkdownForSpeech(article.excerpt || '');

  if (cleanTitle) {
    if (cleanExcerpt) {
      rawChunks.push(`${cleanTitle}. ${cleanExcerpt}`);
    } else {
      rawChunks.push(cleanTitle);
    }
  } else if (cleanExcerpt) {
    rawChunks.push(cleanExcerpt);
  }

  // Split content by paragraphs first
  const paragraphs = article.content.split(/\n\s*\n/);

  for (const para of paragraphs) {
    const cleaned = cleanMarkdownForSpeech(para);
    if (!cleaned || cleaned.length < 3) continue;

    // If paragraph is comfortably short (< 180 chars), keep as one chunk
    if (cleaned.length <= 180) {
      rawChunks.push(cleaned);
    } else {
      // Split into sentences using punctuation boundaries
      const sentences = cleaned.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g) || [cleaned];
      let currentBuffer = '';

      for (const sentence of sentences) {
        const trimmed = sentence.trim();
        if (!trimmed) continue;

        if (currentBuffer.length + trimmed.length > 160) {
          if (currentBuffer) rawChunks.push(currentBuffer.trim());
          currentBuffer = trimmed;
        } else {
          currentBuffer = currentBuffer ? `${currentBuffer} ${trimmed}` : trimmed;
        }
      }

      if (currentBuffer.trim()) {
        rawChunks.push(currentBuffer.trim());
      }
    }
  }

  // Filter out empty or whitespace-only chunks
  const chunks = rawChunks.map((c) => c.trim()).filter((c) => c.length > 0);

  // Total word count calculation
  const totalWords = chunks.reduce((acc, chunk) => {
    const words = chunk.split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  // Average reading speed: ~150 words per minute = 2.5 words/sec
  const estimatedDurationSeconds = Math.max(10, Math.ceil(totalWords / 2.5));

  return {
    chunks,
    totalWords,
    estimatedDurationSeconds,
  };
}

/**
 * Formats seconds into MM:SS display
 */
export function formatAudioTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
