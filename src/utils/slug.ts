/**
 * Generates a clean, URL-safe slug from a title string.
 */
export function generateSlug(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .normalize('NFD') // normalize accented characters
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // remove invalid characters
    .replace(/\s+/g, '-') // convert spaces to hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/**
 * Checks for collision against existing slugs and appends an incremental number if colliding.
 */
export function resolveUniqueSlug(
  baseSlug: string,
  existingSlugs: string[],
  _currentArticleId?: string,
  currentArticleSlug?: string
): string {
  if (!baseSlug) return 'article-' + Date.now();

  // If the slug hasn't changed for the current article, it's not a collision with itself
  if (currentArticleSlug && baseSlug === currentArticleSlug) {
    return baseSlug;
  }

  let candidate = baseSlug;
  let counter = 2;

  while (existingSlugs.includes(candidate)) {
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }

  return candidate;
}
