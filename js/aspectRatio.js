/**
 * Video Wall Calculator – Aspect ratio presets and helpers
 */

import { ASPECT_RATIO_PRESETS } from './constants.js';

/**
 * Get numeric ratio for a preset label (e.g. '16:9' -> 1.777...).
 * @param {string} label
 * @returns {number}
 */
export function getPresetRatio(label) {
  const r = ASPECT_RATIO_PRESETS[label];
  return r !== undefined ? r : 1;
}

/**
 * Find the preset whose ratio is closest to the given value.
 * @param {number} ratio
 * @returns {string}
 */
export function closestPreset(ratio) {
  if (!Number.isFinite(ratio) || ratio <= 0) return '16:9';
  let best = '16:9';
  let bestDiff = Infinity;
  for (const [label, r] of Object.entries(ASPECT_RATIO_PRESETS)) {
    const diff = Math.abs(r - ratio);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = label;
    }
  }
  return best;
}

/**
 * Format aspect ratio for display (e.g. 1.777 -> "1.78").
 * @param {number} ratio
 * @param {number} [decimals=2]
 * @returns {string}
 */
export function formatRatio(ratio, decimals = 2) {
  if (!Number.isFinite(ratio)) return '—';
  return ratio.toFixed(decimals);
}
