/**
 * Enum for supported Epic record types, and other important related values.
 *
 * @enum {string}
 */
const EPIC_TYPE = Object.freeze({
  order: { nrptiType: 'order', epicType: 'Order', milestone: '5cf00c03a266b7e1877504ef' },
  inspection: { nrptiType: 'inspection', epicType: 'Inspection Record', milestone: '5cf00c03a266b7e1877504ef' }
});

module.exports = EPIC_TYPE;
