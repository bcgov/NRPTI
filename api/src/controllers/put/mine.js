const mongoose = require('mongoose');
const ObjectId = require('mongoose').Types.ObjectId;

const SYSTEM_USER = 'SYSTEM_USER';

/**
 * Performs all operations necessary to edit a master Mine record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj see example
 * @returns object containing the operation's status and created records
 */
exports.editRecord = async function(args, res, next, incomingObj) {
  try {
    if (incomingObj._schemaName !== 'MineBCMI') {
      throw new Error('editRecord - incorrect schema type, must be MineBCMI');
    }

    const Model = mongoose.model('MineBCMI');

    const record = await Model.findOneAndUpdate(
        { _id: new ObjectId(incomingObj._id) },
        { $set: {
            name: incomingObj.name,
            permitNumbers: incomingObj.permitNumbers,
            status: incomingObj.status,
            commodities: incomingObj.commodities,
            region: incomingObj.region,
            location: incomingObj.location,
            permittee: incomingObj.permittee,
            type: incomingObj.type,
            summary: incomingObj.summary,
            description: incomingObj.description,
            links: incomingObj.links,
            tailingImpoundments: incomingObj.tailingImpoundments,
            dateUpdated: new Date(),
            // If there are args it means this is an API request and has a user. If not, this is carried out by the system so 
            // use the system user.
            updatedBy: args && args.swagger.params.auth_payload.displayName || SYSTEM_USER
          }
        },
        { new: true }
      );
    return {
      status: 'success',
      object: record
    };
  } catch (e) {
    return {
      status: 'failure',
      object: null,
      errorMessage: e.message
    };
  }
};
