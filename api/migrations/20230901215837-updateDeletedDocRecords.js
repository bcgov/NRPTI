'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
  console.log('**** Updating Records with Deleted Attachments ****');

  // Collection Names
  const collectionName = 'redacted_record_subset';
  const nrptiCollectionName = 'nrpti';

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });
  

  const collection = await mClient.collection(collectionName);
  const nrptiCollection = await mClient.collection(nrptiCollectionName);

  // Subquery to find _id values with schema 'Document' in both collections
  const subquery = [
    { _schemaName: 'Document' },
    { _schemaName: 'Document' }
  ];

  Promise.all([
    collection.find({ $or: subquery }, { _id: 1 }).toArray(),
    nrptiCollection.find({ $or: subquery }, { _id: 1 }).toArray()
  ])
  .then(([collectionResults, nrptiResults]) => {
    // Extract _id values from the subquery results
    const validIds = [...new Set([...collectionResults, ...nrptiResults].map(item => item._id))];

    // Update documents to an empty array where _id is not in validIds
    const updateQuery = {
      _id: { $nin: validIds }
    };

    const updateOperation = {
      $set: {
        documents: []
      }
    };

    return collection.updateMany(updateQuery, updateOperation);
  })
  .then(updateResult => {
    console.log(`Updated ${updateResult.modifiedCount} documents in the ${collectionName} collection.`);
  })
  .catch(err => {
  });

  mClient.close();

}

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
