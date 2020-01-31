'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Inspection',
  {
    _schemaName: { type: String, default: 'Inspection', index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    _sourceRefId: { type: 'ObjectId', default: null, index: true },
    _epicMilestoneId: { type: 'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    dateIssued: { type: Date, default: null },
    issuingAgency: { type: String, default: '' },
    author: { type: String, default: '' },
    legislation: { type: String, default: '' }, // section, sub section, reg, etc
    issuedTo: { type: String, default: '' }, // first, middle, last OR company
    projectName: { type: String, default: '' },
    location: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    outcomeStatus: { type: String, default: '' },
    outcomeDescription: { type: String, default: '' },
    attachments: [{ type: Object, default: null }],

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    updatedBy: { type: String, default: '' },
    publishedBy: { type: String, default: '' },
    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null },
    sourceSystemRef: { type: String, default: '' }
  },
  'nrpti'
);
