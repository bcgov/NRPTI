'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/**
 * Re-create the existing description-summary-subset-text-index text index, for the description_summary_subset
 * collection.
 *
 * @param {*} db
 * @returns
 */
exports.up = async function (db) {
  return db.connection.connect(db.connectionString, { native_parser: true })
    .then(async (mClient) => {
      const collection = mClient.collection('description_summary_subset')

      collection.dropIndex('description-summary-subset-text-index');

      collection.createIndex(
        {
          'flavours.description': 'text',
          'flavours.summary': 'text',
        },
        {
          name: 'description-summary-subset-text-index'
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
