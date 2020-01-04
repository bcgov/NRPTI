'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Order',
  {
    _schemaName: { type: String, default: 'Order', index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    _sourceRefId: { type: 'ObjectId', default: null, index: true },
    _epicMilestoneId: { type: 'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    recordName: { type: String, default: '' },
    recordType: { type: String, default: '' },
    recordSubtype: { type: String, default: '' }, //epic value?
    dateIssued: { type: Date, default: Date.now() },
    issuingAgency: { type: String, default: '' },
    author: { type: String, default: '' },
    legislation: { type: String, default: '' },
    issuedTo: { type: String, default: '' }, // epic value?
    projectName: { type: String, default: '' },
    location: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    outcomeStatus: { type: String, default: '' }, // epic value?
    outcomeDescription: { type: String, default: '' }, // out of scope?

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },
    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null },
    sourceSystemRef: { type: String, default: '' }
  },
  'nrpti'
);
