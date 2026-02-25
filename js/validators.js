/**
 * Video Wall Calculator – Validators
 * Two-input rule and numeric validation.
 */

/** @typedef {'aspectRatio'|'height'|'width'|'diagonal'} InputKey */

/**
 * Returns how many inputs are currently active.
 * @param {InputKey[]} activeInputs
 * @returns {number}
 */
export function getActiveInputCount(activeInputs) {
  return activeInputs.length;
}

/**
 * Whether the user can select this input (either already selected or fewer than 2 selected).
 * @param {InputKey} inputId
 * @param {InputKey[]} activeInputs
 * @returns {boolean}
 */
export function canSelectInput(inputId, activeInputs) {
  if (activeInputs.includes(inputId)) return true;
  return activeInputs.length < 2;
}

/**
 * Check if a numeric value is valid (non-empty, finite number).
 * @param {string|number} value
 * @returns {boolean}
 */
export function validateNumeric(value) {
  if (value === '' || value === null || value === undefined) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}

/**
 * Whether we have exactly two inputs selected (required for Apply).
 * @param {InputKey[]} activeInputs
 * @returns {boolean}
 */
export function hasTwoInputs(activeInputs) {
  return activeInputs.length === 2;
}
