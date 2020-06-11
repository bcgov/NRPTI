const mongodb = require('../../src/utils/mongodb');

/**
 * Updates the recordName subset.
 *
 * Note: recordName exists on all 14 basic record types, but is currently only accessible by users in any capacity as
 * part of the  LNG flavour. Therefore, this subset should not include the recordName field from master or other non-LNG
 * flavour records.
 *
 * @param {*} defaultLog
 */
async function update(defaultLog) {
  const aggregate = [
    {
      // Match all master records that could have an LNG flavour record
      $match: {
        _schemaName: {
          $in: [
            'AdministrativePenalty',
            'AdministrativeSanction',
            'Agreement',
            'Certificate',
            'ConstructionPlan',
            'CourtConviction',
            'Inspection',
            'ManagementPlan',
            'Order',
            'Permit',
            'RestorativeJustice',
            'SelfReport',
            'Ticket',
            'Warning'
          ]
        }
      }
    },
    {
      // Lookup associated flavour records
      $lookup: {
        from: 'nrpti',
        localField: '_flavourRecords',
        foreignField: '_id',
        as: 'flavours'
      }
    },
    {
      // Unwind array of flavour records
      $unwind: '$flavours'
    },
    {
      // Redact any records that don't aren't an LNG flavour type
      $redact: {
        $cond: {
          if: {
            $in: [
              '$flavours._schemaName',
              [
                'AdministrativePenaltyLNG',
                'AdministrativeSanctionLNG',
                'AgreementLNG',
                'CertificateLNG',
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
            ]
          },
          then: '$$KEEP',
          else: '$$PRUNE'
        }
      }
    }
  ];

  try {
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const mainCollection = db.collection('nrpti');

    defaultLog.debug('Updating record_name_subset');
    aggregate.push({ $out: 'record_name_subset' });

    await mainCollection.aggregate(aggregate).next();
  } catch (error) {
    defaultLog.debug('Failed to update record_name_subset, error: ', error);
  }
}

exports.update = update;
