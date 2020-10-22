'use strict';

var dbm;
var type;
var seed;

const ObjectID = require('mongodb').ObjectID;

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
  console.log('**** Adding _master reference to all flavours that do not have it. ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');

    const flavourRecords = await nrpti.find(
      {
        _schemaName: {
          $in: [
            'AnnualReportBCMI',
            'CertificateAmendmentBCMI',
            'CorrespondenceBCMI',
            'DamSafetyInspectionBCMI',
            'InspectionBCMI',
            'ManagementPlanBCMI',
            'OrderBCMI',
            'PermitBCMI',
            'ReportBCMI',
            'OrderNRCED',
            'InspectionNRCED',
            'RestorativeJusticeNRCED',
            'AdministrativePenaltyNRCED',
            'AdministrativeSanctionNRCED',
            'TicketNRCED',
            'WarningNRCED',
            'CourtConvictionNRCED',
            'CorrespondenceNRCED',
            'DamSafetyInspectionNRCED',
            'ReportNRCED',
            'AdministrativePenaltyLNG',
            'AdministrativeSanctionLNG',
            'AgreementLNG',
            'CertificateLNG',
            'CertificateAmendmentLNG',
            'ConstructionPlanLNG',
            'CourtConvictionLNG',
            'InspectionLNG',
            'ManagementPlanLNG',
            'OrderLNG',
            'PermitLNG',
            'RestorativeJusticeLNG',
            'SelfReportLNG',
            'TicketLNG',
            'WarningLNG'
          ]
        },
        $or: [
          { _master: { $exists: false } },
          { _master: null }
        ]
      }
    ).toArray();

    let promises = [];

    console.log(flavourRecords.length);
    for (let i = 0; i < flavourRecords.length; i++) {
      const flavourRecord = flavourRecords[i];
      let masterRecord = await nrpti.findOne(
        {
          _flavourRecords: { $in: [new ObjectID(flavourRecord._id)] }
        }
      );
      if (masterRecord) {
        promises.push(
          nrpti.findOneAndUpdate(
            { _id: new ObjectID(flavourRecord._id) },
            { $set: { _master: new ObjectID(masterRecord._id) } }
          )
        );
      } else {
        console.log('Orphaned flavour record found. Deleting...')

        promises.push(
          nrpti.deleteOne(
            { _id: new ObjectID(flavourRecord._id) }
          )
        );
      }
    }

    await Promise.all(promises);

    console.log('**** Finished updating flavour records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing flavour records: ${error.message}`);
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
