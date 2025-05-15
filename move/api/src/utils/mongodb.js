// Require this function to get a pooled raw native access to MongoDB
function MongoDriver(options) {
  this.connections = [];

  let MongoClient = require('mongodb').MongoClient;

  let DB_CONNECTION = '';
  let self = this;

  if (process.env.MONGODB_USERNAME && process.env.MONGODB_PASSWORD) {
    DB_CONNECTION =
      'mongodb://' +
      process.env.MONGODB_USERNAME +
      ':' +
      process.env.MONGODB_PASSWORD +
      '@' +
      (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost');
  } else {
    DB_CONNECTION =
      'mongodb://' + (process.env.MONGODB_SERVICE_HOST || process.env.DB_1_PORT_27017_TCP_ADDR || 'localhost');
  }

  if (process.env.NODE_ENV === 'test') {
    DB_CONNECTION = process.env.MONGO_URI
  } else {
    DB_CONNECTION += '/' + (process.env.MONGODB_DATABASE || 'nrpti-dev');
  }

  console.log('db conn:', DB_CONNECTION);

  MongoClient.connect(DB_CONNECTION, function(err, db) {
    if (err) {
      console.log('db err:', err);
    }
    if (err === null) {
      self.connections.push(db);
    }
  });
}

MongoDriver.prototype.connections;

MongoDriver.prototype.__defineGetter__('connection', function() {
  return this.connections[0];
});

module.exports = exports = new MongoDriver({});
