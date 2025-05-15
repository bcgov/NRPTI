'use strict';

const { ObjectId } = require('mongodb');

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

  const mClient = await db.connection.connect(db.connectionString, {
    native_parser: true
  });

  try {
    console.log('**** Started tracking all documents in redacted_record_subset ****');

    const nrptiCollection = await mClient.collection('nrpti');
    const redactedRecordSubsetCollection = await mClient.collection('redacted_record_subset');

    // Find all documents with an existing, non-empty "documents" array in redacted_record_subset collection
    const matchingDocuments = await redactedRecordSubsetCollection
      .find({
        "documents": { $ne: [], $exists: true }
      })
      .toArray();

    console.log('**** Found ' + matchingDocuments.length + ' documents with an existing, non-empty "documents" array in redacted_record_subset collection ****');

    // Take all ObjectIDs from these "documents" arrays and put them in a new array
    const objectIDsArray = matchingDocuments.reduce((acc, doc) => {
      acc.push(...doc.documents.map(id => new ObjectId(id)));
      return acc;
    }, []);

    console.log('**** Found ' + objectIDsArray.length + ' ObjectIDs in the "documents" arrays ****');

    // Check if each ObjectID exists in the "nrpti" or "redacted_record_subset" collection
    const matchingObjectIDs = [];
    const nonMatchingObjectIDs = [];

    console.log('**** Checking if each ObjectID exists in the "nrpti" or "redacted_record_subset" collection ****');

    for (const objectID of objectIDsArray) {
      // Check in the nrpti collection
      const nrptiDocument = await nrptiCollection.findOne({ _id: objectID, _schemaName: 'Document' });

      // Check in the redacted_record_subset collection
      const redactedRecordSubsetDocument = await redactedRecordSubsetCollection.findOne({ _id: objectID, _schemaName: 'Document' });

      if (nrptiDocument || redactedRecordSubsetDocument) {
        matchingObjectIDs.push(objectID);
      } else {
        nonMatchingObjectIDs.push(objectID);
      }
    }

  console.log('**** Found ' + matchingObjectIDs.length + ' matching ObjectIDs ****');
  console.log('**** Found ' + nonMatchingObjectIDs.length + ' non-matching ObjectIDs ****');

  console.log('**** Updating "documents" arrays in redacted_record_subset collection ****');

  // Remove all non-matching ObjectIDs from the "documents" array in the redacted_record_subset collection
  for (const nonMatchingObjectID of nonMatchingObjectIDs) {
    // Update documents in the "redacted_record_subset" collection
    const result = await redactedRecordSubsetCollection.updateMany(
      { "documents": nonMatchingObjectID },
      { "$pull": { "documents": nonMatchingObjectID } }
    );
  
    console.log(`Removed ${result.modifiedCount} instances of ${nonMatchingObjectID} from "redacted_record_subset" collection.`);
  }
      
  } catch (error) {
    console.error(`Migration did not complete. Error processing: ${error.message}`);
  } finally {
    mClient.close();
  }
};
  
exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};