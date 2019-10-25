'use strict';

module.exports = require('../utils/modelSchemaGenerator')('Record', {
  isDeleted: { type: Boolean, default: false },
  tags: [[{ type: String, trim: true, default: '[["sysadmin"]]' }]]
});
