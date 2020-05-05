let mongodb = require('../../src/utils/mongodb');

async function update(defaultLog) {
  const aggregate = [
    {
      $match: {
        '_schemaName': {
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

  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const mainCollection = db.collection('nrpti');

  defaultLog.debug('Updating issued_to_subset');
  aggregate.push({ $out: 'issued_to_subset' });

  await mainCollection.aggregate(aggregate).next();
}

exports.update = update;