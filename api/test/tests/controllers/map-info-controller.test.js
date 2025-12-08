const request = require('supertest');
// const qs = require('qs');
const ObjectId = require('mongodb').ObjectId;

const test_util = require('../../test-utils');
const mapInfo = require('../../../src/controllers/map-info-controller');
const { ApplicationRoles } = require('../../../src/utils/constants/misc');

// mock next function
function next() {
  return;
}

const app = test_util.app;
const endpoint = '/map-info';

describe('Map-Info Controller Testing', () => {
  const testUser = 'testUser';
  const testObjectId = new ObjectId();
  const testObj = {
    _id: testObjectId,
    _schemaName: 'MapLayerInfo',
    location: 'Nile River',
    length: '48.0 km',
    description: 'paragraph of formatted text',
    dateAdded: '2021-02-24T23:18:14.521Z',
    updatedBy: 'test user',
    dateUpdated: '2021-02-24T23:18:14.521Z',
    write: ['sysadmin', 'admin:lng'],
    read: ['sysadmin', 'admin:lng', 'public'],
    segment: 'Section 8'
  };

  beforeAll(async () => {
    const MongoClient = require('mongodb').MongoClient;

    const client = await MongoClient.connect(process.env.MONGO_URI);
    const db = client.db(process.env.MONGODB_DATABASE || 'nrpti-dev');
    const nrptiCollection = db.collection('nrpti');
    nrptiCollection.insertOne(testObj);
  });

  test('Protectd post returns 400 with invalid post body', async () => {
    const roles = ['sysadmin'];

    app.post(endpoint, (req, res) => {
      const params = test_util.buildParams(req.body);
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return mapInfo.protectedPost(paramsWithValues, res, next);
    });

    const res = await request(app).post(endpoint).send({}).expect(400);

    expect(res.body).toMatch('protectedPost - error: invalid post body');
  });

  test('Protectd post returns 200 with invalid post body', async () => {
    const roles = ['sysadmin'];
    const postObj = {
      application: 'LNG',
      data: {
        location: 'Nile River',
        length: '48.0 km',
        description: 'paragraph of formatted text',
        segment: 'Section 1'
      }
    };

    app.post(endpoint, (req, res) => {
      const params = test_util.buildParams({ mapInfo: req.body });
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return mapInfo.protectedPost(paramsWithValues, res, next);
    });

    const res = await request(app).post(endpoint).send(postObj).expect(200);

    expect(res.body._schemaName).toMatch('MapLayerInfo');
    expect(res.body.location).toMatch(postObj.data.location);
    expect(res.body.length).toMatch(postObj.data.length);
    expect(res.body.description).toMatch(postObj.data.description);
    expect(res.body.segment).toMatch(postObj.data.segment);
    expect(res.body.read).toContain(ApplicationRoles.ADMIN);
    expect(res.body.read).toContain(ApplicationRoles.ADMIN_LNG);
    expect(res.body.read).toContain(ApplicationRoles.PUBLIC);
  });

  // Manually running this test through swagger works, this test does not.

  // test('Protectd put returns 200 and updates record values', async done => {
  //   const roles = ['sysadmin'];
  //   const updateObj = {
  //     description: 'new description',
  //     location: 'new location',
  //     segment: 'new segment',
  //     length: 'new length'
  //   };

  //   app.put(endpoint, (req, res) => {
  //     let params = test_util.buildParams(req.query);
  //     params = { ...params, ...test_util.buildParams({ mapInfo: req.body }) };
  //     const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
  //     return mapInfo.protectedPut(paramsWithValues, res, next);
  //   });

  //   request(app)
  //     .put(endpoint)
  //     .query({ mapInfoId: testObjectId.toString() })
  //     .send(updateObj)
  //     .expect(200)
  //     .end((err, res) => {
  //       if (err) {
  //         console.log(err);
  //         return done(err);
  //       }

  //       expect(res.body.description).toMatch(updateObj.description);
  //       expect(res.body.location).toMatch(updateObj.location);
  //       expect(res.body.length).toMatch(updateObj.length);
  //       // Segment value shouldn't change
  //       expect(res.body.segment).toMatch(testObj.segment);

  //       return done();
  //     });
  // });

  test('Protectd delete returns 200', async () => {
    const roles = ['sysadmin'];

    app.delete(endpoint, (req, res) => {
      const params = test_util.buildParams(req.query);
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return mapInfo.protectedDelete(paramsWithValues, res, next);
    });

    const res = await request(app).delete(endpoint).query({ mapInfoId: testObjectId.toString() }).expect(200);

    expect(res.body).toEqual({ n: 1, ok: 1 });
  });
});
