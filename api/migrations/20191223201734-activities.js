'use strict';

var dbm;
var type;
var seed;

let listItems = require(process.cwd() + '/migrations_data/home').recs;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  let mClient;
  return db.connection.connect(db.connectionString, { native_parser: true })
    .then((mClientInst) => {
      // mClientInst is an instance of MongoClient
      mClient = mClientInst;
      var p = mClient.collection('nrpti');
      p.insertMany(
        listItems
        )
        .then(function (arr) {
          console.log("arr:", arr);
          mClient.close();
        }
      );
    })
    .catch((e) => {
      console.log("e:", e);
      mClient.close()
    });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
