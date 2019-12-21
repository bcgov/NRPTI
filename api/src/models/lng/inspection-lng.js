'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'Inspection-LNG',
  {
    _schemaName: { type: String, default: 'Inspection-LNG' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    _inspection: { type: 'ObjectId', ref: 'Inspection' },
    _project: { type: 'ObjectId', ref: 'Project' },

    description: { type: String, default: '' },

    // segmentId: { type: String, default: '' }, // out of scope

    dateAdded: { type: Date, default: Date.now() },
    dateUpdated: { type: Date, default: Date.now() },

    datePublished: { type: Date, default: Date.now() }
  },
  'nrpti'
);
