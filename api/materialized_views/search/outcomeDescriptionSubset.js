let mongodb = require('../../src/utils/mongodb');

async function update(defaultLog) {
  // All records with non-blank outcomeDescription fields
  const aggregate = [
    {
      $match: {
        $and: [{ outcomeDescription: { $exists: true } }, { outcomeDescription: { $nin: [''] } }]
      }
    }
  ];

  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const mainCollection = db.collection('nrpti');

  defaultLog.info('Updating outcome_description_subset');
  aggregate.push({ $out: 'outcome_description_subset' });

  await mainCollection.aggregate(aggregate).next();
}

exports.update = update;
