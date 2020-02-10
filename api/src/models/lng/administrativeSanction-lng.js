'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'AdministrativeSanctionLNG',
  {
    _schemaName: { type: String, default: 'AdministrativeSanctionLNG' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', default: null, ref: 'AdministrativeSanction' },

    description: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null }
  },
  'nrpti'
);
