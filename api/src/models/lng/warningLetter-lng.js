'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'WarningLetterLNG',
  {
    _schemaName: { type: String, default: 'WarningLetterLNG' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', ref: 'WarningLetter' },

    description: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },
    datePublished: { type: Date, default: Date.now() }
  },
  'nrpti'
);
