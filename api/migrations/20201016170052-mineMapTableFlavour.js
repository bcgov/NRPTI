'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
let dbm;

const mineMaps = [
  {
    permitNumber: 'M-112',
    epicProjectIDs: [
      new ObjectId('58851197aaecd9001b8227cc')
    ]
  },
  {
    permitNumber: 'M-243',
    epicProjectIDs: [
      new ObjectId('588511caaaecd9001b825bcb')
    ]
  },
  {
    permitNumber: 'C-221',
    epicProjectIDs: [
      new ObjectId('588510deaaecd9001b816eec')
    ]
  },
  {
    permitNumber: 'C-2',
    epicProjectIDs: [
      new ObjectId('588511e8aaecd9001b827a9b')
    ]
  },
  {
    permitNumber: 'M-197',
    epicProjectIDs: [
      new ObjectId('58851024aaecd9001b80bbd3')
    ]
  },
  {
    permitNumber: 'C-3',
    epicProjectIDs: [
      new ObjectId('588511a6aaecd9001b823734')
    ]
  },
  {
    permitNumber: 'M-11',
    epicProjectIDs: [
      new ObjectId('5cd9b4b56a15600025df0cc8')
    ]
  },
  {
    permitNumber: 'M-203',
    epicProjectIDs: [
      new ObjectId('5885106baaecd9001b80ff3a')
    ]
  },
  {
    permitNumber: 'M-206',
    epicProjectIDs: [
      new ObjectId('5885100caaecd9001b80a4b7'),
      new ObjectId('588511e6aaecd9001b8278ae')
    ]
  },
  {
    permitNumber: 'M-10',
    epicProjectIDs: [
      new ObjectId('5885118daaecd9001b821e2b')
    ]
  },
  {
    permitNumber: 'C-129',
    epicProjectIDs: [
      new ObjectId('58851185aaecd9001b821677'),
      new ObjectId('58851079aaecd9001b810cb5')
    ]
  },
  {
    permitNumber: 'M-236',
    epicProjectIDs: [
      new ObjectId('58851117aaecd9001b81a8b2'),
      new ObjectId('58851038aaecd9001b80cf15')
    ]
  },
  {
    permitNumber: 'M-200',
    epicProjectIDs: [
      new ObjectId('58851049aaecd9001b80de7d')
    ]
  },
  {
    permitNumber: 'C-244',
    epicProjectIDs: [
      new ObjectId('5885119caaecd9001b822d93')
    ]
  },
  {
    permitNumber: 'G-225',
    epicProjectIDs: [
      new ObjectId('588510b6aaecd9001b814868')
    ]
  },
  {
    permitNumber: 'M-240',
    epicProjectIDs: [
      new ObjectId('588510c4aaecd9001b8155e3')
    ]
  },
  {
    permitNumber: 'C-224',
    epicProjectIDs: [
      new ObjectId('58851142aaecd9001b81d310')
    ]
  },
  {
    permitNumber: 'M-232',
    epicProjectIDs: [
      new ObjectId('58851056aaecd9001b80ebf8')
    ]
  },
  {
    permitNumber: 'C-153',
    epicProjectIDs: [
      new ObjectId('58851002aaecd9001b809b16')
    ]
  },
  {
    permitNumber: 'C-223',
    epicProjectIDs: [
      new ObjectId('58851085aaecd9001b811843')
    ]
  }
]

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
};

/**
  * This migration can be run multiple times without causing problems.  It will simply force the epicProjectIDs on the
  * Mine model to be up-to-date, as well as the mineGUID to be up-to-date pointing to the correct mineGUID in the 
  * respective Mine model.
  */
exports.up = async function (db) {
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true })
  try {
    console.log('Starting mine mapper.');

    const nrptiCollection = await mClient.collection('nrpti');

    // Loop through all Mine projects, and assign them the epicProjectID's value for that 
    // specific mine in this system.
    for (let i = 0; i < mineMaps.length; i++) {
      console.log('Update permit number:', mineMaps[i].permitNumber);
      const mineRecord = await nrptiCollection.findOneAndUpdate({ _schemaName: 'MineBCMI', permitNumber: mineMaps[i].permitNumber },
        { $set: { _epicProjectIds: mineMaps[i].epicProjectIDs } },
        { new: true });

      // If there was a a permit that we actually updated (maybe it's not in the system yet)
      if (mineRecord.value) {
        console.log("Updating master records reference to mineGuid:", mineRecord.value._sourceRefId);

        // Bulk update only BCMI Flavour records with the map to mineGuid
        await nrptiCollection.updateMany(
          {
            _schemaName: {
              $in: [
                'AnnualReportBCMI',
                'CertificateBCMI',
                'CertificateAmendmentBCMI',
                'ConstructionPlanBCMI',
                'CorrespondenceBCMI',
                'DamSafetyInspectionBCMI',
                'InspectionBCMI',
                'ManagementPlanBCMI',
                'OrderBCMI',
                'PermitBCMI',
                'ReportBCMI'
              ]
            },
            _epicProjectId: { $in: mineMaps[i].epicProjectIDs }
          },
          { $set: { mineGuid: mineRecord.value._sourceRefId } })
      } else {
        console.log("Permit number wasn't found.")
      }
    }

  } catch (err) {
    console.log('Error:', err);
  }

  console.log('Done.');
  mClient.close()
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
