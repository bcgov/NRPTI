const mongoose = require('mongoose');

exports.editRecord = async function(args, res, next, incomingObj) {
  try {
    const Model = mongoose.model(incomingObj._schemaName);

    // TODO: Something special for NRCED/BCMI?
    if (incomingObj._schemaName === 'ActivityLNG') {
      const record = await Model.findOneAndUpdate(
          { _id: new mongoose.Types.ObjectID(incomingObj._id) },
          { $set: {
              projectName: incomingObj.projectName,
              description: incomingObj.description,
              url: incomingObj.url,
              _epicProjectId: new mongoose.Types.ObjectID(incomingObj._epicProjectId),
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
