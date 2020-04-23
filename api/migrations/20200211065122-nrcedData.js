'use strict';

let dbm;
let type;
let seed;

const ObjectID = require('mongodb').ObjectID;
const csvParse = require('csv-parse');
const fs = require('fs');
const moment = require('moment');
const RECORD_TYPE = require('../src/utils/constants/record-type-enum');

const CSV_FILENAME = 'ocers-data.csv';

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
  console.log('---------------------------------------------------------------');
  console.log(`Inserting records from csv file: '${CSV_FILENAME}'`);

  return db.connection
    .connect(db.connectionString, { native_parser: true })
    .then(async mongoClientInstance => {
      const nrptiCollection = mongoClientInstance.collection('nrpti');

      const promises = [];

      let total = 0;
      return new Promise((resolve, reject) => {
        fs.createReadStream(`./migrations/${CSV_FILENAME}`)
          .pipe(csvParse())
          .on('data', row => {
            /*
              0: type
              1: date recorded
              2: business name
              3: first name
              4: last name
              5: middle name
              6: location
              7: act
              8: regulation
              9: section
              10: subsection
              11: paragraph
              12: description
              13: summary
              14: penalty
              15: penalty text
            */
            total++;
            switch (row[0]) {
              case 'Administrative Penalty':
                promises.push(createAdministrativePenalty(row, nrptiCollection));
                break;
              case 'Administrative Sanction':
                promises.push(createAdministrativeSanction(row, nrptiCollection));
                break;
              case 'Court Conviction':
                promises.push(createCourtConviction(row, nrptiCollection));
                break;
              case 'Compliance Inspection':
                promises.push(createInspection(row, nrptiCollection));
                break;
              case 'Order':
                promises.push(createOrder(row, nrptiCollection));
                break;
              case 'Restorative Justice':
                promises.push(createRestorativeJustice(row, nrptiCollection));
                break;
              case 'Violation Ticket':
                promises.push(createTicket(row, nrptiCollection));
                break;
              case 'Warning':
                promises.push(createWarning(row, nrptiCollection));
                break;
              default:
                console.log(` - Skipping unrecognized type - type: '${row[0]}' - row: ${total}`);
                break;
            }
          })
          .on('end', async () => {
            console.log(`Inserting ${promises.length} master records from ${total} csv rows`);
            console.log('---------------------------------------------------------------');
            await Promise.all(promises);
            mongoClientInstance.close();
            resolve();
          })
          .on('error', error => {
            console.log(`CSV Error: ${error}`);
            console.log('---------------------------------------------------------------');
            mongoClientInstance.close();
            reject(error);
          });
      });
    })
    .catch(error => {
      console.log(`Unexpected Error: ${error}`);
      console.log('---------------------------------------------------------------');
      mongoClientInstance.close();
    });
};

const createAdministrativePenalty = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.AdministrativePenalty.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    recordType: RECORD_TYPE.AdministrativePenalty.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '').replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.AdministrativePenalty._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    recordType: RECORD_TYPE.AdministrativePenalty.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '').replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const createAdministrativeSanction = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.AdministrativeSanction.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.AdministrativeSanction.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.AdministrativeSanction._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.AdministrativeSanction.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const createCourtConviction = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.CourtConviction.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    // recordSubtype: '',
    recordType: RECORD_TYPE.CourtConviction.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '').replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.CourtConviction._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    recordType: RECORD_TYPE.CourtConviction.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '').replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const createInspection = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Inspection.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.Inspection.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // penalty: '',
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.Inspection._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.Inspection.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // penalty: '',
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const createOrder = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Order.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.Order.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // penalty: '',
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.Order._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.Order.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // penalty: '',
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const createRestorativeJustice = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.RestorativeJustice.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    recordType: RECORD_TYPE.RestorativeJustice.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.RestorativeJustice._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    recordType: RECORD_TYPE.RestorativeJustice.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const createTicket = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Ticket.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    recordType: RECORD_TYPE.Ticket.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.Ticket._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    offence: row[12],
    recordType: RECORD_TYPE.Ticket.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalties: getPenaltyObject(row),
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const createWarning = async function (row, nrptiCollection) {
  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Warning.flavours.nrced._schemaName,

    read: ['sysadmin', 'public'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.Warning.displayName,
    // recordSubtype: '',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row, true),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // attachments: null,

    summary: row[13],

    dateAdded: new Date(),
    dateUpdated: new Date(),
    datePublished: new Date(),

    addedBy: 'System',
    updatedBy: 'System',
    publishedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(flavourRecordNRCED);
  const flavourId = responseflavourNRCED.insertedId;

  const masterRecord = {
    _schemaName: RECORD_TYPE.Warning._schemaName,
    _flavourRecords: [new ObjectID(flavourId)],

    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[12],
    legislationDescription: row[12],
    recordType: RECORD_TYPE.Warning.displayName,
    // recordSubtype: '',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: calculateDateFormat(row),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[7],
      regulation: row[8],
      section: row[9],
      subSection: row[10].replace(/[()]/g, ''),
      paragraph: row[11].replace(/[()]/g, '')
    },
    issuedTo: getIssuedToObject(row),
    // projectName: '',
    location: row[6],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),

    addedBy: 'System',
    updatedBy: 'System',

    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'ocers-csv'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
};

