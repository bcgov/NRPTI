'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  const nrpti = mClient.collection('nrpti');
  const redactedRecordSubset = mClient.collection('redacted_record_subset');

  try {
    console.log('Deleting all Inspections in nrpti collection with Fish and Seafood Act legislation');
    await nrpti.deleteMany({
      $or: [
        {"_schemaName":"Inspection", "legislation": {
          $elemMatch: {
            "act": "Fish and Seafood Act"
          }
        }},
        {"_schemaName":"InspectionNRCED", "legislation": {
          $elemMatch: {
            "act": "Fish and Seafood Act"
          }
        }},
        {"_schemaName":"InspectionBCMI", "legislation": {
          $elemMatch: {
            "act": "Fish and Seafood Act"
          }
        }}
      ]
    });

    console.log('Deleting all Inspections in redacted_record_subset collection with Fish and Seafood Act legislation');
    await redactedRecordSubset.deleteMany({
      $or: [
        {"_schemaName":"Inspection", "legislation": {
          $elemMatch: {
            "act": "Fish and Seafood Act"
          }
        }},
        {"_schemaName":"InspectionNRCED", "legislation": {
          $elemMatch: {
            "act": "Fish and Seafood Act"
          }
        }},
        {"_schemaName":"InspectionBCMI", "legislation": {
          $elemMatch: {
            "act": "Fish and Seafood Act"
          }
        }}
      ]
    });
  } catch (err) {
    console.log(`Error finding records: ${err}`);
  } finally {
    console.log('Closing connection');
    mClient.close();
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
