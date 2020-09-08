'use strict';

const ObjectID = require('mongodb').ObjectID;
const mongodb = require('../../utils/mongodb');

exports.updateById = async function (id, obj) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');
  return await collectionDB.update(
    { _id: new ObjectID(id) },
    obj
  );
}