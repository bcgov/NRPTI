'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'AuthorizationLNG',
  {
    _schemaName: { type: String, default: 'AuthorizationLNG', index: true },
    _epicProjectId: { type: 'ObjectId', index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', ref: 'Authorization' },

    description: { type: String, default: ''},

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },
    datePublished: { type: Date, default: Date.now() }
  },
  'nrpti'
);
