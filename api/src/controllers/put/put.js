'use strict';

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.updateById = async function (id, obj) {
  const db = mongoose.connection.db;
  const collectionDB = db.collection('nrpti');
  return await collectionDB.findOneAndUpdate({ _id: new ObjectId(id) }, obj);
};
