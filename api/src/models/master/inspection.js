'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Inspection',
  {
    _schemaName: { type: String, default: 'Inspection' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    recordName: { type: String, default: '' },
    issuingAgency: { type: String, default: '' },
    author: { type: String, default: '' },
    type: { type: String, default: '' },
    quarter: { type: Date, default: null },
    entityType: { type: String, default: '' },
    issuedTo: { type: String, default: '' }, // first, middle, last OR company
    birthDate: { type: Date, default: null }, // for individual
    description: { type: String, default: '' },
    centroid: [{ type: Number, default: 0.0 }],
    location: { type: String, default: '' },
    nationName: { type: String, default: '' },
    documentAttachments: { type: String, default: '' },
    sourceSystemRef: { type: String, default: '' },
    legislation: { type: String, default: '' }, // section, sub section, reg, etc
    status: { type: String, default: '' }, // open or closed
    // relatedRecords: { type: String, default: '' }, // out of scope?
    // outcomeDescription: { type: String, default: '' }, // out of scope?
    project: { type: String, default: '' },
    projectSector: { type: String, default: '' },
    projectType: { type: String, default: '' },
    penalty: { type: String, default: '' }, // dollars or text
    courtConvictionOutcome: { type: String, default: '' },

    tabSelection: { type: String, default: '' }, // TODO what is this?

    documentId: { type: 'ObjectId', default: null }, // source _id
    documentType: { type: String, default: '' },
    documentFileName: { type: String, default: '' },
    documentDate: { type: Date, default: null },

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },

    sourceDateAdded: { type: Date, default: null },
    sourceDateUpdated: { type: Date, default: null }
  },
  'nrpti'
);
