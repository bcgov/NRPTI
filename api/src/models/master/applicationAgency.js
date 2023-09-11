module.exports = require('../../utils/model-schema-generator')(
    'ApplicationAgencies',
    {
      _schemaName: { type: String, default: 'ApplicationAgency', index: true },
      agencyCode: { type: String, default: null },
      agencyName: { type: String, default: null },
      read: [{ type: String, trim: true, default: 'sysadmin' }],
      write: [{ type: String, trim: true, default: 'sysadmin' }],
      dateAdded: { type: Date, default: Date.now() },
      dateUpdated: { type: Date, default: null },
      addedBy: { type: String, default: '' },
      updatedBy: { type: String, default: '' },
    },
    'nrpti'
  );