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
  console.log('**** Unpublishing NRCED records that are not order and milestone compliance and enforcement ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
    await nrpti.updateMany(
      {
        $or: [
          {
            sourceSystemRef: 'epic',
            _schemaName: 'OrderNRCED',
            _epicMilestoneId: ObjectId('5d0d212c7d50161b92a80eed')
          },
          {
            sourceSystemRef: 'epic',
            _schemaName: 'OrderNRCED',
            _epicMilestoneId: ObjectId('5df79dd77b5abbf7da6f5202')
          }
        ]
      },
      { $pull: { read: 'public' } }
    );
    console.log('**** Finished unpublishing NRCED records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing records: ${error.message}`);
  }

  mClient.close();
}

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
