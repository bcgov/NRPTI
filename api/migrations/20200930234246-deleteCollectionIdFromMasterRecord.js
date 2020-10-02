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

exports.up = async function (db) {
  console.log('**** Removing collectionId field from master records ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    await nrpti.updateMany(
      {
        _schemaName: {
          $in: [
            'Order',
            'Inspection',
            'Certificate',
            'Permit',
            'SelfReport',
            'Agreement',
            'RestorativeJustice',
            'Ticket',
            'AdministrativePenalty',
            'AdministrativeSanction',
            'Warning',
            'ConstructionPlan',
            'ManagementPlan',
            'CourtConviction',
            'AnnualReport',
            'CertificateAmendment',
            'Correspondence',
            'DamSafetyInspection',
            'Report'
          ]
        },
        collectionId: { $exists: true }
      },
      {
        $unset: { 'collectionId': 1 }
      }
    );

    console.log('**** Finished updating master records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing master records: ${error.message}`);
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
