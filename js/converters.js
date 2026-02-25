/**
 * Video Wall Calculator – Unit conversion
 * All internal calculations use mm. Pure functions for value <-> mm.
 */

import { MM_PER_M, MM_PER_FT, MM_PER_IN } from './constants.js';

/** @typedef {'mm'|'m'|'ft'|'in'} Unit */

const FACTORS_TO_MM = {
  mm: 1,
  m: MM_PER_M,
  ft: MM_PER_FT,
  in: MM_PER_IN,
};

/**
 * Convert a value in the given unit to mm.
 * @param {number} value
 * @param {Unit} unit
 * @returns {number}
 */
export function valueToMm(value, unit) {
  const factor = FACTORS_TO_MM[unit];
  if (factor === undefined) return value;
  return value * factor;
}

/**
 * Convert mm to a value in the given unit (for display).
 * @param {number} mm
 * @param {Unit} unit
 * @param {number} [decimals=2]
 * @returns {number}
 */
export function mmToValue(mm, unit, decimals = 2) {
  const factor = FACTORS_TO_MM[unit];
  if (factor === undefined) return mm;
  const v = mm / factor;
  if (decimals >= 0) return roundTo(v, decimals);
  return v;
}

/**
 * Round to given decimal places (returns number, not string).
 * @param {number} n
 * @param {number} decimals
 * @returns {number}
 */
function roundTo(n, decimals) {
  const p = 10 ** decimals;
  return Math.round(n * p) / p;
}
