/**
 * Calculates reading time based on standard average reading speed of 200 words per minute.
 */
export function calculateReadingTime(content: string): string {
  if (!content) return '1 min read';
  const cleanText = content.replace(/<[^>]*>/g, '').replace(/[#*_`]/g, '');
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
