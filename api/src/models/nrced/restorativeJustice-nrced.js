'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'RestorativeJusticeNRCED',
  {
    _schemaName: { type: String, default: 'RestorativeJusticeNRCED' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _master: { type: 'ObjectId', default: null, ref: 'RestorativeJustice' },

    summary: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null }
  },
  'nrpti'
);
