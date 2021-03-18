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

  try {
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const mainCollection = db.collection('nrpti');

    console.log('Updating outcome_description_subset');
    aggregate.push({ $out: 'outcome_description_subset' });

    await mainCollection.aggregate(aggregate).next();
    
  } catch (error) {
    console.log('Failed to update outcome_description_subset, error: ', error);
    
  }
}

exports.update = update;
