'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.connection.connect(db.connectionString, { native_parser: true })
    .then(async (mClient) => {
      var nrptiCollection = mClient.collection('nrpti')

      nrptiCollection.createIndex(
        {
          summary: 'text',
          location: 'text',
          'issuedTo.companyName': 'text',
          'issuedTo.firstName': 'text',
          'issuedTo.middleName': 'text',
          'issuedTo.lastName': 'text',
          'issuedTo.fullName': 'text',
          recordName: 'text'
        },
        {
          name: 'keyword-search-text-index'
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
