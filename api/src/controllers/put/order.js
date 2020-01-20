var mongoose = require('mongoose');
var putUtils = require('../../utils/put-utils');

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
exports.editMaster = async function (args, res, next, incomingObj) {
    var _id = null;
    if (!incomingObj._id) {
        return {
            status: 'failure',
            object: incomingObj,
            errorMessage: 'No _id provided'
        }
    }

    _id = incomingObj._id;
    delete incomingObj._id;

    // Reject any changes to master perm
    delete incomingObj.read;
    delete incomingObj.write;

    var Order = mongoose.model('Order');
    try {
        var sanitizedObj = putUtils.validateObjectAgainstModel(Order, incomingObj);
    } catch (e) {
        return {
            status: 'failure',
            object: incomingObj,
            errorMessage: e
        }
    }

    // Get flavours
    var observables = [];
    incomingObj.OrderLNG && observables.push(this.editLNG(args, res, next, incomingObj.OrderLNG)) && delete incomingObj.OrderLNG;
    incomingObj.OrderNRCED && observables.push(this.editNRCED(args, res, next, incomingObj.OrderNRCED)) && delete incomingObj.OrderNRCED;

    var finalRes = {
        status: 'success',
        object: sanitizedObj,
        flavours: null
    }
    // Skip if there is nothing to update for master
    if (sanitizedObj !== {}) {
        sanitizedObj['dateUpdated'] = new Date();
        sanitizedObj['updatedBy'] = args.swagger.params.auth_payload.displayName;
        try {
            var savedOrder = savedOrder = await Order.findOneAndUpdate(
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

    // Execute edit flavours
    try {
        observables.length > 0 && (finalRes.flavours = await Promise.all(observables));
    } catch (e) {
        finalRes.flavours = {
            status: 'failure',
            object: observables,
            errorMessage: e
        }
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
exports.editLNG = async function (args, res, next, incomingObj) {
    var _id = null;
    if (!incomingObj._id) {
        return {
            status: 'failure',
            object: incomingObj,
            errorMessage: 'No _id provided'
        }
    }

    _id = incomingObj._id;
    delete incomingObj._id;

    // Reject any changes to permissions.
    // Publishing must be done via addRole or removeRole
    delete incomingObj.read;
    delete incomingObj.write;

    // You cannot update _master
    delete incomingObj._master;

    var OrderLNG = mongoose.model('OrderLNG');

    try {
        var sanitizedObj = putUtils.validateObjectAgainstModel(OrderLNG, incomingObj);
    } catch (e) {
        return {
            status: 'failure',
            object: incomingObj,
            errorMessage: e
        }
    }

    // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
    let updateObj = { $set: sanitizedObj };
    if (incomingObj.addRole && incomingObj.addRole === 'public') {
        updateObj['$addToSet'] = { read: 'public' }
        updateObj.$set['datePublished'] = new Date();
    } else if (incomingObj.removeRole === 'public') {
        updateObj['$pull'] = { read: 'public' }
    }
    updateObj.$set['dateUpdated'] = new Date();

    try {
        var editRes = null
        editRes = await OrderLNG.findOneAndUpdate(
            { _schemaName: 'OrderLNG', _id: _id },
            updateObj,
            { new: true }
        );
        return {
            status: 'success',
            object: editRes
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
 *      _id: 'd95e28e3576247049d797f87e852fec6',
 *      summary: 'nrced summary',
 *      ...
 *      addRole: 'public'
 *  }
 */
exports.editNRCED = async function (args, res, next, incomingObj) {
    var _id = null;
    if (!incomingObj._id) {
        return {
            status: 'failure',
            object: incomingObj,
            errorMessage: 'No _id provided'
        }
    }

    _id = incomingObj._id;
    delete incomingObj._id;

    // Reject any changes to permissions.
    // Publishing must be done via addRole or removeRole
    delete incomingObj.read;
    delete incomingObj.write;

    // You cannot update _master
    delete incomingObj._master;

    var OrderNRCED = mongoose.model('OrderNRCED');
    try {
        var sanitizedObj = putUtils.validateObjectAgainstModel(OrderNRCED, incomingObj);
    } catch (e) {
        return {
            status: 'failure',
            object: incomingObj,
            errorMessage: e
        }
    }

    // If incoming object has addRole: 'public' then read will look like ['sysadmin', 'public']
    let updateObj = { $set: sanitizedObj };
    if (incomingObj.addRole && incomingObj.addRole === 'public') {
        updateObj['$addToSet'] = { read: 'public' }
        updateObj.$set['datePublished'] = new Date();
    } else if (incomingObj.removeRole === 'public') {
        updateObj['$pull'] = { read: 'public' }
    }
    updateObj.$set['dateUpdated'] = new Date();

    try {
        var editRes = null
        editRes = await OrderNRCED.findOneAndUpdate(
            { _schemaName: 'OrderNRCED', _id: _id },
            updateObj,
            { new: true }
        );
        return {
            status: 'success',
            object: editRes
        }
    } catch (e) {
        return {
            status: 'failure',
            object: orderNRCED,
            errorMessage: e
        }
    }
};
