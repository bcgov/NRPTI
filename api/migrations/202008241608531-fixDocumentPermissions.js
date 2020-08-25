'use strict';

const { publishS3Document, unpublishS3Document } = require('../src/controllers/document-controller');

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
  console.log('**** Updating document permissions ****');
  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });

  try {
    const nrpti = await mClient.collection('nrpti');
    const documents = await nrpti.find({ _schemaName: 'Document' }).toArray();
    const promises = [];

    for (const document of documents) {
      promises.push(updatePermissions(document));
    }

    await Promise.all(promises);
  } catch (err) {
    console.error('Error connecting to database or finding document', err);
  }

  console.log('**** Document permissions updated ****');

  mClient.close();
}

exports.down = function(db) {
  return null;
}

exports._meta = {
  "version": 1
}

async function updatePermissions(document) {
  if (!document) {
    return;
  }

  if (!document.read || !document.key) {
    console.error(`Error processing document ${document._id}: Document missing read or key property`);
    return;
  }

  try {
    if (document.read.includes('public')) {
      return await publishS3Document(document.key);
    }
    else {
      return await unpublishS3Document(document.key)
    }
  } catch (err) {
    console.error(`Error processing document ${document._id}: ${err.message}`);
  }
}