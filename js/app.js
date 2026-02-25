/**
 * Video Wall Calculator – App entry
 * DOM refs, event binding, state updates, calculator, renderer.
 */

import * as state from './state.js';
import { valueToMm } from './converters.js';
import { canSelectInput, hasTwoInputs, validateNumeric } from './validators.js';
import { computeConfigurations } from './calculator.js';
import { renderForm, renderResults, renderConfirmation } from './renderer.js';

/** @typedef {'aspectRatio'|'height'|'width'|'diagonal'} InputKey */

/**
 * Gather DOM references.
 * @returns {Record<string, HTMLElement|HTMLElement[]>}
 */
function getDomRefs() {
  const checkbox = (id) => document.getElementById(id);
  return {
    cabinetType16: document.querySelector('input[name="cabinetType"][value="16:9"]'),
    cabinetType11: document.querySelector('input[name="cabinetType"][value="1:1"]'),
    checkbox_aspectRatio: checkbox('input-aspectRatio'),
    checkbox_height: checkbox('input-height'),
    checkbox_width: checkbox('input-width'),
    checkbox_diagonal: checkbox('input-diagonal'),
    value_aspectRatio: document.getElementById('aspectRatio'),
    value_height: checkbox('height'),
    value_width: checkbox('width'),
    value_diagonal: checkbox('diagonal'),
    unitButtons: Array.from(document.querySelectorAll('.unit-toggle [data-unit]')),
    applyBtn: document.getElementById('applyBtn'),
    resultsSection: document.getElementById('resultsSection'),
    resultsContainer: document.getElementById('resultsContainer'),
    confirmationSection: document.getElementById('confirmationSection'),
    confirmationContent: document.getElementById('confirmationContent'),
  };
}

/**
 * Get current input key from checkbox data-input or id.
 * @param {HTMLElement} checkboxEl
 * @returns {InputKey|null}
 */
function getInputKeyFromCheckbox(checkboxEl) {
  const id = checkboxEl?.id;
  if (id === 'input-aspectRatio') return 'aspectRatio';
  if (id === 'input-height') return 'height';
  if (id === 'input-width') return 'width';
  if (id === 'input-diagonal') return 'diagonal';
  return null;
}

/**
 * Sync state from form and run calculator, then render results.
 * @param {ReturnType<typeof getDomRefs>} dom
 */
function applyCalculation(dom) {
  const activeInputs = state.getActiveInputs();
  if (!hasTwoInputs(activeInputs)) return;

  const unit = state.getUnit();
  const valuesMm = state.getValuesMm();

  // Validate dimension values for the two selected inputs
  const heightVal = dom.value_height?.value;
  const widthVal = dom.value_width?.value;
  const diagonalVal = dom.value_diagonal?.value;
  if (activeInputs.includes('height') && !validateNumeric(heightVal)) return;
  if (activeInputs.includes('width') && !validateNumeric(widthVal)) return;
  if (activeInputs.includes('diagonal') && !validateNumeric(diagonalVal)) return;

  const input = {
    cabinetType: state.getCabinetType(),
    activeInputs,
    valuesMm: { ...valuesMm },
    aspectRatioPreset: state.getAspectRatioPreset(),
  };

  // Ensure valuesMm has the dimension values in mm for active inputs
  if (activeInputs.includes('height') && heightVal !== '') {
    input.valuesMm.height = valueToMm(Number(heightVal), unit);
  }
  if (activeInputs.includes('width') && widthVal !== '') {
    input.valuesMm.width = valueToMm(Number(widthVal), unit);
  }
  if (activeInputs.includes('diagonal') && diagonalVal !== '') {
    input.valuesMm.diagonal = valueToMm(Number(diagonalVal), unit);
  }

  const results = computeConfigurations(input);
  state.setResults(results);
  renderResults(dom);
  renderConfirmation(dom);
}

function main() {
  const dom = getDomRefs();

  // Cabinet type
  if (dom.cabinetType16) {
    dom.cabinetType16.addEventListener('change', () => {
      state.setCabinetType('16:9');
      renderForm(dom);
      if (state.getResults().lower || state.getResults().upper) applyCalculation(dom);
    });
  }
  if (dom.cabinetType11) {
    dom.cabinetType11.addEventListener('change', () => {
      state.setCabinetType('1:1');
      renderForm(dom);
      if (state.getResults().lower || state.getResults().upper) applyCalculation(dom);
    });
  }

  // Checkboxes: toggle which two inputs are active
  [dom.checkbox_aspectRatio, dom.checkbox_height, dom.checkbox_width, dom.checkbox_diagonal].forEach((el) => {
    if (!el) return;
    el.addEventListener('change', () => {
      const key = getInputKeyFromCheckbox(el);
      if (key === null) return;
      const activeInputs = state.getActiveInputs();
      if (el.checked) {
        if (!canSelectInput(key, activeInputs)) return;
        if (activeInputs.includes(key)) return;
        state.setActiveInputs([...activeInputs, key]);
      } else {
        state.setActiveInputs(activeInputs.filter((k) => k !== key));
      }
      renderForm(dom);
    });
  });

  // Value inputs: persist to state (mm) on change
  const syncDimension = (key, valueEl) => {
    if (!valueEl) return;
    const unit = state.getUnit();
    const raw = valueEl.value;
    if (validateNumeric(raw)) {
      state.setValueMm(key, valueToMm(Number(raw), unit));
    }
  };
  if (dom.value_aspectRatio) {
    dom.value_aspectRatio.addEventListener('change', () => {
      state.setAspectRatioPreset(dom.value_aspectRatio.value);
      renderForm(dom);
    });
  }
  if (dom.value_height) {
    dom.value_height.addEventListener('input', () => syncDimension('height', dom.value_height));
    dom.value_height.addEventListener('change', () => syncDimension('height', dom.value_height));
  }
  if (dom.value_width) {
    dom.value_width.addEventListener('input', () => syncDimension('width', dom.value_width));
    dom.value_width.addEventListener('change', () => syncDimension('width', dom.value_width));
  }
  if (dom.value_diagonal) {
    dom.value_diagonal.addEventListener('input', () => syncDimension('diagonal', dom.value_diagonal));
    dom.value_diagonal.addEventListener('change', () => syncDimension('diagonal', dom.value_diagonal));
  }

  // Unit toggle
  dom.unitButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const u = btn.getAttribute('data-unit');
      if (!u || state.getUnit() === u) return;
      state.setUnit(/** @type {'mm'|'m'|'ft'|'in'} */ (u));
      renderForm(dom);
      renderResults(dom);
      renderConfirmation(dom);
    });
  });

  // Apply
  if (dom.applyBtn) {
    dom.applyBtn.addEventListener('click', () => applyCalculation(dom));
  }

  // Initial render
  renderForm(dom);
}

main();
