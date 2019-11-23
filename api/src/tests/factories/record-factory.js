const factory = require('factory-girl').factory;
const Record = require('../../models/record');

factory.define('record', Record, {
  code: factory.seq('Record.code', element => `app-code-${element}`),
  isDeleted: false,
  internal: {
    read: ['public', 'sysadmin']
  },
  name: factory.seq('Record.name', element => `record-${element}`),
  read: ['public', 'sysadmin']
});

exports.factory = factory;
