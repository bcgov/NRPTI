/**
 * Supported EPIC record types.
 */
const EPIC_RECORD_TYPE = Object.freeze({
  recordTypes: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Order', id: '5cf00c03a266b7e1877504d1' },
      milestone: { name: 'Compliance & Enforcement', id: '5cf00c03a266b7e1877504ef' },
      getUtil: (...args) => {
        return new (require('./epic-orders'))(...args);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Inspection Record', id: '5cf00c03a266b7e1877504d9' },
      milestone: { name: 'Compliance & Enforcement', id: '5cf00c03a266b7e1877504ef' },
      getUtil: (...args) => {
        return new (require('./epic-inspections'))(...args);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Certificate Package', id: '5cf00c03a266b7e1877504d5' },
      milestone: { name: 'Certificate', id: '5cf00c03a266b7e1877504eb' },
      getUtil: (...args) => {
        return new (require('./epic-certificates'))(...args);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Amendment Package', id: '5cf00c03a266b7e1877504d7' },
      milestone: { name: 'Amendment', id: '5cf00c03a266b7e1877504f2' },
      getUtil: (...args) => {
        return new (require('./epic-certificates-amendment'))(...args);
      }
    }
  ]
});

module.exports = EPIC_RECORD_TYPE;