const getIssuedToObject = function (row, addPublicRole) {
  let issuedToObject = {
    read: ['sysadmin'],
    write: ['sysadmin']
  };

  if (!row) {
    return issuedToObject;
  }

  if (row[2]) {
    issuedToObject.type = 'Company';
    issuedToObject.companyName = row[2];

    issuedToObject.fullName = setIssuedToFullNameValue(issuedToObject);

    if (addPublicRole) {
      issuedToObject.read.push('public');
    }
  } else if (row[3] || row[4] || row[5]) {
    issuedToObject.type = 'Individual';
    issuedToObject.firstName = row[3];
    issuedToObject.middleName = row[5];
    issuedToObject.lastName = row[4];
    issuedToObject.dateOfBirth = null;

    issuedToObject.fullName = setIssuedToFullNameValue(issuedToObject);

    if (addPublicRole) {
      issuedToObject.read.push('public');
    }
  } else {
    // Individual is anonymous, so don't set read role
    issuedToObject.type = 'Individual';
    issuedToObject.firstName = '';
    issuedToObject.middleName = '';
    issuedToObject.lastName = '';
    issuedToObject.dateOfBirth = null;

    issuedToObject.fullName = '';
  }

  return issuedToObject;
};

const setIssuedToFullNameValue = function (issuedToObj) {
  if (!issuedToObj || !issuedToObj.type) {
    return '';
  }

  if (issuedToObj.type === 'IndividualCombined') {
    return issuedToObj.fullName;
  }

  if (issuedToObj.type === 'Company') {
    return issuedToObj.companyName;
  }

  if (!issuedToObj.firstName && !issuedToObj.middleName && !issuedToObj.lastName) {
    return '';
  }

  if (issuedToObj.type === 'Individual') {
    let entityString = '';

    const entityNameParts = [];
    if (issuedToObj.lastName) {
      entityNameParts.push(issuedToObj.lastName);
    }

    if (issuedToObj.firstName) {
      entityNameParts.push(issuedToObj.firstName);
    }

    entityString = entityNameParts.join(', ');

    if (issuedToObj.middleName) {
      entityString += ` ${issuedToObj.middleName}`;
    }

    return entityString;
  }
};

const getPenaltyObject = function (row) {
  const penaltyObject = {
    type: '',
    penalty: {
      type: '',
      value: null
    },
    description: ''
  };

  if (!row) {
    return penaltyObject;
  }

  if (row[[14]]) {
    penaltyObject.type = 'Fined';
    penaltyObject.penalty.type = 'Dollars';
    penaltyObject.penalty.value = Number(row[14]);
  } else {
    penaltyObject.type = 'Other';
    penaltyObject.penalty.type = 'Other';
  }

  penaltyObject.description = row[15] || '';

  return [penaltyObject];
};

const calculateDateFormat = function (row) {
  let dateIssued = null;
  if (row[1]) {
    if (moment(row[1], 'MM/DD/YYYY', true).isValid()) {
      dateIssued = moment(row[1], 'DD/MM/YYYY').toDate();
    } else if (moment(row[1], 'D/M/YY', true).isValid()) {
      dateIssued = moment(row[1], 'D/M/YY').toDate();
    } else if (moment(row[1], 'YYYY-MM-DD', true).isValid()) {
      dateIssued = moment(row[1], 'YYYY-MM-DD').toDate();
    }
  }
  return dateIssued;
}

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1
};
