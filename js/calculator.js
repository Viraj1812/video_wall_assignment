/**
 * Video Wall Calculator – Core calculation
 * Converts user inputs to target dimensions in mm, generates candidate grids,
 * scores them (dimension + ratio error), returns closest lower and upper configurations.
 */

import { CABINETS, MIN_COLS, MIN_ROWS, MAX_COLS, MAX_ROWS, CANDIDATE_RADIUS } from './constants.js';
import { deriveDimensions } from './geometry.js';
import { getPresetRatio } from './aspectRatio.js';

/** @typedef {{ cols: number, rows: number, totalCabinets: number, widthMm: number, heightMm: number, diagonalMm: number, aspectRatio: number }} Config */

/**
 * Weight for aspect ratio error in score (so both dimension and ratio matter).
 */
const RATIO_ERROR_WEIGHT = 1.5;

/**
 * Compute final dimensions and aspect ratio for a grid (cols, rows) with given cabinet.
 * @param {number} cols
 * @param {number} rows
 * @param {{ width: number, height: number }} cabinet
 * @returns {{ widthMm: number, heightMm: number, diagonalMm: number, aspectRatio: number }}
 */
function configDimensions(cols, rows, cabinet) {
  const widthMm = cols * cabinet.width;
  const heightMm = rows * cabinet.height;
  const diagonalMm = Math.sqrt(widthMm * widthMm + heightMm * heightMm);
  const aspectRatio = widthMm / heightMm;
  return { widthMm, heightMm, diagonalMm, aspectRatio };
}

/**
 * Score a candidate: dimension error (relative) + weighted ratio error.
 * Lower score = better match.
 * @param {{ widthMm: number, heightMm: number, diagonalMm: number, aspectRatio: number }} final
 * @param {{ widthMm: number, heightMm: number, diagonalMm: number, aspectRatio: number }} target
 * @returns {number}
 */
function score(final, target) {
  const dw = Math.abs(final.widthMm - target.widthMm) / (target.widthMm || 1);
  const dh = Math.abs(final.heightMm - target.heightMm) / (target.heightMm || 1);
  const dd = Math.abs(final.diagonalMm - target.diagonalMm) / (target.diagonalMm || 1);
  const dimensionError = dw + dh + dd;
  const ratioError = Math.abs(final.aspectRatio - target.aspectRatio);
  return dimensionError + RATIO_ERROR_WEIGHT * ratioError;
}

/**
 * Build full Config for (cols, rows).
 * @param {number} cols
 * @param {number} rows
 * @param {{ width: number, height: number }} cabinet
 * @returns {Config}
 */
function toConfig(cols, rows, cabinet) {
  const { widthMm, heightMm, diagonalMm, aspectRatio } = configDimensions(cols, rows, cabinet);
  return {
    cols,
    rows,
    totalCabinets: cols * rows,
    widthMm,
    heightMm,
    diagonalMm,
    aspectRatio,
  };
}

/**
 * Get target dimensions in mm from state-like input.
 * activeInputs: two of 'aspectRatio'|'height'|'width'|'diagonal'
 * valuesMm: { height?, width?, diagonal? }
 * aspectRatioPreset: e.g. '16:9'
 * @param {{ cabinetType: '16:9'|'1:1', activeInputs: string[], valuesMm: object, aspectRatioPreset: string }} input
 * @returns {{ widthMm: number, heightMm: number, diagonalMm: number, aspectRatio: number }}
 */
function getTargetDimensions(input) {
  const known = {};
  for (const key of input.activeInputs) {
    if (key === 'aspectRatio') {
      known.aspectRatio = getPresetRatio(input.aspectRatioPreset);
    } else {
      const v = input.valuesMm[key];
      if (v != null) known[`${key}Mm`] = v;
    }
  }
  return deriveDimensions(known);
}

/**
 * Generate candidate (cols, rows) around estimated values, within bounds.
 * @param {number} targetWidthMm
 * @param {number} targetHeightMm
 * @param {{ width: number, height: number }} cabinet
 * @returns {{ cols: number, rows: number }[]}
 */
