'use strict';

module.exports = require('../utils/model-schema-generator')(
  'Order',
  {
    _schemaName: { type: String, default: 'Order' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    document: {
      documentId: { type: 'ObjectId', default: null },
      documentType: { type: String, default: '' },
      documentFileName: { type: String, default: '' }
    },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() }
  },
  'nrpti'
);
