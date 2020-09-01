'use strict';

const mongodb = require('../../utils/mongodb');

exports.insert = async function (obj) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');
  return await collectionDB.insert(
    obj
  );
}