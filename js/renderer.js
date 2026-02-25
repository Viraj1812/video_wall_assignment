/**
 * Video Wall Calculator – Renderer
 * Syncs DOM with state: form (two-input rule, values), unit toggle, results, confirmation.
 */

import * as state from './state.js';
import { mmToValue } from './converters.js';
import { renderGrid } from './gridRenderer.js';
import { formatRatio } from './aspectRatio.js';
import { hasTwoInputs } from './validators.js';

const INPUT_KEYS = ['aspectRatio', 'height', 'width', 'diagonal'];

/**
 * @param {HTMLElement} el
 * @param {boolean} disabled
 */
function setDisabled(el, disabled) {
  if (!el) return;
  el.disabled = disabled;
}

/**
 * Render form: which inputs are active, enable/disable checkboxes and value inputs, show values.
 * @param {Record<string, HTMLElement>} dom
 */
export function renderForm(dom) {
  const activeInputs = state.getActiveInputs();
  const unit = state.getUnit();
  const valuesMm = state.getValuesMm();
  const aspectRatioPreset = state.getAspectRatioPreset();

  INPUT_KEYS.forEach((key) => {
    const isActive = activeInputs.includes(key);
    const checkbox = dom[`checkbox_${key}`];
    const valueEl = dom[`value_${key}`];

    if (checkbox) {
      checkbox.checked = isActive;
      // Disable checkbox if we already have 2 and this one isn't selected
      setDisabled(checkbox, activeInputs.length === 2 && !isActive);
    }
    if (valueEl) {
      setDisabled(valueEl, !isActive);
      if (isActive && valueEl.tagName === 'SELECT') {
        valueEl.value = aspectRatioPreset;
      }
      if (isActive && (key === 'height' || key === 'width' || key === 'diagonal')) {
        const mm = valuesMm[key];
        valueEl.value = mm != null ? String(mmToValue(mm, unit)) : '';
      }
    }
  });

  // Unit toggle
  const unitBtns = dom.unitButtons;
  if (unitBtns) {
    unitBtns.forEach((btn) => {
      const u = btn.getAttribute('data-unit');
      btn.classList.toggle('active', u === unit);
    });
  }

  // Apply button: enabled only when exactly two inputs selected
  const applyBtn = dom.applyBtn;
  if (applyBtn) {
    applyBtn.disabled = !hasTwoInputs(activeInputs);
  }
}

/**
 * Format dimension for display (with unit label).
 * @param {number} mm
 * @param {string} unit
 * @returns {string}
 */
function formatDimension(mm, unit) {
  if (mm == null || !Number.isFinite(mm)) return '—';
  const v = mmToValue(mm, unit);
  return `${v} ${unit}`;
}

/**
 * Render one result card (lower or upper). Returns the card element (or wrapper).
 * @param {{ cols: number, rows: number, totalCabinets: number, widthMm: number, heightMm: number, diagonalMm: number, aspectRatio: number } | null} config
 * @param {string} title
 * @param {string} unit
 * @param {(config: object) => void} onSelect
 * @returns {HTMLElement}
 */
function buildResultCard(config, title, unit, onSelect) {
  const wrap = document.createElement('div');
  if (!config) {
    wrap.innerHTML = `<div class="result-card"><h3>${title}</h3><p>No configuration found.</p></div>`;
    return wrap;
  }

  wrap.innerHTML = `
    <div class="result-card">
      <h3>${title}</h3>
      <dl class="result-grid">
        <dt>Columns</dt><dd>${config.cols}</dd>
        <dt>Rows</dt><dd>${config.rows}</dd>
        <dt>Total cabinets</dt><dd>${config.totalCabinets}</dd>
        <dt>Final width</dt><dd>${formatDimension(config.widthMm, unit)}</dd>
        <dt>Final height</dt><dd>${formatDimension(config.heightMm, unit)}</dd>
        <dt>Final diagonal</dt><dd>${formatDimension(config.diagonalMm, unit)}</dd>
        <dt>Final aspect ratio</dt><dd>${formatRatio(config.aspectRatio)}</dd>
      </dl>
      <div class="grid-viz-container"></div>
      <button type="button" class="btn-select">Select this configuration</button>
    </div>
  `;

  const card = wrap.firstElementChild;
  const gridContainer = card.querySelector('.grid-viz-container');
  const btn = card.querySelector('.btn-select');
  if (gridContainer) renderGrid(gridContainer, { cols: config.cols, rows: config.rows });
  if (btn) btn.addEventListener('click', () => onSelect(config));
  return wrap;
}

/**
 * Render results section (lower and upper cards).
 * @param {Record<string, HTMLElement>} dom
 */
export function renderResults(dom) {
  const results = state.getResults();
  const unit = state.getUnit();
  const resultsSection = dom.resultsSection;
  const resultsContainer = dom.resultsContainer;

  if (!resultsSection || !resultsContainer) return;

  if (results.lower === null && results.upper === null) {
    resultsSection.hidden = true;
    return;
  }

  resultsSection.hidden = false;
  resultsContainer.innerHTML = '';

  const onSelect = (config) => {
    state.setSelectedConfig(config);
    renderResults(dom);
    renderConfirmation(dom);
  };

  if (results.lower !== null) {
    const lowerWrap = buildResultCard(results.lower, 'Closest lower', unit, onSelect);
    resultsContainer.appendChild(lowerWrap.firstElementChild || lowerWrap);
  }

  if (results.upper !== null) {
    const upperWrap = buildResultCard(results.upper, 'Closest upper', unit, onSelect);
    resultsContainer.appendChild(upperWrap.firstElementChild || upperWrap);
  }
}

/**
 * Render confirmation section (chosen configuration).
 * @param {Record<string, HTMLElement>} dom
 */
export function renderConfirmation(dom) {
  const selected = state.getSelectedConfig();
  const unit = state.getUnit();
  const section = dom.confirmationSection;
  const content = dom.confirmationContent;

  if (!section || !content) return;

  if (!selected) {
    section.hidden = true;
    return;
  }

  section.hidden = false;
  const gridId = 'confirmation-grid';
  content.innerHTML = `
    <dl class="result-grid">
      <dt>Columns</dt><dd>${selected.cols}</dd>
      <dt>Rows</dt><dd>${selected.rows}</dd>
      <dt>Total cabinets</dt><dd>${selected.totalCabinets}</dd>
      <dt>Final width</dt><dd>${formatDimension(selected.widthMm, unit)}</dd>
      <dt>Final height</dt><dd>${formatDimension(selected.heightMm, unit)}</dd>
      <dt>Final diagonal</dt><dd>${formatDimension(selected.diagonalMm, unit)}</dd>
      <dt>Final aspect ratio</dt><dd>${formatRatio(selected.aspectRatio)}</dd>
    </dl>
    <div class="grid-viz-container" id="${gridId}"></div>
  `;

  const gridContainer = document.getElementById(gridId);
  if (gridContainer) renderGrid(gridContainer, { cols: selected.cols, rows: selected.rows });
}
