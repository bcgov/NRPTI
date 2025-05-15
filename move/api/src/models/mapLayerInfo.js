module.exports = require('../utils/model-schema-generator')(
  'MapLayerInfo',
  {
    _schemaName: { type: String, default: 'MapLayerInfo', index: true },

    segment: {
      type: String,
      required: true,
      enum: ['Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5', 'Section 6', 'Section 7', 'Section 8']
    },

    location: { type: String, default: null },
    length: { type: String, default: null },
    description: { type: String, default: null },

    dateAdded: { type: Date, default: Date.now() },

    updatedBy: { type: String, default: null },
    dateUpdated: { type: Date, default: null },

    // Permissions
    write: [{ type: String, trim: true, default: 'sysadmin' }],
    read: [{ type: String, trim: true, default: 'sysadmin' }]
  },
  'nrpti'
);
