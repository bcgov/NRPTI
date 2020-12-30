const mongoMemoryServer = require('mongodb-memory-server');

class MemoryDatabaseServer {

  constructor() {
    this.mongoServer = new mongoMemoryServer.default({
      instance: {
        dbName: 'nrpti-dev',
      },
      binary: {
        version: '3.6.3',
      },
      autoStart: false,
    });
  }

  async start() {
    return this.mongoServer.start();
  }

  async stop() {
    return this.mongoServer.stop();
  }

  async getConnectionString() {
    return this.mongoServer.getConnectionString();
  }
}

module.exports = new MemoryDatabaseServer();
