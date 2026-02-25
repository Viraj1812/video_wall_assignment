/**
 * Video Wall Calculator – State
 * Single source of mutable state. No other module should use global variables.
 */

/** @typedef {'aspectRatio'|'height'|'width'|'diagonal'} InputKey */

/**
 * @typedef {Object} Config
 * @property {number} cols
 * @property {number} rows
 * @property {number} totalCabinets
 * @property {number} widthMm
 * @property {number} heightMm
 * @property {number} diagonalMm
 * @property {number} aspectRatio
 */

/**
 * @typedef {Object} Results
 * @property {Config|null} lower
 * @property {Config|null} upper
 */

const state = {
  /** @type {'16:9'|'1:1'} */
  cabinetType: '16:9',
  /** @type {'mm'|'m'|'ft'|'in'} */
  unit: 'mm',
  /** Which two parameters are active (max length 2) */
  /** @type {InputKey[]} */
  activeInputs: [],
  /** Dimension values in mm (height, width, diagonal). aspectRatio is stored separately. */
  /** @type {{ height?: number, width?: number, diagonal?: number }} */
  valuesMm: {},
  /** When aspect ratio is one of the two inputs, selected preset e.g. '16:9' */
  /** @type {string} */
  aspectRatioPreset: '16:9',
  /** @type {Results} */
  results: { lower: null, upper: null },
  /** @type {Config|null} */
  selectedConfig: null,
};

/**
 * @returns {'16:9'|'1:1'}
 */
export function getCabinetType() {
  return state.cabinetType;
}

/**
 * @param {'16:9'|'1:1'} value
 */
export function setCabinetType(value) {
  state.cabinetType = value;
}

/**
 * @returns {'mm'|'m'|'ft'|'in'}
 */
export function getUnit() {
  return state.unit;
}

/**
 * @param {'mm'|'m'|'ft'|'in'} value
 */
export function setUnit(value) {
  state.unit = value;
}

/**
 * @returns {InputKey[]}
 */
export function getActiveInputs() {
  return [...state.activeInputs];
}

/**
 * @param {InputKey[]} keys
 */
export function setActiveInputs(keys) {
  state.activeInputs = keys.slice(0, 2);
}

/**
 * @returns {{ height?: number, width?: number, diagonal?: number }}
 */
export function getValuesMm() {
  return { ...state.valuesMm };
}

/**
 * @param {keyof state.valuesMm} key
 * @param {number} valueMm
 */
export function setValueMm(key, valueMm) {
  state.valuesMm = { ...state.valuesMm, [key]: valueMm };
}

/**
 * Set multiple dimension values in mm at once (e.g. after deriving from geometry).
 * @param {{ height?: number, width?: number, diagonal?: number }} values
 */
export function setValuesMm(values) {
  state.valuesMm = { ...state.valuesMm, ...values };
}

/**
 * @returns {string}
 */
export function getAspectRatioPreset() {
  return state.aspectRatioPreset;
}

/**
 * @param {string} value
 */
export function setAspectRatioPreset(value) {
  state.aspectRatioPreset = value;
}

/**
 * @param {Results} results
 */
export function setResults(results) {
  state.results = results;
}

/**
 * @returns {Results}
 */
export function getResults() {
  return state.results;
}

/**
 * @param {Config|null} config
 */
export function setSelectedConfig(config) {
  state.selectedConfig = config;
}

/**
 * @returns {Config|null}
 */
export function getSelectedConfig() {
  return state.selectedConfig;
}
