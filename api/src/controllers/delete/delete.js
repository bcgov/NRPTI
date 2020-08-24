'use strict';

const ObjectID = require('mongodb').ObjectID;
const mongodb = require('../../utils/mongodb');
const defaultLog = require('../../utils/logger')('record');
const DocumentController = require('../document-controller')

// This will fully delete a master record.
// This includes documents and flavours.
exports.deleteMasterRecord = async function (record) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collection = db.collection('nrpti');
  try {
    let idsToDelete = [];
    idsToDelete.push(new ObjectID(record._id));
    defaultLog.info(`protectedDelete - recordId: ${record._id}`);

    // Get all the flavours to delete
    if (record._flavourRecords && record._flavourRecords.length > 0) {
      for (let i = 0; i < record._flavourRecords.length; i++) {
        idsToDelete.push(new ObjectID(record._flavourRecords[i]));
      }
    }

    let promises = [];

    // Get documents to delete
    // If record._flavourRecords does not exist, we are deleting a flavour.
    // If that's the case, we should leave the documents.
    if (record._flavourRecords && record.documents && record.documents.length > 0) {
      let docIds = [];
      for (let i = 0; i < record.documents.length; i++) {
        docIds.push(new ObjectID(record.documents[i]));
        idsToDelete.push(new ObjectID(record.documents[i]));
      }

      let docRes = null;
      try {
        docRes = await collection.find({ _id: { $in: docIds } }).toArray();
      } catch (error) {
        defaultLog.info(`protectedDelete - couldn't find record documents: ${docRes}`);
        defaultLog.debug(error);
        throw error;
      }

      for (let i = 0; i < docRes.length; i++) {
        if (docRes[i].key) {
          promises.push(DocumentController.deleteS3Document(docRes[i].key));
        }
      }
    }

    promises.push(
      collection.deleteMany(
        { _id: { $in: idsToDelete } }
      )
    );

    return await Promise.all(promises);
  } catch (error) {
    defaultLog.debug(error);
    throw error;
  }
}

// There is a specific check for BCMI flavours because
// we need update the master record to no longer be associated with given mine.
exports.deleteFlavourRecord = async function (flavourId, flavourType) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collection = db.collection('nrpti');
  // We need to make sure we ony delete manual added records.
  try {
    const filter = {
      _flavourRecords: {
        $in: [new ObjectID(flavourId)]
      }
    };

    switch (flavourType) {
      case 'bcmi':
        console.log('wtf');
        await collection.findOneAndUpdate(
          filter,
          {
            $set: {
              mineGuid: null,
              isBcmiPublished: false
            },
            $pull: {
              _flavourRecords: new ObjectID(flavourId)
            }
          }
        );
        break;
      case 'nrced':
        await collection.findOneAndUpdate(
          filter,
          {
            $set: {
              isNrcedPublished: false
            },
            $pull: {
              _flavourRecords: new ObjectID(flavourId)
            }
          }
        );
        break;
      case 'lng':
        await collection.findOneAndUpdate(
          filter,
          {
            $set: {
              isLngPublished: false
            },
            $pull: {
              _flavourRecords: new ObjectID(flavourId)
            }
          }
        );
        break;
      default:
        defaultLog.info(`protectedDelete - flavour type not supported: ${flavourType}`);
        throw `protectedDelete - flavour type not supported: ${flavourType}`;
    }
    return await this.deleteById(flavourId);
  } catch (error) {
    console.log(error);
    defaultLog.info(`protectedDelete - couldn't find master record of: ${flavourId}`);
    defaultLog.debug(error);
    throw error;
  }
}

// Delete items like news, collections or flavours.
exports.deleteById = async function (idToDelete) {
  const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
  const collection = db.collection('nrpti');
  return await collection.deleteOne(
    { _id: new ObjectID(idToDelete) }
  );
}