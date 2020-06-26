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
      var recordDocIds = [];
      for (let i = 0; i < records.length; i++) {
        if (records[i].documents && records[i].documents.length > 0) {
          records[i].documents.forEach(id => {
            recordDocIds.push(ObjectID(id).toString());
          });
        }
      }

      console.log('Getting all documents');
      const documents = await nrptiCollection.find(
        {
          _schemaName: 'Document'
        }
      ).toArray();

      console.log('Finding orphaned documents');
      var orphanedDocIds = [];
      for (let j = 0; j < documents.length; j++) {
        if (!recordDocIds.includes(ObjectID(documents[j]._id).toString())) {
          orphanedDocIds.push(ObjectID(documents[j]._id));
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
    })
    .catch((err) => {
      console.log("Error on updating flavour publish statuses on masters: ", err);
      mClient.close();
    });
};


exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
