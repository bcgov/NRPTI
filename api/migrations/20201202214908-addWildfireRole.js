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
  // Add wildfire role to the read array and write array of records that issuing agency = BC Wildfire Service
  // Add wildfire to issued to read if type is individual
  console.log('**** Adding wildfire role ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  const nrpti = await mClient.collection('nrpti');

  const allRecordSchemaNames = [
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
    'Report',
    'ActivityLNG',
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
    'WarningLNG',
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
    'ReportNRCED'
  ];

  try {
    await nrpti.updateMany(
      {
        $and: [
          {
            _schemaName: {
              $in: allRecordSchemaNames
            }
          },
          {
            read: {
              $in: ['public']
            }
          }
        ]
      },
      { $addToSet: { read: 'admin:wf' } }
    );
  } catch (error) {
    console.log('Error updating records read array with wildfire role');
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
