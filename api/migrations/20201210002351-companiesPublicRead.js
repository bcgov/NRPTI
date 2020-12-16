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
  // Add public to issuedTo read array if type is company
  console.log('**** Updating issuedTo read if entity is a company ****');
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
            'issuedTo.type': { $eq: 'Company' }
          },
          {
            read: {
              $in: ['public']
            }
          }
        ]
      },
      { $addToSet: { 'issuedTo.read': 'public' } }
    );
  } catch (error) {
    console.log('Error updating records read array with wildfire role', error);
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
