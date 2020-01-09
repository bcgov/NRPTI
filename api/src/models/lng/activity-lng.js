'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'ActivityLNG',
  {
    _schemaName: { type: String, default: 'ActivityLNG' },
    _epicProjectId: { type: 'ObjectId', ref: 'Project' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    type: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    date: { type: Date, default: Date.now() },
    // This is a project in EPIC, not our system, so the ref isn't real.
  },
  'nrpti'
);
