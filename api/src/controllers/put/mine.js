const mongoose = require('mongoose');
const PutUtils = require('../../utils/put-utils');
const { userInRole } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

const SYSTEM_USER = 'SYSTEM_USER';

/**
 * Performs all operations necessary to edit a master Mine record and any flavours.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj
 * @returns object containing the operation's status and created records
 */
exports.editRecord = async function(args, res, next, incomingObj) {
  try{
    // TODO: Add any flavour actions here.

    const savedInspection = await this.editMaster(args, res, next, incomingObj);

    return {
      status: 'success',
      object: savedInspection
    };
  } catch (error) {
    return {
      status: 'failure',
      object: null,
      errorMessage: error.message
    };
  }
}

/**
 * Performs all operations necessary to edit a master Mine record.
 *
 * @param {*} args
 * @param {*} res
 * @param {*} next
 * @param {*} incomingObj
 * @returns newly created mine record
 */
exports.editMaster = async function(args, res, next, incomingObj) {
  // Confirm user has correct role.
  if (!userInRole(ROLES.ADMIN_ROLES, args.swagger.params.auth_payload.realm_access.roles)) {
    throw new Error('Missing valid user role.');
  }  
  
  if (incomingObj._schemaName !== 'Mine') {
    throw new Error('editRecord - incorrect schema type, must be Mine');
  }

  const Mine = mongoose.model('Mine');

  const sanitizedObj = PutUtils.validateObjectAgainstModel(Mine, incomingObj);

  if (!sanitizedObj || sanitizedObj === {}) {
    // skip, as there are no changes to master record
    return;
  }

  sanitizedObj.dateUpdated = new Date();
  // If there are args it means this is an API request and has a user. If not, this is carried out by the system so 
  // use the system user.
  sanitizedObj.updatedBy =  args && args.swagger.params.auth_payload.displayName || SYSTEM_USER;

  const dotNotatedObj = PutUtils.getDotNotation(sanitizedObj);

  return await Mine.findOneAndUpdate(
      { _schemaName: 'Mine', _id: incomingObj._id },
      { $set: dotNotatedObj },
      { new: true }
    );
};
