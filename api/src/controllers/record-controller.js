'use strict';

let queryActions = require('../utils/query-actions');
let queryUtils = require('../utils/query-utils');

let defaultLog = require('../utils/logger')('record');

let AddOrder = require('./post/order');
let AddInspection = require('./post/inspection');
let EditOrder = require('./put/order');
let EditInspection = require('./put/inspection');

// let allowedFields = ['_createdBy', 'createdDate', 'description', 'publishDate', 'type'];

// Authenticated Requests

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedOptions = function (args, res, next) {
  res.status(200).send();
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.protectedGet = function (args, res, next) {
  return queryActions.sendResponse(res, 501);
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
/**
 * Example of args.swagger.params.data.value
 * {
 *   orders: [
 *     {
 *       recordName: 'test abc',
 *       recordType: 'whatever',
 *       ...
 *       OrderLNG: {
 *          description: 'lng description'
 *          addRole: 'public',
 *       }
 *     },
 *     {
 *       recordName: 'this is a name',
 *       recordType: 'this is a type',
 *       ...
 *     }
 *   ],
 *   inspections: [
 *     {
 *       recordName: 'test 123',
 *       recordType: 'test type',
 *       ...
 *     },
 *     {
 *       recordName: 'inspection test name',
 *       recordType: 'inspection type',
 *       ...
 *     },
 *     ...
 *   ],
 *   authorizations: [...],
 *   ...
 * }
 */
exports.protectedPost = async function (args, res, next) {
  var observables = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    var data = args.swagger.params.data.value;

    if (data.orders) {
      observables.push(processPostRequest(args, res, next, 'orders', data.orders));
    }
    if (data.inspections) {
      observables.push(processPostRequest(args, res, next, 'inspections', data.inspections));
    }

    var response = await Promise.all(observables);

    return queryActions.sendResponse(res, 200, response);
  } else {
    return queryActions.sendResponse(res, 500, { error: 'You must provide data' });
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPut = async function (args, res, next) {
  var observables = [];

  if (args.swagger.params.data && args.swagger.params.data.value) {
    var data = args.swagger.params.data.value;

    if (data.orders) {
      observables.push(processPutRequest(args, res, next, 'orders', data.orders));
    }
    if (data.inspections) {
      observables.push(processPutRequest(args, res, next, 'inspections', data.inspections));
    }

    var response = await Promise.all(observables);

    return queryActions.sendResponse(res, 200, response);
  } else {
    return queryActions.sendResponse(res, 500, { error: 'You must provide data' });
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedDelete = function (args, res, next) {
  return queryActions.sendResponse(res, 501);
};

/**
 * Publish a record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedPublish = async function (args, res, next) {
  try {
    const recordData = args.swagger.params.record.value;
    defaultLog.info(`protectedPublish - recordId: ${recordData._id}`);

    const model = require('mongoose').model(recordData._schemaName);

    const record = await model.findOne({ _id: recordData._id });

    if (!record) {
      defaultLog.info(`protectedPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    defaultLog.debug(`protectedPublish - record: ${JSON.stringify(record)}`);

    const published = await queryActions.publish(record, true);

    await queryUtils.recordAction('Publish', record, args.swagger.params.auth_payload.preferred_username, record._id);

    return queryActions.sendResponse(res, 200, published);
  } catch (error) {
    return queryActions.sendResponse(res, 500, error);
  }
};

/**
 * Unpublish a record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 */
exports.protectedUnPublish = async function (args, res, next) {
  try {
    const recordData = args.swagger.params.record.value;
    defaultLog.info(`protectedUnPublish - recordId: ${recordData._id}`);

    const model = require('mongoose').model(recordData._schemaName);

    const record = await model.findOne({ _id: recordData._id });

    if (!record) {
      defaultLog.info(`protectedUnPublish - couldn't find record for recordId: ${record._id}`);
      return queryActions.sendResponse(res, 404, {});
    }

    defaultLog.debug(`protectedUnPublish - record: ${JSON.stringify(record)}`);

    const unPublished = await queryActions.unPublish(record);

    await queryUtils.recordAction('UnPublish', record, args.swagger.params.auth_payload.preferred_username, record._id);

    return queryActions.sendResponse(res, 200, unPublished);
  } catch (error) {
    return queryActions.sendResponse(res, 500, error);
  }
};

// Public Requests

/**
 * TODO: populate this documentation
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @returns
 */
exports.publicGet = function (args, res, next) {
  return queryActions.sendResponse(res, 501);
};

let processPostRequest = async function (args, res, next, property, data) {
  if (data.length === 0) {
    return {
      status: 'success',
      object: {}
    };
  }

  var i = data.length - 1;
  var observables = [];

  do {
    switch (property) {
      case 'orders':
        observables.push(AddOrder.createMaster(args, res, next, data[i]));
        break;
      case 'inspections':
        observables.push(AddInspection.createMaster(args, res, next, data[i]));
        break;
      default:
        return {
          errorMessage: `Property ${property} does not exist.`
        }
    }
  } while (i-- > 0);

  try {
    return await Promise.all(observables);
  } catch (e) {
    return {
      status: 'failure',
      object: observables,
      errorMessage: e
    }
  }
};

let processPutRequest = async function (args, res, next, property, data) {
  if (data.length === 0) {
    return {
      status: 'success',
      object: {}
    }
  }

  var i = data.length - 1;
  var observables = [];

  do {
    switch (property) {
      case 'orders':
        observables.push(EditOrder.editMaster(args, res, next, data[i]));
        break;
      case 'inspections':
        observables.push(EditInspection.editMaster(args, res, next, data[i]));
        break;
      default:
        return {
          errorMessage: `Property ${property} does not exist.`
        };
    }
  } while (i-- > 0);

  try {
    return await Promise.all(observables);
  } catch (e) {
    return {
      status: 'failure',
      object: observables,
      errorMessage: e
    };
  }
};

/* eslint-enable no-redeclare */
