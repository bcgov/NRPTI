const mongoose = require('mongoose');

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
    },
    {
      $lookup: {
        from: 'nrpti',
        localField: '_flavourRecords',
        foreignField: '_id',
        as: 'flavours'
      }
    }
  ];

  try {
    const db = mongoose.connection.db;
    const mainCollection = db.collection('nrpti');

    defaultLog.info('Updating description_summary_subset');
    aggregate.push({ $out: 'description_summary_subset' });

    await mainCollection.aggregate(aggregate).next();
  } catch (error) {
    defaultLog.debug('Failed to update description_summary_subset, error: ', error);
  }
}

exports.update = update;
