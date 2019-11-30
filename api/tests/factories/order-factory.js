const factory = require('factory-girl').factory;
const Order = require('../../models/order');

factory.define('order', Order, {
  code: factory.seq('Order.code', element => `app-code-${element}`),
  isDeleted: false,
  internal: {
    read: ['public', 'sysadmin']
  },
  name: factory.seq('Order.name', element => `order-${element}`),
  read: ['public', 'sysadmin']
});

exports.factory = factory;
