const mongoDbMemoryServer = require('./memory-db-server');

module.exports = async function() {
  await mongoDbMemoryServer.stop()
};
