'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'AdministrativeSanctionNRCED',
  {
    _schemaName: { type: String, default: 'AdministrativeSanctionNRCED' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', default: null, ref: 'AdministrativeSanction' },

    summary: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null }
  },
  'nrpti'
);
