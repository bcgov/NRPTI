'use strict';

const defaultLog = require('../utils/logger')('import-task');
const queryActions = require('../utils/query-actions');
const TaskAuditRecord = require('../utils/task-audit-record');
const INTEGRATION_DATASOURCE = require('../integrations/integration-datasource-enum');

exports.protectedOptions = async function(args, res, next) {
  res.status(200).send();
};

exports.protectedCreateTask = async function(args, res, next) {
  const scopes = args.swagger.params.auth_payload.realm_access.roles;
  defaultLog.debug('scopes:', scopes);

  // validate request parameters
  if (!args.swagger.params.task || !args.swagger.params.task.value) {
    throw Error('protectedCreateTask - missing required request body');
  }

  if (!args.swagger.params.task.value.dataSourceType) {
    throw Error('protectedCreateTask - missing required dataSourceType');
  }

  const nrptiDataSource = INTEGRATION_DATASOURCE[args.swagger.params.task.value.dataSourceType];

  if (!nrptiDataSource) {
    throw Error(
      `protectedCreateTask - could not find nrptiDataSource for dataSourceType: ${args.swagger.params.task.value.dataSourceType}`
    );
  }

  // run data source record updates
  runTask(nrptiDataSource, args.swagger.params.task.value.params, args.swagger.params.auth_payload);

  // send response immediately as the tasks will run in the background
  return queryActions.sendResponse(res, 200);
};

/**
 * Runs an update for a single nrpti data source.
 *
 * @param {INTEGRATION_DATASOURCE} nrptiDataSource nrpti data source
 * @param {*} params additional filter parameters to use when fetching records from the data source.
 * @param {*} auth_payload user information for auditing
 */
async function runTask(nrptiDataSource, params, auth_payload) {
  const taskAuditRecord = new TaskAuditRecord();

  try {
    taskAuditRecord.updateTaskRecord({ dataSourceLabel: nrptiDataSource.dataSourceLabel, startDate: new Date() });

    const status = await nrptiDataSource.getDataSource(params, auth_payload).updateRecords();

    defaultLog.info(`runTask - completed: ${JSON.stringify(status)}`);

    // Update task as completed (does not necessarily mean all records were successfully updated)
    await taskAuditRecord.updateTaskRecord({ status: 'Completed', finishDate: new Date(), ...status });
  } catch (error) {
    defaultLog.error(`runTask - unexpected error: ${error.message}`);
    defaultLog.debug(`runTask - unexpected error - error.stack: ${error.stack}`);

    // Update task as encountering unexpected error
    await taskAuditRecord.updateTaskRecord({ status: 'Error', finishDate: new Date() });
  }
}
