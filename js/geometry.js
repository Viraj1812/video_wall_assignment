/**
 * Video Wall Calculator – Geometry
 * Derive missing dimensions from two known values (width, height, diagonal, aspect ratio).
 * All dimensions in mm; aspect ratio as number (width/height).
 */

/**
 * Given two of { width, height, diagonal, aspectRatio }, derive all four.
 * Pass known values in mm (and aspectRatio as number). Unknowns can be undefined.
 *
 * Formulas:
 * - diagonal^2 = width^2 + height^2  (Pythagoras)
 * - aspectRatio = width / height
 *
 * @param {{ widthMm?: number, heightMm?: number, diagonalMm?: number, aspectRatio?: number }} known
 * @returns {{ widthMm: number, heightMm: number, diagonalMm: number, aspectRatio: number }}
 */
export function deriveDimensions(known) {
  const { widthMm: w, heightMm: h, diagonalMm: d, aspectRatio: r } = known;

  // Width + height known -> diagonal and ratio
  if (w != null && h != null && w > 0 && h > 0) {
    const diagonalMm = Math.sqrt(w * w + h * h);
    const aspectRatio = w / h;
    return { widthMm: w, heightMm: h, diagonalMm, aspectRatio };
  }

  // Width + diagonal known -> height = sqrt(d^2 - w^2)
  if (w != null && d != null && d > 0 && w < d) {
    const heightMm = Math.sqrt(d * d - w * w);
    const aspectRatio = w / heightMm;
    return { widthMm: w, heightMm, diagonalMm: d, aspectRatio };
  }

  // Height + diagonal known -> width = sqrt(d^2 - h^2)
  if (h != null && d != null && d > 0 && h < d) {
    const widthMm = Math.sqrt(d * d - h * h);
    const aspectRatio = widthMm / h;
    return { widthMm, heightMm: h, diagonalMm: d, aspectRatio };
  }

  // Aspect ratio + width known -> height = width/ratio, diagonal = sqrt(w^2 + h^2)
  if (r != null && r > 0 && w != null && w > 0) {
    const heightMm = w / r;
    const diagonalMm = Math.sqrt(w * w + heightMm * heightMm);
    return { widthMm: w, heightMm, diagonalMm, aspectRatio: r };
  }

  // Aspect ratio + height known -> width = height*ratio, diagonal = sqrt(w^2 + h^2)
  if (r != null && r > 0 && h != null && h > 0) {
    const widthMm = h * r;
    const diagonalMm = Math.sqrt(widthMm * widthMm + h * h);
    return { widthMm, heightMm: h, diagonalMm, aspectRatio: r };
  }

  // Aspect ratio + diagonal known -> h = d/sqrt(r^2+1), w = r*h (from d^2 = w^2+h^2 and w=r*h)
  if (r != null && r > 0 && d != null && d > 0) {
    const heightMm = d / Math.sqrt(r * r + 1);
    const widthMm = r * heightMm;
    return { widthMm, heightMm, diagonalMm: d, aspectRatio: r };
  }

  throw new Error('geometry.deriveDimensions: need exactly two of widthMm, heightMm, diagonalMm, aspectRatio (all positive)');
}
