// const { MongoMemoryServer } = require('mongodb-memory-server');

// class MemoryDatabaseServer {
//   constructor() {
//     this.mongoServer = null
//   }

//   async start() {

//     if (!this.mongoServer) {
//       this.mongoServer = new MongoMemoryServer({
//         instance: {
//           dbName: 'nrpti-dev'
//         },
//         binary: {
//           version: '3.6.3'
//         },
//         autoStart: false
//       });
//       await this.mongoServer.start();
//     }

//     return this.mongoServer;
    
//   }

//   async stop() {
//     if (this.mongoServer) {
//       await this.mongoServer.stop();
//       this.mongoServer = null;
//     }

//   }

//   async getConnectionString() {
//     if (this.mongoServer) {
//       return this.mongoServer.getConnectionString();
//     }

//   }
// }

// module.exports = new MemoryDatabaseServer();
