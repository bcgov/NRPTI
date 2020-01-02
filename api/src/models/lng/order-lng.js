'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'OrderLNG',
  {
    _schemaName: { type: String, default: 'OrderLNG' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _order: { type: 'ObjectId', ref: 'Order' },

    description: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },
    datePublished: { type: Date, default: Date.now() }
  },
  'nrpti'
);
