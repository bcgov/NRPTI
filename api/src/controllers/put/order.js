const mongoose = require('mongoose');
const ObjectID = require('mongodb').ObjectID;
const PutUtils = require('../../utils/put-utils');
const PostUtils = require('../../utils/post-utils');
const BusinessLogicManager = require('../../utils/business-logic-manager');
const OrderPost = require('../post/order');

/**
 * Performs all operations necessary to edit a master Order record and its associated flavour records.
 *
 * Example of incomingObj
 *
 *  orders: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'order',
 *      ...
 *      OrderLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      OrderNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns object containing the operation's status and created records
 */
exports.editRecord = async function (args, res, next, incomingObj, overridePutParams = null) {
  const flavourFunctions = {
    OrderLNG: this.editLNG,
    OrderNRCED: this.editNRCED,
    OrderBCMI: this.editBCMI
  }
  return await PutUtils.editRecordWithFlavours(args, res, next, incomingObj, this.editMaster, OrderPost, 'Order', flavourFunctions, overridePutParams);
};

/**
 * Performs all operations necessary to edit a master Order record.
 *
 * Example of incomingObj
 *
 *  orders: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'order',
 *      ...
 *      OrderLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      OrderNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited master order record
 */
exports.editMaster = function (args, res, next, incomingObj, flavourIds) {
  delete incomingObj._id;

  // Reject any changes to master permissions
  delete incomingObj.read;
  delete incomingObj.write;

  const Order = mongoose.model('Order');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(Order, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();
  sanitizedObj.updatedBy = args.swagger.params.auth_payload.displayName;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  const updateObj = { $set: dotNotatedObj };

  if (flavourIds && flavourIds.length) {
    updateObj.$set = {...updateObj.$set };
    updateObj.$addToSet = { _flavourRecords: flavourIds.map(id => new ObjectID(id)) };
  }

  return updateObj;
};

/**
 * Performs all operations necessary to edit a lng Order record.
 *
 * Example of incomingObj
 *
 *  orders: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'order',
 *      ...
 *      OrderLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      OrderNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited lng order record
 */
exports.editLNG = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let OrderLNG = mongoose.model('OrderLNG');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(OrderLNG, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  const flavourId = incomingObj.OrderLNG ? incomingObj.OrderLNG._id : null;
  updateObj = BusinessLogicManager.applyBusinessLogicOnPut(updateObj, sanitizedObj, flavourId, 'OrderLNG');

  return updateObj;
};

/**
 * Performs all operations necessary to edit a nrced Order record.
 *
 * Example of incomingObj
 *
 *  orders: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'order',
 *      ...
 *      OrderLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      OrderNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited nrced order record
 */
exports.editNRCED = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let OrderNRCED = mongoose.model('OrderNRCED');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(OrderNRCED, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  const flavourId = incomingObj.OrderNRCED ? incomingObj.OrderNRCED._id : null;
  updateObj = BusinessLogicManager.applyBusinessLogicOnPut(updateObj, sanitizedObj, flavourId, 'OrderNRCED');

  return updateObj;
};

/**
 * Performs all operations necessary to edit a BCMI Order record.
 *
 * Example of incomingObj
 *
 *  orders: [
 *    {
 *      recordName: 'test abc',
 *      recordType: 'order',
 *      ...
 *      OrderLNG: {
 *        description: 'lng description'
 *        addRole: 'public',
 *        ...
 *      },
 *      OrderNRCED: {
 *        summary: 'nrced summary',
 *        addRole: 'public'
 *        ...
 *      }
 *    }
 *  ]
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns edited bcmi order record
 */
 exports.editBCMI = function (args, res, next, incomingObj) {
  delete incomingObj._id;

  // Reject any changes to permissions
  // Publishing must be done via addRole or removeRole
  delete incomingObj.read;
  delete incomingObj.write;

  let OrderBCMI = mongoose.model('OrderBCMI');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(OrderBCMI, incomingObj);

  sanitizedObj.issuedTo && (sanitizedObj.issuedTo.fullName = PostUtils.getIssuedToFullNameValue(incomingObj.issuedTo));

  sanitizedObj.dateUpdated = new Date();

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  let updateObj = { $set: dotNotatedObj, $addToSet: {}, $pull: {} };

  if (incomingObj.addRole && incomingObj.addRole === 'public') {
    updateObj.$addToSet['read'] = 'public';
    updateObj.$set['datePublished'] = new Date();
    updateObj.$set['publishedBy'] = args.swagger.params.auth_payload.displayName;
  } else if (incomingObj.removeRole && incomingObj.removeRole === 'public') {
    updateObj.$pull['read'] = 'public';
    updateObj.$set['datePublished'] = null;
    updateObj.$set['publishedBy'] = '';
  }

  const flavourId = incomingObj.OrderBCMI ? incomingObj.OrderBCMI._id : null;
  updateObj = BusinessLogicManager.applyBusinessLogicOnPut(updateObj, sanitizedObj, flavourId, 'OrderBCMI');

  return updateObj;
};
