'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Authorization',
  {
    _schemaName: { type: String, default: 'Authorization', index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    recordSubType: { type: String, default: '' },
    dateIssued: { type: Date, default: Date.now() },
    issuingAgency: { type: String, default: '' },
    attachments: [{ type: Object, default: null }],

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },
    updatedBy: { type: String, default: '' },
    publishedBy: { type: String, default: '' },
    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null },
    sourceSystemRef: { type: String, default: '' }
  },
  'nrpti'
);
