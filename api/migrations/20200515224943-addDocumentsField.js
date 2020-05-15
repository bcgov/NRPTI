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
      var nrptiCollection = mClient.collection('nrpti');

      nrptiCollection.updateMany(
        {
          $and: [
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
            },
            { documents: { $exists: false } }
          ]
        },
        { $set: { documents: [] } }
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
