'use strict';
const defaultLog = require('../utils/logger')('task');
let queryActions = require('../utils/query-actions');
let axios = require('axios');
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
  let searchUrl = '';
  if (args.swagger.params.task && args.swagger.params.task.value.dataSource) {
    searchUrl = await getDataSourceUrl(args.swagger.params.task.value.dataSource);
  }
  if (!searchUrl) {
    return queryActions.sendResponse(res, 500, 'You must pass in a valid data source');
  }

  let jobDetails = {
    dataSource: searchUrl,
    dataSourceLabel: args.swagger.params.task.value.dataSource,
    startDate: new Date(),
    read: ['sysadmin'],
    write: ['sysadmin']
  };
  jobDetails = await updateAudit(jobDetails);

  console.log("Job:", jobDetails);

  // Determine date to update from
  await setUpWorker();

  // Get the initial set of records since date: xxxx
  // We're going to possibly do one at a time, or a bunch with a set number of items per batch.

  // // call endpoint, get records.
  // // Subtask: Update the logger with the payload size, start date, total record count in this batch, and the configuration object
  // // ie, the payload that came in on the original request, so that we might resume this job if the task fails for some reason.
  // getRecords(); // needs to be able to take in all jobs, and inside this function we'll split out the specific tasks of calling
  // // an HTTPS GET or a DB call via oracle, or some other thing.
  console.log('Getting records...', searchUrl);
  let records = await getRecords(searchUrl);
  if (!records) {
    // err
    return await updateAudit({_id: mongoose.Types.ObjectId(jobDetails._id), status: 'Error', finishDate: new Date()});
  } else if (records.length === 0) {
    console.log('No records found');
    await updateAudit({_id: mongoose.Types.ObjectId(jobDetails._id), status: 'Completed', finishDate: new Date()});
    return queryActions.sendResponse(res, 200, []);
  } else {
    console.log('Got Records:', records.length);
    jobDetails = await updateAudit({_id: mongoose.Types.ObjectId(jobDetails._id), itemTotal: records.length});
  }

  // now that we have all the count/number of items we are going to process, process them!
  console.log('Processing records [' + jobDetails._id + ']...');
  await processRecords(records, jobDetails._id);

  // emit to rocket.
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

      return "https://eagle-prod.pathfinder.gov.bc.ca/api/public/search?dataset=Document&or[milestone]=5cf00c03a266b7e1877504ef&or[type]=5cf00c03a266b7e1877504d1";
    default:
      return '';
  }
};

let setUpWorker = async function(query, args) {
  return Promise.resolve();
};

let updateAudit = async function(job) {
  let TaskRecord = mongoose.model('Task');

  if (job._id) {
    // Update
    return TaskRecord.findOneAndUpdate({ _id: mongoose.Types.ObjectId(job._id) }, { $set: job }, { new : true });
  } else {
    // New
    return TaskRecord.create(job);
  }
};

let getRecords = async function(searchUrl) {
  try {
    const response = await axios.get(searchUrl);
    const data = response.data[0].searchResults;
    console.log(data);
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

let processRecords = async function(records, jobID) {
  let TaskRecord = mongoose.model('Task');

  await TaskRecord.updateOne({ _id: mongoose.Types.ObjectId(jobID) }, { $set: { status: 'Running' } });

  for (const record of records) {
    // console.log('This is the record', record);
    let obj = {
      _schemaName: 'Record',
      documentEPICId: record._id,
      documentType: record.documentType,
      documentFileName: record.documentFileName,
      read: ['sysadmin'],
      write: ['sysadmin']
    };
    // console.log('This is the object', obj);

    //     // Step 1:
    //     // Do we need to download any files?
    //     downloadFile(...);

    //     // Step 2:
    //     // Download the file, save to temp storage.
    //     saveToTemp(...);

    //     // Step 3: Upload file to S3
    //     uploadObject(..);

    // Step 4: Update the database with the new record, and optionally the location of the file blob in S3
    console.log('saving record.', record._id);
    await saveRecordToNRPTI(obj);

    // await sleep(1000);

    // Step 5: Update the audit log, saying we've processed this particular record.
    await TaskRecord.updateOne({ _id: mongoose.Types.ObjectId(jobID) }, { $inc: { itemsProcessed: 1 } });
  };

  // We're all done:
  return await TaskRecord.updateOne({ _id: mongoose.Types.ObjectId(jobID) }, { $set: { status: 'Complete', finishDate: new Date() } });
};

// const sleep = (milliseconds) => {
//   return new Promise(resolve => setTimeout(resolve, milliseconds))
// }


let saveRecordToNRPTI = async function(obj) {
  let Record = mongoose.model('Record');
  let rec = new Record(obj);
  console.log('attempting to save: ', rec);
  return await rec.save();
};
