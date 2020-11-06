

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
      console.log(`Document '${doc.fileName}' is used in ${records.length} records... deleting records`);

      // Delete the records
      await nrpti.remove({ _id: records.map(record => record._id) });

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
