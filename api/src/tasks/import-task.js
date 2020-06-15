'use strict';

const defaultLog = require('../utils/logger')('import-task');
const queryActions = require('../utils/query-actions');
const TaskAuditRecord = require('../utils/task-audit-record');
const { SYSTEM_USER } = require('../utils/constants/misc');

exports.protectedOptions = async function(args, res, next) {
  res.status(200).send();
};

exports.protectedCreateTask = async function(args, res, next) {
  // validate request parameters
  if (!args.swagger.params.task || !args.swagger.params.task.value) {
    throw Error('protectedCreateTask - missing required request body');
  }

  if (!args.swagger.params.task.value.dataSourceType) {
    throw Error('protectedCreateTask - missing required dataSourceType');
  }

  const nrptiDataSource = getDataSourceConfig(args.swagger.params.task.value.dataSourceType);

  if (!nrptiDataSource) {
    throw Error(
      `protectedCreateTask - could not find nrptiDataSource for dataSourceType: ${args.swagger.params.task.value.dataSourceType}`
    );
  }

  // run data source record updates
  runTask(
    nrptiDataSource,
    args.swagger.params.auth_payload,
    args.swagger.params.task.value.params,
    args.swagger.params.task.value.recordTypes
  );

  // send response immediately as the tasks will run in the background
  return queryActions.sendResponse(res, 200);
};

// Used to quickly run a task within the API runtime.
exports.createTask = async function(dataSourceType) {
  const nrptiDataSource = getDataSourceConfig(dataSourceType);

  if (!nrptiDataSource) {
    throw Error(
      `createTask - could not find nrptiDataSource for dataSourceType: ${dataSourceType}`
    );
  }

  // run data source record updates
  await runTask(
    nrptiDataSource,
    {
      displayName: SYSTEM_USER
    },
    null, // TODO: We're not using this param anywhere in the import logic framework, setting to null
    null  // TODO: We're not using this param anywhere in the import logic framework, setting to null
  );
};

/**
 * Runs an update for a single nrpti data source.
 *
 * @param {*} nrptiDataSource object containing the nrpti data source and additional config
 * @param {*} auth_payload user information for auditing
 * @param {*} [params=null] additional filter parameters to use when fetching records from the data source (optional)
 * @param {*} [recordType=null] specific record types to update (optional)
 */
async function runTask(nrptiDataSource, auth_payload, params = null, recordTypes = null) {
  const taskAuditRecord = new TaskAuditRecord();

  try {
    defaultLog.info(`runTask - ${nrptiDataSource.dataSourceLabel} - started`);

    await taskAuditRecord.updateTaskRecord({ dataSourceLabel: nrptiDataSource.dataSourceLabel, startDate: new Date() });

    const dataSource = new nrptiDataSource.dataSourceClass(
      taskAuditRecord,
      auth_payload,
      params,
      recordTypes
    );

    if (!dataSource) {
      throw Error(`runTask - ${nrptiDataSource.dataSourceLabel} - failed - could not create instance of dataSource`);
    }

    // Run the datasource loop, passing in the audit object.
    const res = await dataSource.run(taskAuditRecord);

    defaultLog.info(`runTask - ${nrptiDataSource.dataSourceLabel} - completed`);

    // Update task as completed (does not necessarily mean all records were successfully updated)
    await taskAuditRecord.updateTaskRecord({ status: 'completed', finishDate: new Date(), ...res });
  } catch (error) {
    defaultLog.error(
      `runTask - ${nrptiDataSource.dataSourceLabel} - ${error.status} - unexpected error: ${error.message}`
    );

    // Update task as encountering unexpected error
    await taskAuditRecord.updateTaskRecord({ status: 'Error', finishDate: new Date() });
  }
}

/**
 * Get a supported data source config.
 *
 * @param {string} dataSourceType a data source type string
 * @returns data source config, or null if the provided data source type is not supported.
 */
function getDataSourceConfig(dataSourceType) {
  if (!dataSourceType) {
    return null;
  }

  // dataSourceType will match the name of a directory for the given
  // integration in /src/integrations/<dataSourceType>/
  return {
    dataSourceLabel: dataSourceType,
    dataSourceClass: require(`../integrations/${dataSourceType}/datasource`)
  };
}
