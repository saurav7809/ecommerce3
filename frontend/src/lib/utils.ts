// ─── Utility helpers ─────────────────────────────────────────────────────────

/** Format a number as INR currency */
export const money = (n: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);

/** Build a full image URL — pass either an Unsplash photo ID or a full URL */
export const imageUrl = (src: string, w = 900): string =>
  src.startsWith('http')
    ? src
    : `https://images.unsplash.com/${src}?auto=format&fit=crop&w=${w}&q=85`;

/** Clamp a value between min and max */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/** Truncate text to a given length */
export const truncate = (text: string, max: number): string =>
  text.length > max ? text.slice(0, max) + '…' : text;

