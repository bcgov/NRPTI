const mongoDbMemoryServer = require('./memory-db-server');

module.exports = async () => {
  await mongoDbMemoryServer.start()
  const mongoUri = await mongoDbMemoryServer.getConnectionString();
  process.env.MONGO_URI = mongoUri
};
