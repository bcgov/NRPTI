let mongoose = require('mongoose');
let PutUtils = require('../../utils/put-utils');
let OrderPost = require('../post/order');
const ObjectId = require('mongoose').Types.ObjectId;

// Example of incomingObj
/**
 *    orders: [
 *     {
 *       _id: '85ce24e603984b02a0f8edb42a334876',
 *       recordName: 'test abc',
 *       recordType: 'whatever',
 *       ...
 *       OrderLNG: {
 *          description: 'lng description'
 *          addRole: 'public',
 *       }
 *       OrderNRCED: {
 *          summary: 'nrced summary'
 *          removeRole: 'public',
 *       }
 *     },
 */
exports.editMaster = async function(args, res, next, incomingObj) {
  let _id = null;
  let sanitizedObj = {};
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    };
  }

  _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to master perm
  delete incomingObj.read;
  delete incomingObj.write;

  let documents = [];
  if (incomingObj.documents && Array.isArray(incomingObj.documents)) {
    for (let i = 0; i < incomingObj.documents.length; i++) {
      ObjectId.isValid(incomingObj.documents[i]) && (documents.push(incomingObj.documents[i]));
    }
  }
  incomingObj.documents = documents;

  let Order = mongoose.model('Order');
  try {
    sanitizedObj = PutUtils.validateObjectAgainstModel(Order, incomingObj);
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    };
  }

  let finalRes = {
    status: 'success',
    object: sanitizedObj,
    flavours: null
  };
  let savedOrder = null;
  // Skip if there is nothing to update for master
  if (sanitizedObj !== {}) {
    sanitizedObj['dateUpdated'] = new Date();
    sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
    try {
      savedOrder = await Order.findOneAndUpdate(
        { _schemaName: 'Order', _id: _id },
        { $set: sanitizedObj },
        { new: true }
      );
      finalRes.object = savedOrder;
    } catch (e) {
      finalRes.status = 'failure';
      finalRes['errorMessage'] = e;
    }
  }

  // Flavours:
  // When editing, we might get a request to make a brand new flavour rather than edit.
  let observables = [];
  if (incomingObj.OrderLNG && incomingObj.OrderLNG._id) {
    observables.push(this.editLNG(args, res, next, incomingObj.OrderLNG));
    delete incomingObj.OrderLNG;
  } else if (incomingObj.OrderLNG) {
    observables.push(OrderPost.createLNG(args, res, next, incomingObj.OrderLNG, savedOrder._id));
    delete incomingObj.OrderLNG;
  }
  if (incomingObj.OrderNRCED && incomingObj.OrderNRCED._id) {
    observables.push(this.editNRCED(args, res, next, incomingObj.OrderNRCED));
    delete incomingObj.OrderNRCED;
  } else if (incomingObj.OrderNRCED) {
    observables.push(OrderPost.createNRCED(args, res, next, incomingObj.OrderNRCED, savedOrder._id));
    delete incomingObj.OrderNRCED;
  }

  // Execute edit flavours
  try {
    observables.length > 0 && (finalRes.flavours = await Promise.all(observables));
  } catch (e) {
    finalRes.flavours = {
      status: 'failure',
      object: observables,
      errorMessage: e
    };
  }

  return finalRes;
};

// Example of incomingObj
/**
 *  {
 *      _id: 'cd0b34a4ec1341288b5ea4164daffbf2'
 *      description: 'lng description',
 *      ...
 *      addRole: 'public'
 *  }
 */
exports.editLNG = async function(args, res, next, incomingObj) {
  let _id = null;
  let sanitizedObj = {};
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    };
  }

  _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions.
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  // You cannot update _master
  delete incomingObj._master;

  let OrderLNG = mongoose.model('OrderLNG');

  try {
    sanitizedObj = PutUtils.validateObjectAgainstModel(OrderLNG, incomingObj);
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    };
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
  } else if (incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
  }
  updateObj.$set['dateUpdated'] = new Date();

  try {
    let editRes = null;
    editRes = await OrderLNG.findOneAndUpdate({ _schemaName: 'OrderLNG', _id: _id }, updateObj, { new: true });
    return {
      status: 'success',
      object: editRes
    };
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    };
  }
};

// Example of incomingObj
/**
 *  {
 *      _id: 'd95e28e3576247049d797f87e852fec6',
 *      summary: 'nrced summary',
 *      ...
 *      addRole: 'public'
 *  }
 */
exports.editNRCED = async function(args, res, next, incomingObj) {
  let _id = null;
  let sanitizedObj = {};
  if (!incomingObj._id) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'No _id provided'
    };
  }

  _id = incomingObj._id;
  delete incomingObj._id;

  // Reject any changes to permissions.
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  // You cannot update _master
  delete incomingObj._master;

  let OrderNRCED = mongoose.model('OrderNRCED');
  try {
    sanitizedObj = PutUtils.validateObjectAgainstModel(OrderNRCED, incomingObj);
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    };
  }

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: sanitizedObj };
  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj['$addToSet'] = { read: 'public' };
    updateObj.$set['datePublished'] = new Date();
  } else if (incomingObj.removeRole === 'public') {
    updateObj['$pull'] = { read: 'public' };
  }
  updateObj.$set['dateUpdated'] = new Date();

  try {
    let editRes = null;
    editRes = await OrderNRCED.findOneAndUpdate({ _schemaName: 'OrderNRCED', _id: _id }, updateObj, { new: true });
    return {
      status: 'success',
      object: editRes
    };
  } catch (e) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: e
    };
  }
};
