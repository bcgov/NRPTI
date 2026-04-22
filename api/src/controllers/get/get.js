'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.findById = async function (id) {
  const db = mongoose.connection.db;
  const collectionDB = db.collection('nrpti');
  return await collectionDB.findOne({ _id: new ObjectId(id) });
};
