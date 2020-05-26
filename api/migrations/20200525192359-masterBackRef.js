'use strict';

var dbm;
var type;
var seed;

var ObjectID = require('mongodb').ObjectID;

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
      var nrptiCollection = mClient.collection('nrpti');

      const masterRecords = await nrptiCollection.find(
        {
          _schemaName: {
            $in: [
              'AdministrativePenalty',
              'AdministrativeSanction',
              'Agreement',
              'Certificate',
              'ConstructionPlan',
              'CourtConviction',
              'Inspection',
              'ManagementPlan',
              'Order',
              'Permit',
              'RestorativeJustice',
              'SelfReport',
              'Ticket',
              'Warning'
            ]
          }
        }
      ).toArray();
      for (let i = 0; i < masterRecords.length; i++) {
        const masterRecord = masterRecords[i];
        for (let j = 0; j < masterRecord._flavourRecords.length; j++) {
          const flavourRecordId = masterRecord._flavourRecords[j];
          await nrptiCollection.update(
            {
              _id: new ObjectID(flavourRecordId)
            },
            {
              $set: {
                _master: new ObjectID(masterRecord._id)
              }
            }
          );
        }
      }
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
