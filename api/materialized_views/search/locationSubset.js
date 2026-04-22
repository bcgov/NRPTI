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
    }
  ];

  const db = mongoose.connection.db;
  const mainCollection = db.collection('nrpti');

  defaultLog.info('Updating location_subset');
  aggregate.push({ $out: 'location_subset' });

  await mainCollection.aggregate(aggregate).next();
}

exports.update = update;
