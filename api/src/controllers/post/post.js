'use strict';

const mongoose = require('mongoose');

exports.insert = async function (obj) {
  const db = mongoose.connection.db;
  const collectionDB = db.collection('nrpti');
  return await collectionDB.insertOne(obj);
};
