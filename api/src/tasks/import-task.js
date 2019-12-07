'use strict';
const defaultLog = require('../utils/logger')('task');
var queryActions = require('../utils/query-actions');
var request = require('request');
let mongoose = require('mongoose');

exports.protectedOptions = async function(args, res, next) {
  res.status(200).send();
}

exports.protectedCreateTask = async function(args, res, next) {
  // Job has come in
  let scopes = args.swagger.params.auth_payload.realm_access.roles;
  defaultLog.info('scopes:', scopes);

  // Inspect payload

  // Determine data source
  var searchUrl = '';
  if (args.swagger.params.task && args.swagger.params.task.value.dataSource) {
    searchUrl = await getDataSourceUrl(args.swagger.params.task.value.dataSource);
  }
  if (!searchUrl) {
    return queryActions.sendResponse(res, 500, 'You must pass in a valid data source');
  }

  // Determine date to update from

  await setUpWorker();

  // Get the initial set of records since date: xxxx
  // We're going to possibly do one at a time, or a bunch with a set number of items per batch.
  await saveAudit();

  // // call endpoint, get records.
  // // Subtask: Update the logger with the payload size, start date, total record count in this batch, and the configuration object
  // // ie, the payload that came in on the original request, so that we might resume this job if the task fails for some reason.
  // getRecords(); // needs to be able to take in all jobs, and inside this function we'll split out the specific tasks of calling
  // // an HTTPS GET or a DB call via oracle, or some other thing.
  console.log('Getting record!!!');
  let records = await getRecords(searchUrl);
  if (records.length === 0) {
    return queryActions.sendResponse(res, 200, []);
  }
  console.log('Got Record!!!');

  // now that we have all the count/number of items we are going to process, process them!
  console.log('Processing record!!!');
  await processRecords(records);

  // emit to rocket.
  await saveAudit();

  return queryActions.sendResponse(res, 200);
};

let getDataSourceUrl = async function(dataSource) {
  switch (dataSource) {
    case 'epic':
      // Get all C&E
      // https://eagle-prod.pathfinder.gov.bc.ca/api/search?dataset=Document&or[milestone]=5cf00c03a266b7e1877504ef

      // Get all C&E Orders
      // https://eagle-prod.pathfinder.gov.bc.ca/api/search?dataset=Document&or[milestone]=5cf00c03a266b7e1877504ef&or[type]=5cf00c03a266b7e1877504d1

      // Get all C&E Inspections
      // https://eagle-prod.pathfinder.gov.bc.ca/api/search?dataset=Document&or[milestone]=5cf00c03a266b7e1877504ef&or[type]=5cf00c03a266b7e1877504d9

      return 'https://projects.eao.gov.bc.ca/api/public/search?dataset=Document&or[milestone]=5cf00c03a266b7e1877504ef&or[type]=5cf00c03a266b7e1877504d1';
    default:
      return '';
  }
};

let setUpWorker = async function(query, args) {
  return Promise.resolve();
};

let saveAudit = async function(query, args) {
  return Promise.resolve();
};

let getRecords = async function(searchUrl) {
  return new Promise(function(resolve, reject) {
    request({ url: searchUrl }, function(err, res, body) {
      if (err) {
        resolve([]);
      } else if (res.statusCode !== 200) {
        resolve([]);
      } else {
        var obj = {};
        try {
          obj = JSON.parse(body);
          console.log(obj[0].searchResults);
          resolve(obj[0].searchResults);
        } catch (e) {
          defaultLog.error('Parsing Failed.', e);
          resolve([]);
        }
      }
    });
  });
};

let processRecords = async function(records) {
  records.forEach(async record => {
    console.log('This is the record', record);
    let obj = {
      _schemaName: 'Record',
      documentEPICId: record._id,
      documentType: record.documentType,
      documentFileName: record.documentFileName,
      read: ['sysadmin'],
      write: ['sysadmin']
    };
    console.log('This is the object', obj);

    //     // Step 1:
    //     // Do we need to download any files?
    //     downloadFile(...);

    //     // Step 2:
    //     // Download the file, save to temp storage.
    //     saveToTemp(...);

    //     // Step 3: Upload file to S3
    //     uploadObject(..);

    // Step 4: Update the database with the new record, and optionally the location of the file blob in S3
    console.log('saving record!!!!');
    await saveRecordToNRPTI(obj);

    //     // Step 5: Update the audit log, saying we've processed this particular record.
    //     saveAuditStuff(...);
  });
  return;
};

let saveRecordToNRPTI = async function(obj) {
  var Record = mongoose.model('Record');
  var record = new Record(obj);
  console.log('attempting to save!!!!', record);
  return await record.save();
};
