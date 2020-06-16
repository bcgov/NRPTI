const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;
const { userInRole } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

exports.editRecord = async function(args, res, next, incomingObj) {
  try {
      // Confirm user has correct role.
    if (!userInRole(ROLES.ADMIN_ROLES, args.swagger.params.auth_payload.realm_access.roles)) {
      throw new Error('Missing valid user role.');
    }
    
    const Model = mongoose.model(incomingObj._schemaName);

    // TODO: Something special for NRCED/BCMI?
    if (incomingObj._schemaName === 'ActivityLNG') {
      const record = await Model.findOneAndUpdate(
          { _id: new ObjectId(incomingObj._id) },
          { $set: {
              projectName: incomingObj.projectName,
              description: incomingObj.description,
              url: incomingObj.url,
              title: incomingObj.title,
              _epicProjectId: new ObjectId(incomingObj._epicProjectId),
              type: incomingObj.type,
              date: new Date(incomingObj.date)
            }
          },
          { new: true }
        );
      return {
        status: 'success',
        object: record
      };
    }
  } catch (e) {
    return {
      status: 'failure',
      object: null,
      errorMessage: e.message
    };
  }
};