function generateCandidates(targetWidthMm, targetHeightMm, cabinet) {
  const cols0 = Math.round(targetWidthMm / cabinet.width) || 1;
  const rows0 = Math.round(targetHeightMm / cabinet.height) || 1;
  const candidates = [];
  for (let dc = -CANDIDATE_RADIUS; dc <= CANDIDATE_RADIUS; dc++) {
    for (let dr = -CANDIDATE_RADIUS; dr <= CANDIDATE_RADIUS; dr++) {
      const cols = Math.max(MIN_COLS, Math.min(MAX_COLS, cols0 + dc));
      const rows = Math.max(MIN_ROWS, Math.min(MAX_ROWS, rows0 + dr));
      candidates.push({ cols, rows });
    }
  }
  // Dedupe
  const seen = new Set();
  return candidates.filter(({ cols, rows }) => {
    const key = `${cols},${rows}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Compute closest lower and upper cabinet configurations.
 * Lower = best-scoring config with final diagonal <= target diagonal (or exact match).
 * Upper = best-scoring config with final diagonal >= target diagonal.
 * If exact match exists, it is lower; next larger is upper.
 *
 * @param {{ cabinetType: '16:9'|'1:1', activeInputs: string[], valuesMm: object, aspectRatioPreset: string }} input
 * @returns {{ lower: Config|null, upper: Config|null }}
 */
export function computeConfigurations(input) {
  const cabinet = CABINETS[input.cabinetType];
  if (!cabinet) return { lower: null, upper: null };

  let target;
  try {
    target = getTargetDimensions(input);
  } catch (_) {
    return { lower: null, upper: null };
  }
  if (!Number.isFinite(target.widthMm) || !Number.isFinite(target.heightMm) || target.widthMm <= 0 || target.heightMm <= 0) {
    return { lower: null, upper: null };
  }
  const candidates = generateCandidates(target.widthMm, target.heightMm, cabinet);

  const targetDiagonal = target.diagonalMm;
  /** @type {Config|null} */
  let bestLower = null;
  let bestLowerScore = Infinity;
  /** @type {Config|null} */
  let bestUpper = null;
  let bestUpperScore = Infinity;
  /** @type {Config|null} */
  let exactMatch = null;

  for (const { cols, rows } of candidates) {
    const config = toConfig(cols, rows, cabinet);
    const s = score(
      { widthMm: config.widthMm, heightMm: config.heightMm, diagonalMm: config.diagonalMm, aspectRatio: config.aspectRatio },
      target
    );

    // Consider exact match (diagonal within small tolerance)
    if (Math.abs(config.diagonalMm - targetDiagonal) < 0.01) {
      if (exactMatch === null || s < score(
        { widthMm: exactMatch.widthMm, heightMm: exactMatch.heightMm, diagonalMm: exactMatch.diagonalMm, aspectRatio: exactMatch.aspectRatio },
        target
      )) {
        exactMatch = config;
      }
    }

    if (config.diagonalMm <= targetDiagonal) {
      if (s < bestLowerScore) {
        bestLowerScore = s;
        bestLower = config;
      }
    }
    if (config.diagonalMm >= targetDiagonal) {
      if (s < bestUpperScore) {
        bestUpperScore = s;
        bestUpper = config;
      }
    }
  }

  // If we found an exact match, it becomes lower; upper is the next larger (or same if no larger)
  if (exactMatch) {
    bestLower = exactMatch;
    if (bestUpper && bestUpper.diagonalMm <= exactMatch.diagonalMm + 0.01) {
      // Upper should be strictly above exact; expand to nearby larger grids if needed
      const fromCandidates = candidates
        .map(({ cols, rows }) => toConfig(cols, rows, cabinet))
        .filter(c => c.diagonalMm > exactMatch.diagonalMm + 0.01)
        .sort((a, b) => score(
          { widthMm: a.widthMm, heightMm: a.heightMm, diagonalMm: a.diagonalMm, aspectRatio: a.aspectRatio },
          target
        ) - score(
          { widthMm: b.widthMm, heightMm: b.heightMm, diagonalMm: b.diagonalMm, aspectRatio: b.aspectRatio },
          target
        ));
      let above = fromCandidates[0] || null;
      if (!above) {
        const extra = [];
        for (let dc = 1; dc <= 2; dc++) {
          for (let dr = 0; dr <= 2; dr++) {
            const c = Math.min(MAX_COLS, exactMatch.cols + dc);
            const r = Math.min(MAX_ROWS, exactMatch.rows + dr);
            extra.push(toConfig(c, r, cabinet));
          }
        }
        for (let dr = 1; dr <= 2; dr++) {
          const r = Math.min(MAX_ROWS, exactMatch.rows + dr);
          extra.push(toConfig(exactMatch.cols, r, cabinet));
        }
        const sorted = extra
          .filter(c => c.diagonalMm > exactMatch.diagonalMm + 0.01)
          .sort((a, b) => score(
            { widthMm: a.widthMm, heightMm: a.heightMm, diagonalMm: a.diagonalMm, aspectRatio: a.aspectRatio },
            target
          ) - score(
            { widthMm: b.widthMm, heightMm: b.heightMm, diagonalMm: b.diagonalMm, aspectRatio: b.aspectRatio },
            target
          ));
        above = sorted[0] || null;
      }
      if (above) bestUpper = above;
    }
  }

  return { lower: bestLower, upper: bestUpper };
}
