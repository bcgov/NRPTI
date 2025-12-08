'use strict';

const ObjectID = require('mongodb').ObjectID;
const mongodb = require('../../utils/mongodb');

exports.findById = async function (id) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collectionDB = db.collection('nrpti');
  return await collectionDB.findOne({ _id: new ObjectID(id) });
};
