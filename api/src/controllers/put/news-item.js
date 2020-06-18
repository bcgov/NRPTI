const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

exports.editRecord = async function(args, res, next, incomingObj) {
  try {
    const Model = mongoose.model(incomingObj._schemaName);

    // TODO: Something special for NRCED/BCMI?
    if (incomingObj._schemaName === 'ActivityLNG') {
      const record = await Model.findOneAndUpdate(
          { _id: new ObjectId(incomingObj._id), write: { $in: args.swagger.params.auth_payload.realm_access.roles } },
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
