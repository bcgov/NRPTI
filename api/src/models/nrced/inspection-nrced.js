'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Inspection-NRCED',
  {
    _schemaName: { type: String, default: 'Inspection-NRCED' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    // legacyIds: [{ type: String, default: null }], // TODO what is this?

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },

    datePublished: { type: Date, default: Date.now() }
  },
  'nrpti'
);
