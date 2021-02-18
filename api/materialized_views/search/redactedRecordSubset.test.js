const defaultLog = require('../../src/utils/logger')('redactedRecordSubset.test');
const redactedRecordSubset = require('./redactedRecordSubset');
const { generateIssuedTo } = require('../../test/factories/factory_helper');

jest.setTimeout(100000);

describe('Record Individual issuedTo redaction test', () => {
  let nrptiCollection = null;
  let redacted_record_subset = null;

  beforeAll(async () => {
    const MongoClient = require('mongodb').MongoClient;

    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    nrptiCollection = db.collection('nrpti');
    redacted_record_subset = db.collection('redacted_record_subset');
  });

  beforeEach(async () => {
    await redacted_record_subset.deleteMany();
    await nrptiCollection.deleteMany();
  });

  test('Authorized issuing agency and person over 19 are not redacted', async () => {
    const testRecord = {
      issuedTo: generateIssuedTo( false, true, false ),
      _schemaName: 'Schema',
      issuingAgency: 'BC Parks'
    };

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.update(defaultLog);

    const redacted = await redacted_record_subset.findOne();
    expect(redacted.issuedTo.firstName).toEqual(testRecord.issuedTo.firstName);
    expect(redacted.issuedTo.middleName).toEqual(testRecord.issuedTo.middleName);
    expect(redacted.issuedTo.lastName).toEqual(testRecord.issuedTo.lastName);
    expect(redacted.issuedTo.fullName).toEqual(testRecord.issuedTo.fullName);
    expect(redacted.issuedTo.dateOfBirth).toEqual(expect.any(Date));
  });

  test('Authorized issuing agency and person under 19 are redacted', async () => {
    const testRecord = {
      issuedTo: generateIssuedTo( true, false, false ),
      _schemaName: 'Schema',
      issuingAgency: 'BC Parks'
    };

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.update(defaultLog);

    const redacted = await redacted_record_subset.findOne();
    expect(redacted.issuedTo.firstName).toEqual('Unpublished');
    expect(redacted.issuedTo.middleName).toEqual('');
    expect(redacted.issuedTo.lastName).toEqual('Unpublished');
    expect(redacted.issuedTo.fullName).toEqual('Unpublished');
    expect(redacted.issuedTo.dateOfBirth).toEqual(null);
  });

  test('Unauthorized issuing agency and person over 19 are redacted', async () => {
    const testRecord = {
      issuedTo: generateIssuedTo( false, true, false ),
      _schemaName: 'Schema',
      issuingAgency: 'Unauthorized'
    };

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.update(defaultLog);

    const redacted = await redacted_record_subset.findOne();
    // Expect undefined because entire issuedTo field is redacted
    expect(redacted.issuedTo).toEqual(undefined);
    expect(redacted.documents).toEqual([]);
  });

  test('Unauthorized issuing agency and person under 19 are redacted', async () => {
    const testRecord = {
      issuedTo: generateIssuedTo( true, false, false ),
      _schemaName: 'Schema',
      issuingAgency: 'Unauthorized'
    };

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.update(defaultLog);

    const redacted = await redacted_record_subset.findOne();
    // Expect undefined because entire issuedTo field is redacted
    expect(redacted.issuedTo).toEqual(undefined);
    expect(redacted.documents).toEqual([]);
  });

  test('Unauthorized issuing agency and company are not redacted', async () => {
    const testRecord = {
      issuedTo: generateIssuedTo( false, false, true ),
      _schemaName: 'Schema',
      issuingAgency: 'Unauthorized'
    };

    await nrptiCollection.insertOne(testRecord);
    await redactedRecordSubset.update(defaultLog);

    const redacted = await redacted_record_subset.findOne();
    expect(redacted.issuedTo.companyName).toEqual(testRecord.issuedTo.companyName);
  });
});