'use strict';

let dbm;
let type;
let seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  let mClient;
  try {
    mClient = await db.connection.connect(db.connectionString, { native_parser: true });
    const nrptiCollection = mClient.collection('nrpti')

    nrptiCollection.dropIndex('keyword-search-text-index');

    nrptiCollection.createIndex(
    {
      summary: 'text',
      location: 'text',
      'issuedTo.companyName': 'text',
      'issuedTo.firstName': 'text',
      'issuedTo.middleName': 'text',
      'issuedTo.lastName': 'text',
      'issuedTo.fullName': 'text',
      permitNumbers: 'text',
      recordName: 'text'
    },
    {
      name: 'keyword-search-text-index'
    });
  } catch(err) {
    console.log('Error running keywordIndexUpdate migration: ' + err);
  }

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
