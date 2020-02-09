'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'RestorativeJusticeLNG',
  {
    _schemaName: { type: String, default: 'RestorativeJusticeLNG' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', default: null, ref: 'RestorativeJustice' },

    description: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null }
  },
  'nrpti'
);
