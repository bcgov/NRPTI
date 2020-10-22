'use strict';

let dbm;
let type;
let seed;

const NRIS_INSPECTIONS_FLAVOURS = [
  'InspectionNRCED',
  'InspectionLNG',
  'InspectionBCMI'
]

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

/**
  * Migration can be run repeatedly.
  * This purpose of this migration is to find any Inspection flavour record that has emtpy
  * documents field and attempt to fix it by copying the documents field from the master record.
  */
exports.up = async function(db) {
  console.log('**** Fixing broken NRIS import flavour records with empty documents field ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    const flavourRecords = await nrpti.aggregate([
      // Find all inspection flavour records with empty documents array
      {
        $match: {
          _schemaName: {
            $in: NRIS_INSPECTIONS_FLAVOURS
          },
          documents: []
        }
      },
      // Grab the maste record
      {
        $lookup: {
          from: 'nrpti',
          localField: '_master',
          foreignField: '_id',
          as: 'master'
        }
      },
      {
        $unwind: {
          path: "$master",
          preserveNullAndEmptyArrays: true
        }
      },
      // Only need the master.documents field at this point
      {
        $project: {
          'master.documents': 1
        }
      },
      // Filter out records where the master.documents is also empty
      {
        $match: {
          'master.documents': {$ne: []}
        }
      }
    ]).toArray();

    const promises = [];

    flavourRecords.forEach(record => {
      promises.push(nrpti.updateOne(
        {_id: record._id},
        {$set: {documents: record.master.documents}}
      ));     
    });

    await Promise.all(promises);

    console.log(`**** Fixed ${flavourRecords.length} flavour records ****`)
    console.log('**** Finished updating flavour records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing flavour records: ${error.message}`);
  }

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
