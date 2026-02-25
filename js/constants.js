/**
 * Video Wall Calculator – Constants
 * Cabinet dimensions in mm; aspect ratio presets; unit conversion factors to mm.
 */

/** Cabinet physical dimensions in mm */
export const CABINETS = Object.freeze({
  '16:9': Object.freeze({ width: 600, height: 337.5 }),
  '1:1': Object.freeze({ width: 500, height: 500 }),
});

/** Aspect ratio presets (label -> approximate numeric ratio) */
export const ASPECT_RATIO_PRESETS = Object.freeze({
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
});

/** Conversion factors: 1 unit = X mm */
export const MM_PER_M = 1000;
export const MM_PER_FT = 304.8;
export const MM_PER_IN = 25.4;

/** All supported units (for iteration / validation) */
export const UNITS = Object.freeze(['mm', 'm', 'ft', 'in']);

/** Grid search bounds */
export const MIN_COLS = 1;
export const MIN_ROWS = 1;
export const MAX_COLS = 200;
export const MAX_ROWS = 200;
/** Radius around estimated cols/rows to generate candidates */
export const CANDIDATE_RADIUS = 3;
