'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Plan',
  {
    _schemaName: { type: String, default: 'Plan', index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    _sourceRefId: { type: 'ObjectId', default: null, index: true },
    _epicMilestoneId: { type: 'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    recordPhase: { type: String, default: '' },
    dateIssued: { type: Date, default: Date.now() },
    issuingAgency: { type: String, default: '' },
    documentURL: { type: String, default: null },

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
