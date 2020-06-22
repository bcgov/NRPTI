const mongodb = require('../../src/utils/mongodb');

/**
 * Updates the recordName subset.
 *
 * @param {*} defaultLog
 */
async function update(defaultLog) {
  const aggregate = [
    {
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
