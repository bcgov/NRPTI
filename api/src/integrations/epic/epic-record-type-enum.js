/**
 * Supported EPIC record types.
 */
const EPIC_RECORD_TYPE = Object.freeze({
  Order: {
    // type and milestone from legislation 2002
    type: { name: 'Order', id: '5cf00c03a266b7e1877504d1' },
    milestone: { name: 'Compliance & Enforcement', id: '5cf00c03a266b7e1877504ef' },
    getUtil: (...args) => {
      return new (require('./epic-orders'))(...args);
    }
  },
  Inspection: {
    // type and milestone from legislation 2002
    type: { name: 'Inspection Record', id: '5cf00c03a266b7e1877504d9' },
    milestone: { name: 'Compliance & Enforcement', id: '5cf00c03a266b7e1877504ef' },
    getUtil: (...args) => {
      return new (require('./epic-inspections'))(...args);
    }
  },

  /**
   * Get a subset of all supported EPIC record types.
   *
   * @param {*} recordTypes  EPIC record types to return.
   * @returns array of a subset of EPIC record types.
   */
  getSome: function(recordTypes) {
    if (!recordTypes || recordTypes.length) {
      return null;
    }

    const types = [];

    recordTypes.forEach(type => {
      const epicRecordType = this[type];

      if (epicRecordType) {
        types.push(epicRecordType);
      }
    });

    return types;
  },

  /**
   * Get all supported EPIC record types.
   *
   * @returns array of all EPIC record types.
   */
  getAll: function() {
    return [this.Order, this.Inspection];
  }
});

module.exports = EPIC_RECORD_TYPE;
