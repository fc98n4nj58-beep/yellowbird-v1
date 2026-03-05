// engine/units/modes/index.js
'use strict';

const ontarioMathG1AttributesNumbers10Day = require('./ontario_math_g1_attributes_numbers_10day');
const genericUnit = require('./generic_unit');

const registry = new Map();

/**
 * Register modes here.
 * Key format recommendation:
 *   <jurisdiction>_<subject>_<grade>_<unitKey>
 */
registry.set(ontarioMathG1AttributesNumbers10Day.key, ontarioMathG1AttributesNumbers10Day);
registry.set(genericUnit.key, genericUnit);

function getMode(key) {
  return registry.get(key) || null;
}

function listModes() {
  return Array.from(registry.values()).map(m => ({
    key: m.key,
    label: m.label,
    supports: m.supports,
  }));
}

module.exports = {
  getMode,
  listModes,
};