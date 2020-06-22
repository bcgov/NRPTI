'use strict';

let dbm;
let type;
let seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/**
 * Re-create the existing record-name-subset-text-index text index, for the record_name_subset collection.
 *
 * @param {*} db
 * @returns
 */
exports.up = async function(db) {
  let mongoClient;

  return db.connection
    .connect(db.connectionString, { native_parser: true })
    .then(async mClient => {
      mongoClient = mClient;

      const collection = mongoClient.collection('record_name_subset');

      await collection.createIndex(
        {
          'recordName': 'text'
        },
        {
          name: 'record-name-subset-text-index'
        }
      );

      mongoClient.close();
    })
    .catch(err => {
      console.log('Error on index creation: ', err);
      mongoClient.close();
    });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
