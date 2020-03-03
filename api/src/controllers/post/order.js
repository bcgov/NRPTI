let mongoose = require('mongoose');
let ObjectId = require('mongoose').Types.ObjectId;

// Example of incomingObj
/**
 *    orders: [
 *     {
 *       recordName: 'test abc',
 *       recordType: 'whatever',
 *       ...
 *       OrderLNG: {
 *          description: 'lng description'
 *          addRole: 'public',
 *       }
 *     },
 */
exports.createMaster = async function (args, res, next, incomingObj) {
  let Order = mongoose.model('Order');
  let order = new Order();

  order._schemaName = 'Order';
  incomingObj._epicProjectId && ObjectId.isValid(incomingObj._epicProjectId) && (order._epicProjectId = new ObjectId(incomingObj._epicProjectId));
  incomingObj._sourceRefId && ObjectId.isValid(incomingObj._sourceRefId) && (order._sourceRefId = new ObjectId(incomingObj._sourceRefId));
  incomingObj._epicMilestoneId && ObjectId.isValid(incomingObj._epicMilestoneId) && (order._epicMilestoneId = new ObjectId(incomingObj._epicMilestoneId));

  incomingObj.recordName && (order.recordName = incomingObj.recordName);
  order.recordType = 'Order';
  incomingObj.recordSubtype && (order.recordSubtype = incomingObj.recordSubtype);
  incomingObj.dateIssued && (order.dateIssued = incomingObj.dateIssued);
  incomingObj.issuingAgency && (order.issuingAgency = incomingObj.issuingAgency);
  incomingObj.author && (order.author = incomingObj.author);
  incomingObj.legislation && (order.legislation = incomingObj.legislation);
  incomingObj.issuedTo && (order.issuedTo = incomingObj.issuedTo);
  incomingObj.projectName && (order.projectName = incomingObj.projectName);
  incomingObj.location && (order.location = incomingObj.location);
  incomingObj.centroid && (order.centroid = incomingObj.centroid);
  incomingObj.outcomeStatus && (order.outcomeStatus = incomingObj.outcomeStatus);
  incomingObj.outcomeDescription && (order.outcomeDescription = incomingObj.outcomeDescription);

  order.dateAdded = new Date();
  order.publishedBy = args.swagger.params.auth_payload.displayName;

  incomingObj.sourceDateAdded && (order.sourceDateAdded = incomingObj.sourceDateAdded);
  incomingObj.sourceDateUpdated && (order.sourceDateUpdated = incomingObj.sourceDateUpdated);
  incomingObj.sourceSystemRef && (order.sourceSystemRef = incomingObj.sourceSystemRef);

  order.read = ['sysadmin'];
  order.write = ['sysadmin'];

  let savedOrder = null;
  try {
    savedOrder = await order.save();
  } catch (e) {
    return {
      status: 'failure',
      object: order,
      errorMessage: e
    }
  }

  let observables = [];
  incomingObj.OrderLNG && observables.push(this.createLNG(args, res, next, incomingObj.OrderLNG, savedOrder._id));
  incomingObj.OrderNRCED && observables.push(this.createNRCED(args, res, next, incomingObj.OrderNRCED, savedOrder._id));

  let flavourRes = null;
  try {
    observables.length > 0 && (flavourRes = await Promise.all(observables));
  } catch (e) {
    flavourRes = {
      status: 'failure',
      object: observables,
      errorMessage: e
    }
  }

  return {
    status: 'success',
    object: savedOrder,
    flavours: flavourRes
  }
};

// Example of incomingObj
/**
 *  {
 *      _master: '5e1e7fcd20e4167bcfc3daa7'
 *      description: 'lng description',
 *      ...
 *      addRole: 'public'
 *  }
 */
exports.createLNG = async function (args, res, next, incomingObj, masterId) {
  // We must have a valid master ObjectID to continue.
  if (!masterId || !ObjectId.isValid(masterId)) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'incomingObj._master was not valid ObjectId'
    }
  }

  let OrderLNG = mongoose.model('OrderLNG');
  let orderLNG = new OrderLNG();

  orderLNG._schemaName = 'OrderLNG';
  orderLNG._master = new ObjectId(masterId);
  orderLNG.read = ['sysadmin'];
  orderLNG.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole && incomingObj.addRole === 'public' && orderLNG.read.push('public') && (orderLNG.datePublished = new Date());

  incomingObj.description && (orderLNG.description = incomingObj.description);

  orderLNG.dateAdded = new Date();

  try {
    let savedOrderLNG = await orderLNG.save();
    return {
      status: 'success',
      object: savedOrderLNG
    }
  } catch (e) {
    return {
      status: 'failure',
      object: orderLNG,
      errorMessage: e
    }
  }
};

// Example of incomingObj
/**
 *  {
 *      _master: '5e1e7fcd20e4167bcfc3daa7'
 *      description: 'nrced description',
 *      ...
 *      addRole: 'public'
 *  }
 */
exports.createNRCED = async function (args, res, next, incomingObj, masterId) {
  // We must have a valid master ObjectID to continue.
  if (!masterId || !ObjectId.isValid(masterId)) {
    return {
      status: 'failure',
      object: incomingObj,
      errorMessage: 'incomingObj._master was not valid ObjectId'
    }
  }

  let OrderNRCED = mongoose.model('OrderNRCED');
  let orderNRCED = new OrderNRCED();

  orderNRCED._schemaName = 'OrderNRCED';
  orderNRCED._master = new ObjectId(masterId);
  orderNRCED.read = ['sysadmin'];
  orderNRCED.write = ['sysadmin'];
  // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
  incomingObj.addRole && incomingObj.addRole === 'public' && orderNRCED.read.push('public') && (orderNRCED.datePublished = new Date());

  incomingObj.summary && (orderNRCED.summary = incomingObj.summary);

  orderNRCED.dateAdded = new Date();

  try {
    let savedOrderNRCED = await orderNRCED.save();
    return {
      status: 'success',
      object: savedOrderNRCED
    }
  } catch (e) {
    return {
      status: 'failure',
      object: orderNRCED,
      errorMessage: e
    }
  }
};
