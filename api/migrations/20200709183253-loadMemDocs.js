'use strict';

const ObjectID = require('mongodb').ObjectID;
const Document = require('../src/models/document');
const utils = require('../src/utils/constants/misc');
// master and BCMI flavour types
const { permitBCMI: PermitBCMI,
  orderBCMI: OrderBCMI,
  inspectionBCMI: InspectionBCMI,
  annualReportBCMI: AnnualReportBCMI,
  damSafetyInspectionBCMI: DamSafetyInspectionBCMI,
  managementPlanBCMI: ManagementPlanBCMI,
  correspondenceBCMI: CorrespondenceBCMI,
  collectionBCMI: CollectionBCMI } = require('../src/models/bcmi/index');
const { managementPlan: ManagementPlan,
  damSafetyInspection: DamSafetyInspection,
  annualReport: AnnualReport,
  inspection: Inspection,
  order: Order,
  permit: Permit,
  correspondence: Correspondence } = require('../src/models/master/index');

const AWS = require('aws-sdk');

const OBJ_STORE_URL = process.env.OBJECT_STORE_endpoint_url || 'nrs.objectstore.gov.bc.ca';
const OBJ_STORE_BUCKET = process.env.OBJECT_STORE_bucket_name || 'test';
const ep = new AWS.Endpoint(OBJ_STORE_URL);
const s3 = new AWS.S3({
  endpoint: ep,
  accessKeyId: process.env.OBJECT_STORE_user_account,
  secretAccessKey: process.env.OBJECT_STORE_password,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

const MINIO_URL = process.env.MEM_MINIO_endpoint_url || 'minio-mem-prod-mem-mmt-prod.pathfinder.gov.bc.ca';
const MINIO_BUCKET = process.env.MEM_MINIO_bucket_name;
const minioEndpoint = new AWS.Endpoint(MINIO_URL);
const minio = new AWS.S3({
  endpoint: minioEndpoint,
  accessKeyId: process.env.MEM_MINIO_user_account,
  secretAccessKey: process.env.MEM_MINIO_password,
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

let dbm;
let type;
let seed;

const https = require('https');
const { ObjectId } = require('mongoose');
const bcmiUrl = 'https://mines.empr.gov.bc.ca'; // prod mem-admin api url

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  if (!process.env.MEM_MINIO_user_account || !process.env.MEM_MINIO_password || !MINIO_URL || !MINIO_BUCKET) {
    console.log('*****************************************************************************');
    console.log('** Minio connection environment variables not set - termninating migration **');
    console.log('*****************************************************************************');

    throw new Error(`Minio connection environment variables are not set`);
  }

  console.log('****************************************');
  console.log('** Starting mem-admin collection load **');
  console.log('****************************************');

  let docsCreated = 0;
  let docsExisting = 0;
  let collectionsCreated = 0;
  let collectionsExisting = 0;
  let errors = 0;
  let documentErrorLog = "";
  let collectionErrorLog = "";
  let documentErrorCount = 0;
  let mineErrorLog = "";
  let mineErrorCount = 0;

  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  try {
    // API call to pull data from BCMI
    console.log('Fetching all major mines in BCMI...');
    const publishedMines = await getRequest(bcmiUrl + '/api/projects/published');
    console.log('Located ' + publishedMines.length + ' mines. Fetching Collections and Docs for import to NRPTI...');

    for (const publishedMine of publishedMines) {
      try {
        console.log(`Loading ${publishedMine.code} collections...`);
        const collections = await getRequest(bcmiUrl + '/api/collections/project/' + publishedMine.code);
        // add the collection to the mine
        publishedMine.collectionData = collections;
      } catch (err) {
        console.error('Could not find ' + publishedMine._id + ' : ' + publishedMine.name);
        console.error(err);
        // dont rethrow, we'll just ignore this one as a failure and check the rest
        errors += 1;
      }
    }
    console.log(`Collections loaded from mem-admin!`);

    // Now that we have all the docs, we need to create records for each one in NRPTI
    // then, follow that up by pulling the doc from mem-admin, and pushing it up to nrpti's s3
    const nrpti = await mClient.collection('nrpti');

    for (const mine of publishedMines) {
      // find the mine in nrpti by permit ID
      let nrptiMine
      console.log(`Processing mine ${mine.memPermitID}`);
      if (mine.memPermitID === 'C-3' && mine.name === 'Fording River Operations') {
        console.log('Found Fording River Operations, using C-102 as permit number')
        nrptiMine = await nrpti.findOne({ _schemaName: 'MineBCMI', permitNumber: 'C-102' })
      } else {
        nrptiMine = await nrpti.findOne({ _schemaName: 'MineBCMI', permitNumber: mine.memPermitID })
      }
      if (nrptiMine) {
        // Found a mine, now lets create a record and upload up the docs
        console.log(`Current mine is ${nrptiMine.name},   id: ${nrptiMine._id}`);
        for (const collection of mine.collectionData) {
          console.log(`Processing collection ${collection.displayName}`);
          if (!collection.displayName) {
            console.log(`Collection missing displayName: ${JSON.stringify(collection)}`)
          }
          let bcmiCollection = null;
          const allNewDocs = [];
          // need to use project id as well due to identical collection names in different projects
          const existingCollection = await nrpti.findOne({ _schemaName: "CollectionBCMI", name: collection.displayName, project: nrptiMine._id });
          if (!existingCollection) {
            console.log(`Creating NRPTI collection for ${collection.displayName}`);
            // init the collection so we can pass an id
            bcmiCollection = new CollectionBCMI();
            // Master, Meta and Documents for this collection are all created.
            // Now, create a NRPTI collection and shove the docs into it!
            bcmiCollection.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI, 'public'];
            bcmiCollection.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
            bcmiCollection.name = collection.displayName;
            bcmiCollection.date = collection.date;
            bcmiCollection.project = new ObjectID(nrptiMine._id);
            bcmiCollection.type = collection.type;
            bcmiCollection.agency = collection.isForMEM ? 'EMPR' : collection.isForEAO ? 'EAO' : 'ENV';
            bcmiCollection.records = allNewDocs; // move this whole thing to the top if we remove records array
            bcmiCollection.addedBy = 'mem-admin';
            bcmiCollection.sourceSystemRef = 'mem-admin';
            bcmiCollection.datePublished = collection.date;
            bcmiCollection.publishedBy = 'mem-admin';
            try {
              const newCollection = await nrpti.insertOne(bcmiCollection);
              if (newCollection) {
                console.log('Collection created successfully')
              } else {
                throw Error('Collection failed to create: ', JSON.stringify(bcmiCollection))
              }
            } catch (err) {
              console.log(err)
            }
            collectionsCreated += 1;
          } else {
            bcmiCollection = existingCollection;
            collectionsExisting += 1;
          }

          // prep the docs
          const allDocs = collection.mainDocuments.concat(collection.otherDocuments);

          // console.log(`Fetched ${allDocs.length} documents. Creating NRPTI records/flavours...`);
          for (const collectionDoc of allDocs) {
            let existingDoc = null;
            if (!collectionDoc.document && !collectionDoc.hasOwnProperty('displayName')) {
              console.log(`missing displayName: ${JSON.stringify(collectionDoc)}`)
            } else {
              // check for isBcmiPublished flag to ensure we get the flavour record
              existingDoc = await nrpti.findOne({ mineGuid: nrptiMine._sourceRefId, recordName: collectionDoc.document.displayName, isBcmiPublished: null });
            }
            if (!existingDoc) {
              console.log('Creating new document')
              if (collection.type && collection.type.length > 0 && !collection.isForEAO) {
                try {
                  const newDoc = await createMineDocument(nrpti, nrptiMine, collection, collectionDoc, bcmiCollection._id);
                  if (newDoc) {
                    allNewDocs.push(new ObjectID(newDoc._id));
                    docsCreated += 1;
                  } else {
                    throw Error('No document generated?');
                  }
                } catch (err) {

                  let mineInfo = (nrptiMine._id ? nrptiMine._id : "Couldn't find mine id") + ", " + (nrptiMine.name ? nrptiMine.name : "Couldn't find mine name");
                  let collectionInfo = (collection._id ? collection._id : "Couldn't find collection id") + ", " + (collection.displayName ? collection.displayName : "Couldn't find collection name");
                  let documentInfo = (collectionDoc.document ? (collectionDoc.document._id ? collectionDoc.document._id : "Couldn't find document id") : "Couldn't find document")
                    + ", " + (collectionDoc.document ? (collectionDoc.document.displayName ? collectionDoc.document.displayName : "Couldn't find document display name") : "Couldn't find document");

                  let thisErrorLog = `\n#######################################`;
                  thisErrorLog += `\n## An Error Occured While Creating a Document:`;
                  thisErrorLog += `\n## NRPTI Mine: ` + mineInfo;
                  thisErrorLog += `\n## EMPR Collection: ` + collectionInfo;
                  thisErrorLog += `\n## EMPR Document: ` + documentInfo;
                  thisErrorLog += `\n#######################################`;

                  documentErrorCount += 1;
                  documentErrorLog += thisErrorLog;

                  console.error(thisErrorLog);
                  console.error(err);
                  console.error('#######################################\n');
                  errors += 1;
                }
              }
            } else {
              // check doc has valid collection
              if (existingDoc.collectionId.toString() !== bcmiCollection._id.toString()) {
                console.log(`Found record ${existingDoc._id} with a bad collection id ${existingDoc.collectionId}, adding to proper collection: ${bcmiCollection._id}`)

                existingDoc.collectionId = bcmiCollection._id;
                await nrpti.findOneAndUpdate({ _id: existingDoc._id }, existingDoc);
                // duplicate record prevention
                const arrayIncludes = bcmiCollection.records.some(item => item.toString() === existingDoc._id.toString());
                if (!arrayIncludes) {
                  console.log(`Adding doc ${existingDoc._id} to docsArray of ${bcmiCollection._id}`);
                  allNewDocs.push(existingDoc._id);
                }
              }
              docsExisting += 1;
              // Ensure that records only exist in the proper collection for their mine
              const collectionsToFix = await nrpti.find({records: { $in: [ existingDoc._id ]}});
              collectionsToFix.forEach( async (coll) => {
                if (coll.project.toString() !== nrptiMine._id.toString()) {
                  console.log(`Found a collection that constains records from another mine: ${coll._id}, existingRec: ${existingDoc._id}`)
                  // remove record from a collection that is not actually part of this mine
                  const filteredRecords = coll.records.filter((rec) => rec.toString() !== existingDoc._id.toString())
                  if (filteredRecords) {
                    coll.records = filteredRecords;
                    await nrpti.findOneAndUpdate({ _id: coll._id }, coll);
                  }
                }
              });
            }
          }
          if (allNewDocs.length) {
            bcmiCollection.records = bcmiCollection.records.concat(allNewDocs);
            await nrpti.findOneAndUpdate({ _schemaName: "CollectionBCMI", name: collection.displayName, project: nrptiMine._id  }, bcmiCollection)
          }
        }
      } else {

        let thisErrorLog = `\n#######################################`;
        thisErrorLog += `\n## An error occured while loading a mine:`;
        thisErrorLog += `\n## EMPR Mine: ` + mine.name;
        thisErrorLog += `\n## EMPR Permit ID: ` + mine.memPermitID;
        thisErrorLog += `\n#######################################`;

        mineErrorLog += thisErrorLog;
        mineErrorCount += 1;

        console.error(thisErrorLog);
        errors += 1;
      }
    }
  } catch (err) {
    console.error('#######################################');
    console.error('## An error occured while loading docs!');
    console.error(err);
    console.error('#######################################');
    errors += 1;
  }

  console.log(`\nThe following documents did not come through correctly, and require human attention: `);
  console.log(documentErrorLog);
  console.log(`\nThere were ` + documentErrorCount + ` documents that need attention.\n`);

  console.log(`\nThe following mines could not be found in NRPTI: `);
  console.log(mineErrorLog);
  console.log(`\nThere were ` + mineErrorCount + ` that couldn't be found.\n`);

  console.log(`Process complete with ${docsCreated} records created, ${collectionsCreated} collections created, and ${errors} errors.`);
  console.log(`Process found ${docsExisting} existing documents, ${collectionsExisting} existing collections already created in NRPTI`);

  console.log('****************************************');
  console.log('** Finished mem-admin collection load **');
  console.log('****************************************');

  mClient.close();
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function createMineDocument(nrpti, nrptiMine, collection, collectionDoc, newCollectionId) {
  // fetch doc from mem-admin Minio
  // minioObject contains de-serialized data returned from the getObject request.  Body field contains the data buffer
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#getObject-property
  const minioObject = await minio.getObject({
    Bucket: MINIO_BUCKET,
    Key: collectionDoc.document.internalURL
  }).promise();

  // create a document meta
  let document = new Document();

  const s3Key = `${document._id}/${collectionDoc.document.displayName}`;

  document.fileName = collectionDoc.document.displayName;
  document.addedBy = 'BCMI Mine Doc Import';
  document.url = `https://${OBJ_STORE_URL}/${OBJ_STORE_BUCKET}/${document._id}/${collectionDoc.document.displayName}`;
  document.key = s3Key;
  document.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  document.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // upload to s3
  await s3.upload({
    Bucket: OBJ_STORE_BUCKET,
    Key: s3Key,
    Body: minioObject.Body,
    ACL: 'authenticated-read'
  }).promise()

  // save the document meta
  await nrpti.insertOne(document);

  // now, create the master/flavour
  let masterData;
  let flavourData;

  if (collection.type === 'Order') {
    masterData = new Order();
    flavourData = new OrderBCMI();
    masterData.recordType = 'Order';
    flavourData.recordType = 'Order';
  } else if (collection.type === 'Permit') {
    masterData = new Permit();
    flavourData = new PermitBCMI();
    masterData.recordType = 'Permit';
    flavourData.recordType = 'Permit';
    masterData.typeCode = 'OGC';
    flavourData.typeCode = 'OGC';
  } else if (collection.type === 'Permit Amendment') {
    masterData = new Permit();
    flavourData = new PermitBCMI();
    masterData.recordType = 'Permit';
    flavourData.recordType = 'Permit';
    masterData.typeCode = 'AMD';
    flavourData.typeCode = 'AMD';
  } else if (collection.type === 'Inspection Report') {
    masterData = new Inspection();
    flavourData = new InspectionBCMI();
    masterData.recordType = 'Inspection';
    flavourData.recordType = 'Inspection';
  } else if (collection.type === 'Annual Report') {
    masterData = new AnnualReport();
    flavourData = new AnnualReportBCMI();
    masterData.recordType = 'Annual Report';
    flavourData.recordType = 'Annual Report';
  } else if (collection.type === 'Dam Safety Inspection') {
    masterData = new DamSafetyInspection();
    flavourData = new DamSafetyInspectionBCMI();
    masterData.recordType = 'Dam Safety Inspection';
    flavourData.recordType = 'Dam Safety Inspection';
  } else if (collection.type === 'Management Plan') {
    masterData = new ManagementPlan();
    flavourData = new ManagementPlanBCMI();
    masterData.recordType = 'Management Plan';
    flavourData.recordType = 'Management Plan';
  } else if (collection.type === 'Letter of Assurance') {
    masterData = new Correspondence();
    flavourData = new CorrespondenceBCMI();
    masterData.recordType = 'Correspondence';
    flavourData.recordType = 'Correspondence';
  } else {
    throw new Error(`Collection type of ${collection.type} could not be mapped to a valid type in NRPTI`);
  }

  const issuingAgency = collection.isForMEM ? 'EMPR' : collection.isForEAO ? 'EAO' : 'ENV';

  // BCMI flavour
  flavourData.documents = [document._id];
  flavourData._master = new ObjectID(masterData._id);
  flavourData.collectionId = new ObjectID(newCollectionId);
  flavourData.mineGuid = nrptiMine._sourceRefId;
  flavourData.issuingAgency = issuingAgency;
  flavourData.author = collectionDoc.document.documentAuthor;
  flavourData.recordName = collectionDoc.document.displayName;
  flavourData.description = collectionDoc.document.description;
  try {
    flavourData.dateIssued = new Date(collectionDoc.document.documentDate);
  } catch (e) {
    // Skip
    console.log("Error setting dateIssued:", e);
  }
  flavourData.sourceDateAdded = collectionDoc.document.dateAdded;
  flavourData.sourceDateUpdated = collectionDoc.document.dateUpdated;
  flavourData.sourceSystemRef = 'mem-admin';
  flavourData.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  flavourData.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  await nrpti.insertOne(flavourData);

  // Master
  masterData._flavourRecords = [new ObjectID(flavourData._id)];
  masterData.documents = [document._id];
  masterData.collectionId = new ObjectID(newCollectionId);
  masterData.mineGuid = nrptiMine._sourceRefId;
  masterData.issuingAgency = issuingAgency;
  masterData.author = collectionDoc.document.documentAuthor;
  masterData.recordName = collectionDoc.document.displayName
  masterData.description = collectionDoc.document.description;
  try {
    masterData.dateIssued = new Date(collectionDoc.document.documentDate);
  } catch (e) {
    // Skip
    console.log("Error setting dateIssued:", e);
  }
  masterData.isBcmiPublished = true;
  if (Object.prototype.hasOwnProperty.call(flavourData, 'isNrcedPublished')) masterData.isNrcedPublished = false;
  if (Object.prototype.hasOwnProperty.call(flavourData, 'isLngPublished')) masterData.isLngPublished = false;
  masterData.sourceDateAdded = collectionDoc.document.dateAdded;
  masterData.sourceDateUpdated = collectionDoc.document.dateUpdated;
  masterData.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  masterData.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  masterData.sourceSystemRef = 'mem-admin';

  await nrpti.insertOne(masterData);

  // We now store flavour records in the collection records array.
  return flavourData;
}

function getRequest(url, asJson = true) {
  return new Promise(function (resolve, reject) {
    let req = https.get(url, function (res) {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error(`statusCode=${res.statusCode} url=${url}`));
      }
      let body = [];
      res.on('data', function (chunk) {
        body.push(chunk);
      });
      res.on('end', function () {
        try {
          body = Buffer.concat(body);
          // If request is expecting JSON response then convert the bugger to JSON.
          if (asJson) {
            body = JSON.parse(body.toString());
          }
        } catch (e) {
          reject(e);
        }
        resolve(body);
      });
    });

    req.on('error', function (err) {
      reject(err);
    });

    req.end();
  });
}

// After a while, mem-admin will get very upset with the rapid document fetches
// so as a protective measure, we need to let things settle after grabbing a document
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
