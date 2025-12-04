const RECORD_TYPE = require('../../utils/constants/record-type-enum');

/**
 * Supported EPIC record types.
 */
const EPIC_RECORD_TYPE = Object.freeze({
  Order: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Order', typeId: '5cf00c03a266b7e1877504d1' },
      milestone: { name: 'Compliance & Enforcement', milestoneId: '5cf00c03a266b7e1877504ef' },
      getUtil: auth_payload => {
        return new (require('./orders-utils'))(auth_payload, RECORD_TYPE.Order);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Order', typeId: '5cf00c03a266b7e1877504d1' },
      milestone: { name: 'Other', milestoneId: '5d0d212c7d50161b92a80eed' },
      getUtil: auth_payload => {
        return new (require('./orders-other-utils'))(auth_payload, RECORD_TYPE.Order);
      }
    },
    {
      // type and milestone from legislation 2018
      type: { name: 'Order', typeId: '5df79dd77b5abbf7da6f51bf' },
      milestone: { name: 'Compliance & Enforcement', milestoneId: '5df79dd77b5abbf7da6f5201' },
      getUtil: auth_payload => {
        return new (require('./orders-utils'))(auth_payload, RECORD_TYPE.Order);
      }
    },
    {
      // type and milestone from legislation 2018
      type: { name: 'Order', typeId: '5df79dd77b5abbf7da6f51bf' },
      milestone: { name: 'Other', milestoneId: '5df79dd77b5abbf7da6f5202' },
      getUtil: auth_payload => {
        return new (require('./orders-other-utils'))(auth_payload, RECORD_TYPE.Order);
      }
    }
  ],
  Inspection: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Inspection Record', typeId: '5cf00c03a266b7e1877504d9' },
      milestone: { name: 'Compliance & Enforcement', milestoneId: '5cf00c03a266b7e1877504ef' },
      getUtil: auth_payload => {
        return new (require('./inspections-utils'))(auth_payload, RECORD_TYPE.Inspection);
      }
    },
    {
      // type and milestone from legislation 2018
      type: { name: 'Inspection Record', typeId: '5df79dd77b5abbf7da6f51ca' },
      milestone: { name: 'Compliance & Enforcement', milestoneId: '5df79dd77b5abbf7da6f5201' },
      getUtil: auth_payload => {
        return new (require('./inspections-utils'))(auth_payload, RECORD_TYPE.Inspection);
      }
    }
  ],
  Certificate: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Certificate Package', typeId: '5cf00c03a266b7e1877504d5' },
      milestone: { name: 'Certificate', milestoneId: '5cf00c03a266b7e1877504eb' },
      getUtil: auth_payload => {
        return new (require('./certificates-utils'))(auth_payload, RECORD_TYPE.Certificate);
      }
    }
  ],
  CertificateAmendment: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Amendment Package', typeId: '5cf00c03a266b7e1877504d7' },
      milestone: { name: 'Amendment', milestoneId: '5cf00c03a266b7e1877504f2' },
      getUtil: auth_payload => {
        return new (require('./certificates-amendment-utils'))(auth_payload, RECORD_TYPE.CertificateAmendment);
      }
    },
    {
      // type and milestone from legislation 2018
      type: { name: 'Amendment Package', typeId: '5df79dd77b5abbf7da6f51cf' },
      milestone: { name: 'Amendment', milestoneId: '5df79dd77b5abbf7da6f5200' },
      getUtil: auth_payload => {
        return new (require('./certificates-amendment-utils'))(auth_payload, RECORD_TYPE.CertificateAmendment);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Request', typeId: '5cf00c03a266b7e1877504ca' },
      milestone: { name: 'Amendment', milestoneId: '5cf00c03a266b7e1877504f2' },
      getUtil: auth_payload => {
        return new (require('./certificates-amendment-utils'))(auth_payload, RECORD_TYPE.CertificateAmendment);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Decision Materials', typeId: '5cf00c03a266b7e1877504d0' },
      milestone: { name: 'Amendment', milestoneId: '5cf00c03a266b7e1877504f2' },
      getUtil: auth_payload => {
        return new (require('./certificates-amendment-utils'))(auth_payload, RECORD_TYPE.CertificateAmendment);
      }
    },
    {
      // type and milestone from legislation 2018
      type: { name: 'Decision Materials', typeId: '5df79dd77b5abbf7da6f51cd' },
      milestone: { name: 'Amendment', milestoneId: '5df79dd77b5abbf7da6f5200' },
      getUtil: auth_payload => {
        return new (require('./certificates-amendment-utils'))(auth_payload, RECORD_TYPE.CertificateAmendment);
      }
    },
    {
      // type and milestone from legislation 2002
      type: { name: 'Tracking Table', typeId: '5d0d212c7d50161b92a80ee4' },
      milestone: { name: 'Amendment', milestoneId: '5cf00c03a266b7e1877504f2' },
      getUtil: auth_payload => {
        return new (require('./certificates-amendment-utils'))(auth_payload, RECORD_TYPE.CertificateAmendment);
      }
    },
    {
      // type and milestone from legislation 2018
      type: { name: 'Tracking Table', typeId: '5df79dd77b5abbf7da6f51c4' },
      milestone: { name: 'Amendment', milestoneId: '5df79dd77b5abbf7da6f5200' },
      getUtil: auth_payload => {
        return new (require('./certificates-amendment-utils'))(auth_payload, RECORD_TYPE.CertificateAmendment);
      }
    }
  ],
  ManagementPlan: [
    {
      // type and milestone from legislation 2002
      type: { name: 'Plan', typeId: '5cf00c03a266b7e1877504ce' },
      milestone: { name: 'Post-Decision Materials', milestoneId: '5cf00c03a266b7e1877504f1' },
      projects: [
        { name: 'Coastal Gaslink', projectId: '588511c4aaecd9001b825604' },
        { name: 'LNG', projectId: '588511d0aaecd9001b826192' }
      ],
      getUtil: auth_payload => {
        return new (require('./management-plans-utils'))(auth_payload, RECORD_TYPE.ManagementPlan);
      }
    },
    {
      // type and milestone from legislation 2018 ('Management Plan' doesn't exist in Legislation 2002)
      type: { name: 'Management Plan', typeId: '5df79dd77b5abbf7da6f51c2' },
      milestone: { name: 'Post-Decision Materials', milestoneId: '5df79dd77b5abbf7da6f51fa' },
      projects: [
        { name: 'Coastal Gaslink', projectId: '588511c4aaecd9001b825604' },
        { name: 'LNG', projectId: '588511d0aaecd9001b826192' }
      ],
      getUtil: auth_payload => {
        return new (require('./management-plans-utils'))(auth_payload, RECORD_TYPE.ManagementPlan);
      }
    },
    {
      // type and milestone from legislation 2018
      type: { name: 'Plan', typeId: '5df79dd77b5abbf7da6f51c3' },
      milestone: { name: 'Post-Decision Materials', milestoneId: '5df79dd77b5abbf7da6f51fa' },
      projects: [
        { name: 'Coastal Gaslink', projectId: '588511c4aaecd9001b825604' },
        { name: 'LNG', projectId: '588511d0aaecd9001b826192' }
      ],
      getUtil: auth_payload => {
        return new (require('./management-plans-utils'))(auth_payload, RECORD_TYPE.ManagementPlan);
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
    if (!recordTypes || recordTypes.length === 0) {
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
    return [
      ...this.Order,
      ...this.Inspection,
      ...this.Certificate,
      ...this.ManagementPlan,
      ...this.CertificateAmendment
    ];
  }
});

module.exports = EPIC_RECORD_TYPE;
