const defaultLog = require('../../src/utils/logger')('redactedRecordSubset.test');
const mongoose = require('mongoose');
const redactedRecordSubset = require('./redactedRecordSubset');
const { generateIssuedTo } = require('../../test/factories/factory_helper');

jest.setTimeout(100000);

describe('Record Individual issuedTo redaction test', () => {
  let nrptiCollection = null;
  let redacted_record_subset = null;
  let TestModel = null;

  beforeAll(async () => {
    const MongoClient = require('mongodb').MongoClient;

    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    nrptiCollection = db.collection('nrpti');
    redacted_record_subset = db.collection('redacted_record_subset');

    TestModel = mongoose.model('TestModel', {
      issuedTo: {
        write: [{ type: String, trim: true, default: 'sysadmin' }],
        read: [{ type: String, trim: true, default: 'sysadmin' }],

        type: { type: String, enum: ['Company', 'Individual', 'IndividualCombined'] },
        companyName: { type: String, default: '' },
        firstName: { type: String, default: '' },
        middleName: { type: String, default: '' },
        lastName: { type: String, default: '' },
        fullName: { type: String, default: '' },
        dateOfBirth: { type: Date, default: null }
      },
      _schemaName: { type: String, default: '' },
      issuingAgency: { type: String, default: '' }
    });
  });

  beforeEach(async () => {
    await redacted_record_subset.deleteMany();
    await nrptiCollection.deleteMany();
  });

  test('Authorized issuing agency and person over 19 are not redacted', async () => {
    const testRecord = new TestModel({
        issuedTo: generateIssuedTo( false, true, false ),
        _schemaName: 'Schema',
        issuingAgency: 'BC Parks'
      });

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.saveOneRecord(testRecord);

    const redacted = await redacted_record_subset.findOne();
    expect(redacted.issuedTo.firstName).toEqual(testRecord.issuedTo.firstName);
    expect(redacted.issuedTo.middleName).toEqual(testRecord.issuedTo.middleName);
    expect(redacted.issuedTo.lastName).toEqual(testRecord.issuedTo.lastName);
    expect(redacted.issuedTo.fullName).toEqual(testRecord.issuedTo.fullName);
    expect(redacted.issuedTo.dateOfBirth).toEqual(expect.any(Date));
  });

  test('Authorized issuing agency and person under 19 are redacted', async () => {
    const testRecord = new TestModel({
      issuedTo: generateIssuedTo( true, false, false ),
      _schemaName: 'Schema',
      issuingAgency: 'BC Parks'
    });

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.saveOneRecord(testRecord);

    const redacted = await redacted_record_subset.findOne();
    // Expect undefined because entire issuedTo field is redacted
    expect(redacted.issuedTo).toEqual(undefined);
    expect(redacted.documents).toEqual([]);
  });

  test('Unauthorized issuing agency and person over 19 are redacted', async () => {
    const testRecord = new TestModel({
      issuedTo: generateIssuedTo( false, true, false ),
      _schemaName: 'Schema',
      issuingAgency: 'Unauthorized'
    });

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.saveOneRecord(testRecord);

    const redacted = await redacted_record_subset.findOne();
    // Expect undefined because entire issuedTo field is redacted
    expect(redacted.issuedTo).toEqual(undefined);
    expect(redacted.documents).toEqual([]);
  });

  test('Unauthorized issuing agency and person under 19 are redacted', async () => {
    const testRecord = new TestModel({
      issuedTo: generateIssuedTo( true, false, false ),
      _schemaName: 'Schema',
      issuingAgency: 'Unauthorized'
    });


    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.saveOneRecord(testRecord);

    const redacted = await redacted_record_subset.findOne();
    // Expect undefined because entire issuedTo field is redacted
    expect(redacted.issuedTo).toEqual(undefined);
    expect(redacted.documents).toEqual([]);
  });

  test('Unauthorized issuing agency and company are not redacted', async () => {
    const testRecord = new TestModel({
      issuedTo: generateIssuedTo( false, false, true ),
      _schemaName: 'Schema',
      issuingAgency: 'Unauthorized'
    });

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.saveOneRecord(testRecord);

    const redacted = await redacted_record_subset.findOne();
    expect(redacted.issuedTo.companyName).toEqual(testRecord.issuedTo.companyName);
  });
});