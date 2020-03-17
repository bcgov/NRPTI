'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'SelfReportLNG',
  {
    _schemaName: { type: String, default: 'SelfReportLNG' },
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
    legislation: {
      act: { type: String, default: '' },
      regulation: { type: String, default: '' },
      section: { type: String, default: '' },
      subSection: { type: String, default: '' },
      paragraph: { type: String, default: '' }
    },
    projectName: { type: String, default: '' },
    location: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    documents: [{ type: 'ObjectId', default: [], index: true }],

    relatedPhase: { type: String, default: '' },
    description: { type: String, default: '' },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: null },
    datePublished: { type: Date, default: null },

    addedBy: { type: String, default: '' },
    updatedBy: { type: String, default: '' },
    publishedBy: { type: String, default: '' },

    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null },
    sourceSystemRef: { type: String, default: 'nrpti' }
  },
  'nrpti'
);
