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

exports.up = async function (db) {
  return db.connection.connect(db.connectionString, { native_parser: true })
    .then(async (mClient) => {
      await mClient.createCollection('issued_to_subset');
      await mClient.createCollection('location_subset');
      await mClient.createCollection('description_summary_subset');


      var collection = mClient.collection('issued_to_subset')
      collection.createIndex(
        {
          'issuedTo.firstName': 'text',
          'issuedTo.middleName': 'text',
          'issuedTo.lastName': 'text',
          'issuedTo.fullName': 'text',
          'issuedTo.companyName': 'text'
        },
        {
          name: 'issued-to-subset-text-index'
        }
      );

      collection = mClient.collection('location_subset')
      collection.createIndex(
        {
          location: 'text'
        },
        {
          name: 'location-subset-text-index'
        }
      );

      collection = mClient.collection('description_summary_subset')
      collection.createIndex(
        {
          description: 'text',
          summary: 'text',
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
