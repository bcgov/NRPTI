module.exports = require('../utils/model-schema-generator')('Record', {
  _schemaName: { type: String, default: '' },
  documentEPICId: { type: 'ObjectId', default: null },
  documentType: { type: String, default: '' },
  documentFileName: { type: String, default: '' },

  read: [{ type: String, trim: true, default: 'sysadmin' }],
  write: [{ type: String, trim: true, default: 'sysadmin' }]
}, 'nrpti');
