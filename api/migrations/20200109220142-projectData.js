'use strict';

var dbm;
var type;
var seed;

var ObjectID = require('mongodb').ObjectID;
var moment = require('moment');

let activities = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/general/home.json').activities;

let project1Authorizations = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project1/authorizations.json').documents.docs;
let project1Compliances = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project1/compliance.json').documents.docs;
let project1Nations = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project1/nations.json').documents.docs;
let project1Plans = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project1/plans.json').documents.docs;

let project2Authorizations = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project2/authorizations.json').documents.docs;
let project2Compliances = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project2/compliance.json').documents.docs;
let project2Nations = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project2/nations.json').documents.docs;
let project2Plans = require(process.cwd() + '/../angular/projects/public-lng/src/assets/data/project2/plans.json').documents.docs;

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
  let mClient;
  return db.connection.connect(db.connectionString, { native_parser: true })
    .then(async (mClientInst) => {
      // mClientInst is an instance of MongoClient
      mClient = mClientInst
      var nrptiCollection = mClient.collection('nrpti')

      let promises = [];

      for (const item of activities) {
        // Which project?
        if (item.url.startsWith('/project/1')) {
          promises.push(createActivityRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
        } else {
          promises.push(createActivityRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
        }
      }

      for (const item of project1Authorizations) {
        switch (item.complianceDocumentType) {
          case 'Letter':
          case 'Report':
          case 'Certificate':
            promises.push(createCertificateRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          case 'Permit':
            promises.push(createPermitRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          default:
            console.log('-------------------')
            console.log(`Unknown - skipping: (${item.complianceDocumentType}) ${item.name}`)
            console.log('-------------------')
            break;
        }
      }

      for (const item of project1Compliances) {
        switch (item.complianceDocumentType) {
          case 'Inspection':
            promises.push(createInspectionRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          case 'Memo':
          case 'Letter':
          case 'Self Report':
          case 'Compliance Self-Report':
            promises.push(createComplianceSelfReportRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          case 'Enforcement Action':
          case 'Order':
            promises.push(createOrderRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          case 'Warning Letter':
          case 'Warning':
            promises.push(createWarningRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          default:
            console.log('-------------------')
            console.log(`Unknown - skipping: (${item.complianceDocumentType}) ${item.name}`)
            console.log('-------------------')
            break;
        }
      }

      for (const item of project1Nations) {
        promises.push(createAgreementRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
      }

      for (const item of project1Plans) {
        switch (item.complianceDocumentType || item.type) {
          case 'Construction':
          case 'Construction Plan':
            promises.push(createConstructionPlanRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          case 'Management':
          case 'Management Plan':
            promises.push(createManagementPlanRecord(item, '588511c4aaecd9001b825604', nrptiCollection));
            break;
          default:
            console.log('-------------------')
            console.log(`Unknown - skipping: (${item.complianceDocumentType}) ${item.name}`)
            console.log('-------------------')
            break;
        }
      }

      for (const item of project2Authorizations) {
        switch (item.complianceDocumentType) {
          case 'Letter':
          case 'Report':
          case 'Certificate':
            promises.push(createCertificateRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          case 'Permit':
            promises.push(createPermitRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          default:
            console.log('-------------------')
            console.log(`Unknown - skipping: (${item.complianceDocumentType}) ${item.name}`)
            console.log('-------------------')
            break;
        }
      }

      for (const item of project2Compliances) {
        switch (item.complianceDocumentType) {
          case 'Inspection':
            promises.push(createInspectionRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          case 'Memo':
          case 'Letter':
          case 'Self Report':
          case 'Compliance Self-Report':
            promises.push(createComplianceSelfReportRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          case 'Enforcement Action':
          case 'Order':
            promises.push(createOrderRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          case 'Warning Letter':
          case 'Warning':
            promises.push(createWarningRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          default:
            console.log('-------------------')
            console.log(`Unknown - skipping: (${item.complianceDocumentType}) ${item.name}`)
            console.log('-------------------')
            break;
        }
      }

      for (const item of project2Nations) {
        promises.push(createAgreementRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
      }

      for (const item of project2Plans) {
        switch (item.complianceDocumentType || item.type) {
          case 'Permit':
          case 'Construction':
          case 'Construction Plan':
            promises.push(createConstructionPlanRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          case 'Management':
          case 'Management Plan':
            promises.push(createManagementPlanRecord(item, '588510cdaaecd9001b815f84', nrptiCollection));
            break;
          default:
            console.log('-------------------')
            console.log(`Unknown - skipping: (${item.complianceDocumentType}) ${item.name}`)
            console.log('-------------------')
            break;
        }
      }

      // Wait for all the pushed promises to resolve
      await Promise.all(promises);

      mClient.close();
    })
    .catch((e) => {
      console.log("e:", e);
      mClient.close()
    });
};

let createActivityRecord = async function (item, project, nrptiCollection) {
  const activity = {
    _schemaName: 'ActivityLNG',
    _epicProjectId: new ObjectID(project),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    type: item.type,
    title: item.title,
    description: item.description,
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',
    // Prefer to store dates in the DB as ISO, not some random format.
    date: moment(item.date, 'DD-MM-YYYY').toDate()
  }

  const res = await nrptiCollection.insertOne(activity)
  let activityID = res.insertedId.toString()
  console.log('Inserted activityID:', activityID)
}

let createAgreementRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const master = {
    _schemaName: 'Agreement',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Agreement',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    nationName: item.nation,
    attachments: [{ url: item.url }],
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(master)
  let masterID = resMaster.insertedId.toString()
  console.log('Inserted MasterID:', masterID)

  // Create the related flavour record
  let flavourLNG = {
    _schemaName: 'AgreementLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(masterID),
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(flavourLNG)
  console.log('Inserted FlavourLNGID:', resFlavour.insertedId.toString())
}

let createManagementPlanRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const master = {
    _schemaName: 'ManagementPlan',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Management Plan',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(master)
  let masterID = resMaster.insertedId.toString()
  console.log('Inserted MasterID:', masterID)

  // Create the related flavour record
  let flavourLNG = {
    _schemaName: 'ManagementPlanLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(masterID),
    relatedPhase: item.phase || item.complianceDocumentSubtype,
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(flavourLNG)
  console.log('Inserted FlavourLNGID:', resFlavour.insertedId.toString())
}

let createConstructionPlanRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const master = {
    _schemaName: 'ConstructionPlan',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Construction Plan',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(master)
  let masterID = resMaster.insertedId.toString()
  console.log('Inserted MasterID:', masterID)

  // Create the related flavour record
  let flavourLNG = {
    _schemaName: 'ConstructionPlanLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(masterID),
    relatedPhase: item.phase || item.complianceDocumentSubtype,
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(flavourLNG)
  console.log('Inserted FlavourLNGID:', resFlavour.insertedId.toString())
}

let createWarningRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const master = {
    _schemaName: 'Warning',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Warning',
    recordSubtype: item.complianceDocumentSubtype,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    author: item.author,
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(master)
  let masterID = resMaster.insertedId.toString()
  console.log('Inserted MasterID:', masterID)

  // Create the related flavour record
  let flavourLNG = {
    _schemaName: 'WarningLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(masterID),
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(flavourLNG)
  console.log('Inserted FlavourLNGID:', resFlavour.insertedId.toString())
}

let createComplianceSelfReportRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const master = {
    _schemaName: 'SelfReport',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Compliance Self-Report',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    author: item.author,
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(master)
  let masterID = resMaster.insertedId.toString()
  console.log('Inserted MasterID:', masterID)

  // Create the related flavour record
  let flavourLNG = {
    _schemaName: 'SelfReportLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(masterID),
    relatedPhase: item.phase,
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(flavourLNG)
  console.log('Inserted FlavourLNGID:', resFlavour.insertedId.toString())
}

let createCertificateRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const certificateMaster = {
    _schemaName: 'Certificate',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Certificate',
    recordSubtype: item.complianceDocumentSubtype,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(certificateMaster)
  let certificateLNGId = resMaster.insertedId.toString()
  console.log('Inserted MasterCertificateID:', certificateLNGId)

  // Create the related flavour record
  let certificateLNG = {
    _schemaName: 'CertificateLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(certificateLNGId),
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(certificateLNG)
  console.log('Inserted AuthLNGID:', resFlavour.insertedId.toString())
}

let createPermitRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const permitMaster = {
    _schemaName: 'Permit',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Permit',
    recordSubtype: item.complianceDocumentSubtype,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(permitMaster)
  let permitLNGId = resMaster.insertedId.toString()
  console.log('Inserted MasterPermitID:', permitLNGId)

  // Create the related flavour record
  let permitLNG = {
    _schemaName: 'PermitLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(permitLNGId),
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(permitLNG)
  console.log('Inserted AuthLNGID:', resFlavour.insertedId.toString())
}

let createOrderRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const master = {
    _schemaName: 'Order',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Order',
    recordSubtype: item.complianceDocumentSubtype,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    author: item.author,
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(master)
  let masterID = resMaster.insertedId.toString()
  console.log('Inserted MasterID:', masterID)

  // Create the related flavour record
  let flavourLNG = {
    _schemaName: 'OrderLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(masterID),
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(flavourLNG)
  console.log('Inserted FlavourLNGID:', resFlavour.insertedId.toString())
}

let createInspectionRecord = async function (item, project, nrptiCollection) {
  // Create the master record
  const master = {
    _schemaName: 'Inspection',
    _epicProjectId: new ObjectID(project),
    read: ['sysadmin'],
    write: ['sysadmin'],
    recordName: item.name,
    recordType: 'Inspection',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(item.date, 'DD-MM-YYYY').toDate(),
    issuingAgency: item.agency,
    attachments: [{ url: item.url }],
    author: item.author,
    projectName: project === '588511c4aaecd9001b825604' ? 'LNG Canada' : 'Coastal Gaslink',

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date,
    sourceDateUpdated: new Date,
    sourceSystemRef: ''
  }

  const resMaster = await nrptiCollection.insertOne(master)
  let masterID = resMaster.insertedId.toString()
  console.log('Inserted MasterID:', masterID)

  // Create the related flavour record
  let flavourLNG = {
    _schemaName: 'InspectionLNG',
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: [
      'public',
      'sysadmin'
    ],
    write: ['sysadmin'],
    _master: new ObjectID(masterID),
    description: item.description,
  }

  const resFlavour = await nrptiCollection.insertOne(flavourLNG)
  console.log('Inserted FlavourLNGID:', resFlavour.insertedId.toString())
}

exports.down = function (db) {
  return null;
};

exports._meta = {
  "version": 1
};
