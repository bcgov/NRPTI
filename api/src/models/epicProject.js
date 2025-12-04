'use strict';

module.exports = require('../utils/model-schema-generator')(
  'EPICProject',
  {
    _schemaName: { type: String, default: 'EPICProject', index: true },
    _epicProjectId: { type: 'ObjectId', default: null, index: true },
    name: { type: String, trim: true, default: 'sysadmin' },

    read: [{ type: String, trim: true, default: 'sysadmin' }],
    write: [{ type: String, trim: true, default: 'sysadmin' }]
  },
  'nrpti'
);
