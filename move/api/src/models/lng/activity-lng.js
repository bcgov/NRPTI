'use strict';

module.exports = require('../../utils/model-schema-generator')(
  'ActivityLNG',
  {
    _schemaName: { type: String, default: 'ActivityLNG', index: true },
    // This is a project in EPIC, not our system, so the ref isn't real.
    _epicProjectId: { type: 'ObjectId', ref: 'Project', index: true },
    _master: { type: 'ObjectId', default: null, index: true },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }],

    type: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    url: { type: String, default: '' },
    date: { type: Date, default: Date.now() },
    // TODO: Migration for legacy records
    projectName: { type: String, default: '' }
  },
  'nrpti'
);
