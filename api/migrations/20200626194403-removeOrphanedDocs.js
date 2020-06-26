'use strict';

let dbm;
let type;
let seed;

let ObjectID = require('mongodb').ObjectID;

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
  try {
    let mClient = await db.connection.connect(db.connectionString, { native_parser: true });
    let nrptiCollection = mClient.collection('nrpti');
    console.log('Getting all records');
    const records = await nrptiCollection.find(
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
    let recordDocIds = [];
    for (let i = 0; i < records.length; i++) {
      if (records[i].documents && records[i].documents.length > 0) {
        for (let j = 0; j < records[i].documents.length; j++) {
          recordDocIds.push(ObjectID(records[i].documents[j]).toString());
        }
      }
    }

    console.log('Getting all documents');
    const documents = await nrptiCollection.find(
      {
        _schemaName: 'Document'
      }
    ).toArray();

    console.log('Finding orphaned documents');
    let orphanedDocIds = [];
    for (let k = 0; k < documents.length; k++) {
      if (!recordDocIds.includes(ObjectID(documents[k]._id).toString())) {
        orphanedDocIds.push(ObjectID(documents[k]._id));
      }
    }

    console.log('Deleted', orphanedDocIds.length, 'orphaned document(s)');
    await nrptiCollection.deleteMany(
      {
        _id: {
          $in: orphanedDocIds
        }
      }
    );

    mClient.close();
  } catch (err) {
    console.log("Error deleting orphans: ", err);
  };
}


exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
