const mongoose = require('mongoose');
const { userInRole } = require('../../utils/auth-utils');
const { ROLES } = require('../../utils/constants/misc');

exports.createRecord = async function(args, res, next, incomingObj) {
  try {
    // Confirm user has correct role.
    if (!userInRole(ROLES.ADMIN_ROLES, args.swagger.params.auth_payload.realm_access.roles)) {
      throw new Error('Missing valid user role.');
    }
    
    const Model = mongoose.model(incomingObj._schemaName);

    // TODO: Something special for NRCED/BCMI?
    if (incomingObj._schemaName === 'ActivityLNG') {
      const newsItemObject = {...incomingObj};
      newsItemObject.read = ['sysadmin', 'public'];
      newsItemObject.write = ['sysadmin'];
  
      let newsItem = new Model({
        _schemaName: incomingObj._schemaName,
        read: ['sysadmin', 'public'],
        write: ['sysadmin'],
        title: incomingObj.title,
        type: incomingObj.type,
        description: incomingObj.description,
        url: incomingObj.url,
        date: incomingObj.date,
        projectName: incomingObj.projectName,
        _epicProjectId: incomingObj._epicProjectId,
      });

      let record = await newsItem.save();
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