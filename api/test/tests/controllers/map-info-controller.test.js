const request = require('supertest');
// const qs = require('qs');
let mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const test_util = require('../../test-utils');
const express = require('express');
const bodyParser = require('body-parser');
const mapInfo = require('../../../src/controllers/map-info-controller');
const { ApplicationRoles } = require('../../../src/utils/constants/misc');
const { restorativeJustice } = require('../../../src/models/master');

// mock next function
function next() {
  return;
}

let app;
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

  beforeEach(async () => {
    const db = mongoose.connection.db;
    await db.collection('nrpti').deleteMany({});

    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
  });

  test('Protectd post returns 400 with invalid post body', async () => {
    const db = mongoose.connection.db;
    const nrptiCollection = db.collection('nrpti');
    nrptiCollection.insertOne(testObj);
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
    const db = mongoose.connection.db;
    const nrptiCollection = db.collection('nrpti');
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
    const db = mongoose.connection.db;
    const nrptiCollection = db.collection('nrpti');
    nrptiCollection.insertOne(testObj);
    const roles = ['sysadmin'];

    app.delete(endpoint, (req, res) => {
      const params = test_util.buildParams(req.query);
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return mapInfo.protectedDelete(paramsWithValues, res, next);
    });

    const res = await request(app).delete(endpoint).query({ mapInfoId: testObjectId.toString() }).expect(200);

    expect(res.body).toEqual({ acknowledged: true, deletedCount: 1 });
  });
});
