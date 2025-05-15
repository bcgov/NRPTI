

'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
}

exports.up = async function(db) {
  console.log('**** Removing Documents Referencing Dev S3 ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
    
    const documents = await nrpti.find({ _schemaName: 'Document' }).toArray();
    console.log(`Found ${documents.length} documents`);

    // Get documents referencing Dev S3.
    const devDocs = documents.filter(document => document.url.includes('https://nrs.objectstore.gov.bc.ca/uzpckf'));
    console.log(`${devDocs.length} documents of ${documents.length} reference the Dev S3 bucket`);

    // Locate the records the document is used in and remove them.
    for (const doc of devDocs) {
      const records = await nrpti.find({ documents: doc._id }).toArray();
      console.log(`Document '${doc.fileName}' is used in ${records.length} records`);

      let collectionCount = 0;
      for (const record of records) {
        // Find any collections the record is used in.
        const collections = await nrpti.find({ _schemaName: 'CollectionBCMI', records: record._id }).toArray();

        // If there are any collections (should only be one, but might have more) then remove the record.
        if (collections) {
          collectionCount += collections.length;
          await nrpti.updateMany({ _id: { $in: collections.map(collection => collection._id) } }, { $pull: { records: record._id } });
        }

        // Delete the record.
        await nrpti.remove({ _id: record._id });
      }

      console.log(`Records were found in ${collectionCount} collections and removed`);

      // Delete the document
      await nrpti.remove({ _id: doc._id });
    }

    console.log('**** Finished removing records ****');
  } catch (error) {
    console.error(`Migration did not complete. Error processing records: ${error.message}`);
  }

  mClient.close();
}

exports.down = function(db) {
  return null;
}

exports._meta = {
  "version": 1
}
