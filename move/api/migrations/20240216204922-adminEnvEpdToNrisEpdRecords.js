'use strict';

var dbm;
var type;
var seed;

var ObjectId = require('mongodb').ObjectID

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
  // Add admin:env-epd role to the read and write arrays of records where it's sourceSystemRef is "nris-epd"
  // Don't add the role to records of type InspectionBCMI or InspectionLNG
  console.log('**** Adding env_epd role ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  const nrpti = await mClient.collection('nrpti');

  const sourceSystemRefNrisEpd = [
    'nris-epd'
  ];

  try {
    await nrpti.updateMany(
      {
        $and: [
          {
            sourceSystemRef: {
              $in: sourceSystemRefNrisEpd
            }
          },
          {
            _schemaName: {
              $nin: ['InspectionBCMI', 'InspectionLNG']
            }
          }
        ]
      },
      { $addToSet: { read: 'admin:env-epd', write: 'admin:env-epd'} }
    );
  } catch (error) {
    console.log('Error updating records read array with env-epd role');
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version":  1
};
