'use strict';

let dbm;
let type;
let seed;

const ObjectID = require('mongodb').ObjectID;
const csvParse = require('csv-parse');
const fs = require('fs');
const moment = require('moment');
const RECORD_TYPE = require('../src/utils/constants/record-type-enum');

const CSV_FILENAME = 'nrced-data.csv';

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db) {
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
              1: year
              2: quarter
              3: issued to
              4: date recorded
              5: offender type
              6: first name
              7: middle name
              8: last name
              9: business name
              10: location
              11: act
              12: abbreviation
              13: section number
              14: sub section
              15: paragraph
              16: description
              17: summary
              18: birth date
              19: penalty amount
              20: penalty text
            */
            total++;
            switch (row[0]) {
              case 'Administrative Penalty':
                promises.push(
                  createAdministrativePenalty(row, nrptiCollection)
                );
                break;
              case 'Administrative Sanction':
                promises.push(
                  createAdministrativeSanction(row, nrptiCollection)
                );
                break;
              case 'Court Conviction':
                // TODO when court convictions are ready
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

const createAdministrativePenalty = async function(row, nrptiCollection) {
  const masterRecord = {
    _schemaName: RECORD_TYPE.AdministrativePenalty._schemaName,
    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[16],
    recordType: RECORD_TYPE.AdministrativePenalty.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(row[1], 'YYYY')
      .quarter(row[2])
      .toDate(),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[11],
      regulation: row[12],
      section: row[13],
      subSection: row[14].replace(/[()]/g, ''),
      paragraph: row[15].replace(/[()]/g, '').replace(/[()]/g, '')
    },
    issuedTo: row[3],
    // projectName: '',
    location: row[10],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalty: row[19],
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'nrced'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
  const masterId = responseMaster.insertedId.toString();
  // console.log('Inserted MasterID:', masterId);

  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.AdministrativePenalty.flavours.nrced._schemaName,
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: ['public', 'sysadmin'],
    write: ['sysadmin'],
    _master: new ObjectID(masterId),
    summary: row[17]
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(
    flavourRecordNRCED
  );
  // console.log('Inserted FlavourNRCEDID:', responseflavourNRCED.insertedId.toString());
};

const createAdministrativeSanction = async function(row, nrptiCollection) {
  const masterRecord = {
    _schemaName: RECORD_TYPE.AdministrativeSanction._schemaName,
    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[16],
    recordType: RECORD_TYPE.AdministrativeSanction.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(row[1], 'YYYY')
      .quarter(row[2])
      .toDate(),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[11],
      regulation: row[12],
      section: row[13],
      subSection: row[14].replace(/[()]/g, ''),
      paragraph: row[15].replace(/[()]/g, '')
    },
    issuedTo: row[3],
    // projectName: '',
    location: row[10],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalty: row[19],
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'nrced'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
  const masterId = responseMaster.insertedId.toString();
  // console.log('Inserted MasterID:', masterId);

  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.AdministrativeSanction.flavours.nrced._schemaName,
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: ['public', 'sysadmin'],
    write: ['sysadmin'],
    _master: new ObjectID(masterId),
    summary: row[17]
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(
    flavourRecordNRCED
  );
  // console.log('Inserted FlavourNRCEDID:', responseflavourNRCED.insertedId.toString());
};

const createCourtConviction = async function(row, nrptiCollection) {
  // TODO when court convictions are ready
  return;
};

const createInspection = async function(row, nrptiCollection) {
  const masterRecord = {
    _schemaName: RECORD_TYPE.Inspection._schemaName,
    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[16],
    recordType: RECORD_TYPE.Inspection.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(row[1], 'YYYY')
      .quarter(row[2])
      .toDate(),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[11],
      regulation: row[12],
      section: row[13],
      subSection: row[14].replace(/[()]/g, ''),
      paragraph: row[15].replace(/[()]/g, '')
    },
    issuedTo: row[3],
    // projectName: '',
    location: row[10],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // penalty: '',
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'nrced'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
  const masterId = responseMaster.insertedId.toString();
  // console.log('Inserted MasterID:', masterId);

  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Inspection.flavours.nrced._schemaName,
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: ['public', 'sysadmin'],
    write: ['sysadmin'],
    _master: new ObjectID(masterId),
    summary: row[17]
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(
    flavourRecordNRCED
  );
  // console.log('Inserted FlavourNRCEDID:', responseflavourNRCED.insertedId.toString());
};

const createOrder = async function(row, nrptiCollection) {
  const masterRecord = {
    _schemaName: RECORD_TYPE.Order._schemaName,
    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[16],
    recordType: RECORD_TYPE.Order.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(row[1], 'YYYY')
      .quarter(row[2])
      .toDate(),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[11],
      regulation: row[12],
      section: row[13],
      subSection: row[14].replace(/[()]/g, ''),
      paragraph: row[15].replace(/[()]/g, '')
    },
    issuedTo: row[3],
    // projectName: '',
    location: row[10],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // penalty: '',
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'nrced'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
  const masterId = responseMaster.insertedId.toString();
  // console.log('Inserted MasterID:', masterId);

  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Order.flavours.nrced._schemaName,
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: ['public', 'sysadmin'],
    write: ['sysadmin'],
    _master: new ObjectID(masterId),
    summary: row[17]
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(
    flavourRecordNRCED
  );
  // console.log('Inserted FlavourNRCEDID:', responseflavourNRCED.insertedId.toString());
};

const createRestorativeJustice = async function(row, nrptiCollection) {
  const masterRecord = {
    _schemaName: RECORD_TYPE.RestorativeJustice._schemaName,
    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[16],
    recordType: RECORD_TYPE.RestorativeJustice.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(row[1], 'YYYY')
      .quarter(row[2])
      .toDate(),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[11],
      regulation: row[12],
      section: row[13],
      subSection: row[14].replace(/[()]/g, ''),
      paragraph: row[15].replace(/[()]/g, '')
    },
    issuedTo: row[3],
    // projectName: '',
    location: row[10],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalty: row[19],
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'nrced'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
  const masterId = responseMaster.insertedId.toString();
  // console.log('Inserted MasterID:', masterId);

  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.RestorativeJustice.flavours.nrced._schemaName,
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: ['public', 'sysadmin'],
    write: ['sysadmin'],
    _master: new ObjectID(masterId),
    summary: row[17]
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(
    flavourRecordNRCED
  );
  // console.log('Inserted FlavourNRCEDID:', responseflavourNRCED.insertedId.toString());
};

const createTicket = async function(row, nrptiCollection) {
  const masterRecord = {
    _schemaName: RECORD_TYPE.Ticket._schemaName,
    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[16],
    recordType: RECORD_TYPE.Ticket.displayName,
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(row[1], 'YYYY')
      .quarter(row[2])
      .toDate(),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[11],
      regulation: row[12],
      section: row[13],
      subSection: row[14].replace(/[()]/g, ''),
      paragraph: row[15].replace(/[()]/g, '')
    },
    issuedTo: row[3],
    // projectName: '',
    location: row[10],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    penalty: row[19],
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'nrced'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
  const masterId = responseMaster.insertedId.toString();
  // console.log('Inserted MasterID:', masterId);

  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Ticket.flavours.nrced._schemaName,
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: ['public', 'sysadmin'],
    write: ['sysadmin'],
    _master: new ObjectID(masterId),
    summary: row[17]
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(
    flavourRecordNRCED
  );
  // console.log('Inserted FlavourNRCEDID:', responseflavourNRCED.insertedId.toString());
};

const createWarning = async function(row, nrptiCollection) {
  const masterRecord = {
    _schemaName: RECORD_TYPE.Warning._schemaName,
    read: ['sysadmin'],
    write: ['sysadmin'],

    recordName: row[16],
    recordType: RECORD_TYPE.Warning.displayName,
    // recordSubtype: '',
    // Prefer to store dates in the DB as ISO, not some random format.
    dateIssued: moment(row[1], 'YYYY')
      .quarter(row[2])
      .toDate(),
    // issuingAgency: '',
    // author: '',
    legislation: {
      act: row[11],
      regulation: row[12],
      section: row[13],
      subSection: row[14].replace(/[()]/g, ''),
      paragraph: row[15].replace(/[()]/g, '')
    },
    issuedTo: row[3],
    // projectName: '',
    location: row[10],
    // centroid: '',
    // outcomeStatus: '',
    // outcomeDescription: '',
    // attachments: null,

    dateAdded: new Date(),
    dateUpdated: new Date(),
    updatedBy: 'System',
    publishedBy: 'System',
    sourceDateAdded: new Date(),
    sourceDateUpdated: new Date(),
    sourceSystemRef: 'nrced'
  };

  const responseMaster = await nrptiCollection.insertOne(masterRecord);
  const masterId = responseMaster.insertedId.toString();
  // console.log('Inserted MasterID:', masterId);

  let flavourRecordNRCED = {
    _schemaName: RECORD_TYPE.Warning.flavours.nrced._schemaName,
    dateUpdated: new Date(),
    datePublished: new Date(),
    read: ['public', 'sysadmin'],
    write: ['sysadmin'],
    _master: new ObjectID(masterId),
    summary: row[17]
  };

  const responseflavourNRCED = await nrptiCollection.insertOne(
    flavourRecordNRCED
  );
  // console.log('Inserted FlavourNRCEDID:', responseflavourNRCED.insertedId.toString());
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1
};
