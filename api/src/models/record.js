module.exports = require('../utils/model-schema-generator')('Record', {
  read: [{ type: String, trim: true, default: '["sysadmin"]' }],
  write: [{ type: String, trim: true, default: '["sysadmin"]' }]
}, 'nrpti');
