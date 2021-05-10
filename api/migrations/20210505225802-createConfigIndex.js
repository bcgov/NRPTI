'use strict';

let dbm;
let type;
let seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  return db.connection.connect(db.connectionString, { native_parser: true })
    .then(async (mClient) => {
      const collection = mClient.collection('nrpti')
      await collection.createIndex(
        {
          'configApplication': 1,
          'configType': 1,
        },
        {
          'unique': true,
          'sparse': true
        }
      );
      mClient.close();
    })
    .catch((err) => {
      console.log("Error on index creation: ", err);
      mClient.close();
    });
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
