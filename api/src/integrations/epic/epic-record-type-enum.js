/**
 * Supported EPIC record types.
 */
const EPIC_RECORD_TYPE = Object.freeze({
  Order: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Order', typeId: '5cf00c03a266b7e1877504d1' },
      milestone: { name: 'Compliance & Enforcement', milestoneId: '5cf00c03a266b7e1877504ef' },
      getUtil: (...args) => {
        return new (require('./epic-orders'))(...args);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Order', typeId: '5cf00c03a266b7e1877504d1' },
      milestone: { name: 'Other', milestoneId: '5d0d212c7d50161b92a80eed' },
      getUtil: (...args) => {
        return new (require('./epic-orders-other'))(...args);
      }
    }
  ],
  Inspection: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Inspection Record', typeId: '5cf00c03a266b7e1877504d9' },
      milestone: { name: 'Compliance & Enforcement', milestoneId: '5cf00c03a266b7e1877504ef' },
      getUtil: (...args) => {
        return new (require('./epic-inspections'))(...args);
      }
    }
  ],
  Certificate: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Certificate Package', typeId: '5cf00c03a266b7e1877504d5' },
      milestone: { name: 'Certificate', milestoneId: '5cf00c03a266b7e1877504eb' },
      getUtil: (...args) => {
        return new (require('./epic-certificates'))(...args);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Amendment Package', typeId: '5cf00c03a266b7e1877504d7' },
      milestone: { name: 'Amendment', milestoneId: '5cf00c03a266b7e1877504f2' },
      getUtil: (...args) => {
        return new (require('./epic-certificates-amendment'))(...args);
      }
    }
  ],
  ManagementPlan: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Plan', typeId: '5cf00c03a266b7e1877504ce' },
      milestone: { name: 'Post-Decision Materials', milestoneId: '5cf00c03a266b7e1877504f1' },
      getUtil: (...args) => {
        return new (require('./epic-management-plans'))(...args);
      }
    },

    {
      // type and milestone from legislation 2018 ('Management Plan' doesn't exist in Legislation 2002)
      type: { name: 'Management Plan', typeId: '5df79dd77b5abbf7da6f51c2' },
      milestone: { name: 'Post-Decision Materials', milestoneId: '5df79dd77b5abbf7da6f51fa' },
      getUtil: (...args) => {
        return new (require('./epic-management-plans'))(...args);
      }
    }
  ],

  /**
   * Get a subset of all supported EPIC record types.
   *
   * @param {*} recordTypes  EPIC record types to return.
   * @returns flattened array of a subset of EPIC record types.
   */
  getSome: function(recordTypes) {
    if (!recordTypes || recordTypes.length) {
      return [];
    }

    const types = [];

    recordTypes.forEach(type => {
      const epicRecordType = this[type];

      if (epicRecordType) {
        types.push(...epicRecordType);
      }
    });

    return types;
  },

  /**
   * Get all supported EPIC record types.
   *
   * @returns flattened array of all EPIC record types.
   */
  getAll: function() {
    return [...this.Order, ...this.Inspection, ...this.Certificate, ...this.ManagementPlan];
  }
});

module.exports = EPIC_RECORD_TYPE;
