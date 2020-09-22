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
        correspondence: Correspondence }  = require('../src/models/master/index');

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

let dbm;
let type;
let seed;

const https = require('https');
const bcmiUrl = 'https://mines.empr.gov.bc.ca'; // prod mem-admin api url

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  console.log('****************************************');
  console.log('** Starting mem-admin collection load **');
  console.log('****************************************');

  let docsCreated = 0;
  let docsExisting = 0;
  let collectionsCreated = 0;
  let collectionsExisting = 0;
  let errors = 0;

  const mClient = await db.connection.connect(db.connectionString, { native_parser: true });
  try {
    // API call to pull data from BCMI
    console.log('Fetching all major mines in BCMI...');
    const publishedMines = await getRequest(bcmiUrl + '/api/projects/published');
    console.log('Located ' + publishedMines.length + ' mines. Fetching Collections and Docs for import to NRPTI...');

    for(const publishedMine of publishedMines) {
      try {
        console.log(`Loading ${publishedMine.code} collections...`);
        const collections = await getRequest(bcmiUrl + '/api/collections/project/' + publishedMine.code);
        // add the collection to the mine
        publishedMine.collectionData = collections;
      } catch(err) {
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

    for(const mine of publishedMines) {
      // find the mine in nrpti by permit ID
      let nrptiMine
      console.log(`Processing mine ${mine.memPermitID}`);
      if (mine.memPermitID === 'C-3' && mine.name === 'Fording River Operations') {
        console.log('Found Fording River Operations, using C-102 as permit number')
        nrptiMine = await nrpti.findOne({ _schemaName: 'MineBCMI', permitNumber: 'C-102'})
      } else {
        nrptiMine = await nrpti.findOne({ _schemaName: 'MineBCMI', permitNumber: mine.memPermitID })
      }
      if (nrptiMine) {
        // Found a mine, now lets create a record and upload up the docs
        for(const collection of mine.collectionData) {
          console.log(`Processing collection ${collection.displayName}`);
          // init the collection so we can pass an id
          let bcmiCollection = new CollectionBCMI();
          // prep the docs
          const allDocs = collection.mainDocuments.concat(collection.otherDocuments);
          const allNewDocs = [];
          console.log(`Fetched ${allDocs.length} documents. Creating NRPTI records/flavours...`);
          for(const collectionDoc of allDocs) {
            let existingDoc;
            if (!collectionDoc.document && !collectionDoc.hasOwnProperty('displayName')) {
              console.log(`missing displayName: ${JSON.stringify(collectionDoc)}`)
            } else {
              existingDoc = await nrpti.findOne({ mineGuid: nrptiMine._sourceRefId, recordName: collectionDoc.document.displayName });
            }
            if (!existingDoc) {
              if (collection.type && collection.type.length > 0 && !collection.isForEAO) {
                try {
                  const newDoc = await createMineDocument(nrpti, nrptiMine, collection, collectionDoc, bcmiCollection._id);
                  if (newDoc) {
                    allNewDocs.push(new ObjectID(newDoc._id));
                    docsCreated += 1;
                  } else {
                    throw Error('No document generated?');
                  }
                } catch(err) {
                  console.error('#######################################');
                  console.error(`## An error occured while creating the doc`);
                  console.error(err);
                  console.error('#######################################');
                  errors += 1;
                }
              }
            } else {
              docsExisting += 1;
            }
          }
          const existingCollection  = await nrpti.findOne({ _schemaName: "CollectionBCMI", name: collection.displayName });
          if (!existingCollection) {
            console.log(`Creating NRPTI collection for ${collection.displayName}`);
            // Master, Meta and Documents for this collection are all created.
            // Now, create a NRPTI collection and shove the docs into it!
            bcmiCollection._master = new ObjectID(nrptiMine._id);
            bcmiCollection.read =  [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI, 'public'];
            bcmiCollection.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
            bcmiCollection.name = collection.displayName;
            bcmiCollection.date = collection.date;
            bcmiCollection.project = new ObjectID(nrptiMine._id);
            bcmiCollection.type = collection.type;
            bcmiCollection.agency = collection.isForMEM ? 'EMPR' : collection.isForEAO ? 'EAO' : 'ENV';
            bcmiCollection.records = allNewDocs; // move this whole thing to the top if we remove records array
            bcmiCollection.addedBy = 'nrpti';
            bcmiCollection.datePublished = collection.date;
            bcmiCollection.publishedBy = 'nrpti';
            bcmiCollection.isBcmiPublished = true;
            await nrpti.insertOne(bcmiCollection);

            collectionsCreated += 1;
          } else {
            if (allNewDocs.length) {
              existingCollection.records.concat(allNewDocs);
              await nrpti.findOneAndUpdate({ _schemaName: "CollectionBCMI", name: collection.displayName }, existingCollection)
              console.log(`Update existing collection ${existingCollection.name} with new documents`)
            }
            collectionsExisting += 1;
          }
        }
      } else {
        console.error('#######################################');
        console.error('## An error occured while loading the mine!');
        console.error(`Could not locate mine for ${mine.name} : ${mine.memPermitID}`);
        console.error('#######################################');
        errors += 1;
      }
    }
  } catch(err) {
    console.error('#######################################');
    console.error('## An error occured while loading docs!');
    console.error(err);
    console.error('#######################################');
    errors += 1;
  }

  console.log(`Process complete with ${docsCreated} records created, ${collectionsCreated} collections created, and ${errors} errors.`);
  console.log(`Process found ${docsExisting} existing documents, ${collectionsExisting} existing collections already created in NRPTI`);
  console.log('****************************************');
  console.log('** Finished mem-admin collection load **');
  console.log('****************************************');

  mClient.close();
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};

async function createMineDocument(nrpti, nrptiMine, collection, collectionDoc, newCollectionId) {
  // fetch doc from mem-admin
  // rawDoc will be a buffer from the get request.
  await sleep(1000);
  const rawDoc = await getRequest(bcmiUrl + '/api/document/' + collectionDoc.document._id + '/fetch', false);
  // create a document meta
  let document = new Document();

  const s3Key = `${document._id}/${collectionDoc.document.displayName}`;

  document.fileName = collectionDoc.document.displayName;
  document.addedBy = 'BCMI Mine Doc Import';
  document.url = `https://${OBJ_STORE_URL}/${OBJ_STORE_BUCKET}/${document._id}/${collectionDoc.document.displayName}`;
  document.key = s3Key;
  document.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI, 'public'];
  document.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];

  // upload to s3
  await s3.upload({
    Bucket: OBJ_STORE_BUCKET,
    Key: s3Key,
    Body: rawDoc,
    ACL: 'authenticated-read'
  });

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
  //
  if (flavourData.recordType === 'Permit') {
    flavourData.amendmentDocument = {
      documentId: document._id,
      documentName: document.fileName,
      _sourceRefId: 'mem-admin'
    };
  } else {
    flavourData.documents = [document._id];
  }
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
  flavourData.isBcmiPublished = true;
  flavourData.sourceDateAdded = collectionDoc.document.dateAdded;
  flavourData.sourceDateUpdated = collectionDoc.document.dateUpdated;
  flavourData.sourceSystemRef = 'mem-admin';
  flavourData.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI, 'public'];
  flavourData.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  await nrpti.insertOne(flavourData);

  // Master
  masterData._flavourRecords = [new ObjectID(flavourData._id)];
  masterData.documents = [document._id];
  masterData.collectionId = new ObjectID(newCollectionId);
  masterData.mineGuid =  nrptiMine._sourceRefId;
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
  if (Object.prototype.hasOwnProperty.call(flavourData, 'isBcmiPublished')) masterData.isBcmiPublished = true;
  if (Object.prototype.hasOwnProperty.call(flavourData, 'isNrcedPublished')) masterData.isNrcedPublished = false;
  if (Object.prototype.hasOwnProperty.call(flavourData, 'isLngPublished')) masterData.isLngPublished = false;
  masterData.sourceDateAdded = collectionDoc.document.dateAdded;
  masterData.sourceDateUpdated = collectionDoc.document.dateUpdated;
  masterData.read = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI, 'public'];
  masterData.write = [utils.ApplicationRoles.ADMIN, utils.ApplicationRoles.ADMIN_BCMI];
  masterData.sourceSystemRef = 'mem-admin';

  await nrpti.insertOne(masterData);

  return masterData;
}

function getRequest(url, asJson = true) {
  return new Promise(function(resolve, reject) {
      let req = https.get(url, function(res) {
          if (res.statusCode < 200 || res.statusCode >= 300) {
              return reject(new Error('statusCode=' + res.statusCode));
          }
          let body = [];
          res.on('data', function(chunk) {
              body.push(chunk);
          });
          res.on('end', function() {
              try {
                if (asJson) {
                  body = JSON.parse(Buffer.concat(body).toString());
                }
              } catch(e) {
                  reject(e);
              }
              resolve(body);
          });
      });

      req.on('error', function(err) {
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
