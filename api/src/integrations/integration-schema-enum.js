/**
 * Enum for supported integration schemas.
 *
 * @enum {string}
 */
const INTEGRATION_SCHEMA = Object.freeze({
  order: { nrptiSchema: 'Order', flavourSchemas: ['OrderNRCED', 'OrderLNG'] },
  inspection: { nrptiSchema: 'Inspection', flavourSchemas: ['InspectionNRCED', 'InspectionLNG'] }
});

module.exports = INTEGRATION_SCHEMA;
