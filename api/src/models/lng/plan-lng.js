'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'PlanLNG',
  {
    _schemaName: { type: String, default: 'PlanLNG' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', ref: 'Plan' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },
    datePublished: { type: Date, default: Date.now() }
  },
  'nrpti'
);
