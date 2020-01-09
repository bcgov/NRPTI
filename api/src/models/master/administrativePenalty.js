'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'AdministrativePenalty',
  {
    _schemaName: { type: String, default: 'AdministrativePenalty', index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    _sourceRefId: { type: 'ObjectId', default: null, index: true },
    _epicMilestoneId: { type: 'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    // No model defined TBD

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
