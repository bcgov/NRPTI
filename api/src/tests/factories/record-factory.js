const factory = require('factory-girl').factory;
const Record = require('../../models/record');

factory.define('record', Record, {
  code: factory.seq('Record.code', element => `app-code-${element}`),
  isDeleted: false,
  internal: {
    tags: [['public'], ['sysadmin']]
  },
  name: factory.seq('Record.name', element => `record-${element}`),
  tags: [['public'], ['sysadmin']]
});

exports.factory = factory;
