'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'ManagementPlanLNG',
  {
    _schemaName: { type: String, default: 'ManagementPlanLNG', index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', ref: 'ManagementPlan' },

    relatedPhase: { type: String, default: '' },
    description: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },
    datePublished: { type: Date, default: Date.now() }
  },
  'nrpti'
);
