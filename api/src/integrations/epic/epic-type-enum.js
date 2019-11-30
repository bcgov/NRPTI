/**
 * Enum for supported Epic record types, and their corresponding NRPTI record types.
 *
 * @enum {string}
 */
const EPIC_TYPE = Object.freeze({
  order: { nrptiType: 'order', epicType: 'Order' },
  inspection: { nrptiType: 'inspection', epicType: 'Inspection Record' }
});

module.exports = EPIC_TYPE;
