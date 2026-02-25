/**
 * Video Wall Calculator – Grid visualization
 * Renders a simple CSS grid of cols × rows cells inside the given container.
 */

/**
 * Render a grid visualization into the container.
 * @param {HTMLElement} container
 * @param {{ cols: number, rows: number }} config
 */
export function renderGrid(container, config) {
  if (!container || !config) return;
  const { cols, rows } = config;
  const total = cols * rows;
  if (total <= 0) return;

  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'video-wall-grid';
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

  for (let i = 0; i < total; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    grid.appendChild(cell);
  }

  container.appendChild(grid);
}
