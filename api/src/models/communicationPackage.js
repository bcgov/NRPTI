module.exports = require('../utils/model-schema-generator')(
  'CommunicationPackage',
  {
    _schemaName: { type: String, default: 'CommunicationPackage', index: true },
    // specific business area / application this comm package relates to
    // should only be BCMI, LNG, NRCED for now
    application: { type: String, default: 'BCMI', required: true },
    // data
    title: { type: String, default: null, required: true },
    description: { type: String, default: null, required: true },
    startDate: { type: Date, default: Date.now(), required: true },
    endDate: { type: Date, default: null, required: true },
    // Additional Info is a freeform json object that can be populated to send
    // special instructions to the front ends
    additionalInfo: { type: Object, default: null },
    // meta
    addedBy: { type: String, default: null },
    dateAdded: { type: Date, default: Date.now() },
    // Permissions
    write: [{ type: String, trim: true, default: 'sysadmin' }],
    read: [{ type: String, trim: true, default: 'public' }]
  },
  'nrpti'
);
