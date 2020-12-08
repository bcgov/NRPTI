'use strict';

const { MASTER_SCHEMA_NAMES } = require('../src/utils/constants/misc');

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {};

exports.up = async function(db) {
  console.log('**** Adding Public role to published master records ****');

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    const nrpti = await mClient.collection('nrpti');

    // Get all master records with at least one flavour record with public read
    const records = await nrpti
      .aggregate([
        {
          $match: {
            _schemaName: {
              $in: MASTER_SCHEMA_NAMES
            }
          }
        },
        {
          $lookup: {
            from: 'nrpti',
            localField: '_flavourRecords',
            foreignField: '_id',
            as: 'flavours'
          }
        },
        {
          $match: {
            flavours: {
              $elemMatch: {
                read: 'public'
              }
            }
          }
        },
        {
          $project: {
            _id: 1
          }
        }
      ])
      .toArray();

    await nrpti.updateMany(
      {
        _id: {
          $in: records.map(record => record._id)
        }
      },
      { $addToSet: { read: 'public' } }
    );

    console.log(`Finished updating ${records.length} master records`);
  } catch (err) {
    console.log(`Error updating master records: ${err}`);
  } finally {
    mClient.close();
  }

  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
