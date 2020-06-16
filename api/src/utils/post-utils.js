const ObjectId = require('mongoose').Types.ObjectId;
const mongodb = require('../utils/mongodb');

/**
 * Builds the issuedTo.fullName string, based on the issuedTo.type field.
 *
 * @param {*} issuedToObj
 * @returns
 */
exports.getIssuedToFullNameValue = function (issuedToObj) {
  if (!issuedToObj || !issuedToObj.type) {
    return '';
  }

  if (issuedToObj.type === 'IndividualCombined') {
    return issuedToObj.fullName;
  }

  if (issuedToObj.type === 'Company') {
    return issuedToObj.companyName;
  }

  if (!issuedToObj.firstName && !issuedToObj.middleName && !issuedToObj.lastName) {
    return '';
  }

  if (issuedToObj.type === 'Individual') {
    let entityString = '';

    const entityNameParts = [];
    if (issuedToObj.lastName) {
      entityNameParts.push(issuedToObj.lastName);
    }

    if (issuedToObj.firstName) {
      entityNameParts.push(issuedToObj.firstName);
    }

    entityString = entityNameParts.join(', ');

    if (issuedToObj.middleName) {
      entityString += ` ${issuedToObj.middleName}`;
    }

    return entityString;
  }
};

exports.createRecordWithFlavours = async function (args, res, next, incomingObj, createMaster, flavourFunctions = {}) {
  let flavours = [];
  let flavourIds = [];
  let promises = [];
  // We have this in case there's error and we need to clean up.
  let idsToDelete = [];

  if (!incomingObj.documents) {
    incomingObj.documents = [];
  }

  // Default flavour publish statuses to false
  incomingObj.isNrcedPublished = false;
  incomingObj.isLngPublished = false;

  // Prepare flavours
  const entries = Object.entries(flavourFunctions);
  // Example of entries: [['OrderLNG', createLNG()], ['OrderNRCED', createNRCED()]]
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (!incomingObj[entry[0]]) {
      continue;
    }

    // This is to determine how we should populate the fields in master that know
    // the publish state of its flavours.
    if (incomingObj[entry[0]].addRole && incomingObj[entry[0]].addRole.includes('public')) {
      entry[0].includes('NRCED') && (incomingObj.isNrcedPublished = true);
      entry[0].includes('LNG') && (incomingObj.isLngPublished = true);
    }

    incomingObj[entry[0]] &&
      flavours.push(entry[1](args, res, next, { ...incomingObj, ...incomingObj[entry[0]] }));
  }

  // Get flavour ids for master
  if (flavours.length > 0) {
    flavourIds = flavours.map(
      flavour => flavour._id
    );
    idsToDelete = [...flavourIds];
  }

  // Prepare master
  let masterRecord = createMaster(args, res, next, incomingObj, flavourIds);
  idsToDelete.push(masterRecord._id);

  // Set master back ref to flavours get ready to save
  for (let i = 0; i < flavours.length; i++) {
    flavours[i]._master = new ObjectId(masterRecord._id);
    promises.push(flavours[i].save());
  }
  promises.push(masterRecord.save());

  // Attempt to save everything.

  let result = null;
  try {
    result = await Promise.all(promises);
  } catch (e) {
    // Something went wrong. Attempt to clean up
    const db = mongodb.connection.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const collection = db.collection('nrpti');
    let orArray = [];
    for (let i = 0; i < idsToDelete.length; i++) {
      orArray.push({ _id: new ObjectId(idsToDelete[i]) });
    }
    await collection.deleteMany({
      $or: orArray
    });

    return {
      status: 'failure',
      object: result,
      errorMessage: e.message
    };
  }
  return {
    status: 'success',
    object: result
  };
}
