'use strict';
const ObjectId = require('mongoose').Types.ObjectId;

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
}

exports.up = async function(db) {
  console.log('**** Updating Fording River and KSM Records****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
    
    // Updates any records that have an EPIC project ID set to Fording River and sets their mineGuid to the correct Core mine which
    // maps them to the Fording River project in NRPTI.
    await nrpti.updateMany({ 
      _epicProjectId: ObjectId('588511a6aaecd9001b823734'),
      _schemaName: { $in: [
        'CertificateBCMI',
        'OrderBCMI',
        'InspectionBCMI',
        'CertificateAmendmentBCMI',
        'ManagementPlanBCMI'
      ]},
      mineGuid: { $in: [null, ''] }
    },
    {  $set: { mineGuid: '739e90ee-807c-4287-91a3-7099352e1ffa' } });

     // Updates any records that have an EPIC project ID set to KSM and sets their mineGuid to the correct Core mine which
    // maps them to the KSM Mine project in NRPTI.
    await nrpti.updateMany({ 
      _epicProjectId: ObjectId('58851156aaecd9001b81e652'),
      _schemaName: { $in: [
        'CertificateBCMI',
        'OrderBCMI',
        'InspectionBCMI',
        'CertificateAmendmentBCMI',
        'ManagementPlanBCMI'
      ]},
      mineGuid: { $in: [null, ''] }
    },
    {  $set: { mineGuid: '86404595-0ac0-4489-a848-a8dce3ed1d96' } });

    console.log('**** Finished updating records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing records: ${error.message}`);
  }

  mClient.close();
}

exports.down = function(db) {
  return null;
}

exports._meta = {
  "version": 1
}
