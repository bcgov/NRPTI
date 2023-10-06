const request = require('supertest');
const test_util = require('../../test-utils');
const qs = require('qs');
const generate_helper = require('../../data_generators/generate_helper');
const search = require('../../../src/controllers/search');
const CONSTANTS = require('../../../src/utils/constants/misc');


require('../../../src/models/master/order')
require('../../../src/models/audit')


// mock next function
function next() {
  return;
}

const app = test_util.app;
const searchEndpoint = '/search';
const unpublished_val = 'Unpublished';
let generated_things;
let generated_underage;
let generated_ofAge;
let generated_Company;

describe('Search Controller Testing', () => {
  const testUser = 'testUser';

  beforeAll( async () => {
    generated_things = await generate_helper.generateSingleFactory(
      'Order',
      5,
      // to manually set model attr put override values in here
      {},
      // pass any extra build options to factory eg. genUnderage
      {}
    );
    generated_underage = await generate_helper.generateSingleFactory(
      'Order',
      2,
      {},
      { genUnderAge: true }
    );
    generated_ofAge = await generate_helper.generateSingleFactory(
      'Order',
      2,
      {},
      { genAdult: true }
    ),
    generated_Company = await generate_helper.generateSingleFactory(
      'Order',
      2,
      { },
      { genCompany: true }
    )
  });

  test('Invalid ObjectId returns 400 error', async (done) => {
    const roles = ['sysadmin']
    app.get(searchEndpoint, (req, res) => {
      const params = test_util.buildParams(req.query)
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser)
      return search.protectedGet(paramsWithValues, res, next);
    });

    request(app)
      .get(searchEndpoint)
      // must use QS to preserve the array, supertest will create a string value from single obj array
      .query(qs.stringify({ dataset: ['Item'], _id: 'invalidObjectId' }))
      .expect(400)
      .end((err, res) => {
        if (err) {
          console.log(err)
          return done(err)
        }
        expect(res.body).toMatch('Error searching for item invalidObjectId. Invalid item id supplied')
        return done()
      });
  })

  test('Search for Item returns record', (done) => {
    const orderId = generated_things[0]._id.toString();
    const roles = ['sysadmin'];
    app.get(searchEndpoint, async (req, res) => {
      const params = test_util.buildParams(req.query)
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return search.protectedGet(paramsWithValues, res, next)
    });

    request(app)
      .get(searchEndpoint)
      .query(qs.stringify({ dataset: ['Item'], _schemaName: 'Order', _id: orderId}))
      .expect(200)
      .expect('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          console.log(err)
          return done(err)
        }
        expect(res.body.length).toBe(1)
        expect(res.body[0]._id).toMatch(orderId)
        return done();
      })
  })

  test('IssuedTo name redacted for underage individual', (done) => {
    const roles = [];
    const orderId = generated_underage[0]._id.toString();
    app.get(searchEndpoint, (req, res) => {
      const params = test_util.buildParams(req.query)
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return search.protectedGet(paramsWithValues, res, next)
    });

    request(app)
      .get(searchEndpoint)
      .query(qs.stringify({ dataset: ['Item'], _schemaName: 'Order', _id: orderId, populate: true}))
      .expect(200)
      .expect('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          console.log(err)
          return done(err)
        }
        expect(res.body.length).toBe(1)
        let record = res.body[0];
        expect(record._id).toMatch(orderId)
        expect(record.issuedTo.firstName).toBe(unpublished_val)
        expect(record.issuedTo.lastName).toBe(unpublished_val)
        expect(record.issuedTo.fullName).toBe(unpublished_val)
        expect(record.issuedTo.birthDate).toBeFalsy()
        return done();
      })

  })

  test('IssuedTo name published for adults', async (done) => {
    const roles = ['admin:nrced'];
    const orderId = generated_ofAge[0]._id.toString();
    const expected = generated_ofAge[0];
    app.get(searchEndpoint, (req, res) => {
      const params = test_util.buildParams(req.query)
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return search.protectedGet(paramsWithValues, res, next)
    });

    request(app)
      .get(searchEndpoint)
      .query(qs.stringify({ dataset: ['Item'], _schemaName: 'Order', _id: orderId, populate: true}))
      .expect(200)
      .expect('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          console.log(err)
          return done(err)
        }
        expect(res.body.length).toBe(1)
        let record = res.body[0];
        expect(record._id).toMatch(orderId)
        expect(record.issuedTo.firstName).toBe(expected.issuedTo.firstName)
        expect(record.issuedTo.lastName).toBe(expected.issuedTo.lastName)
        expect(record.issuedTo.fullName).toBe(expected.issuedTo.fullName)
        expect(record.issuedTo.dateOfBirth).toBe(expected.issuedTo.dateOfBirth.toISOString())
        return done();
      })
  })

  test('IssuedTo redacted for wildfire role', async (done) => {
    const roles = ['admin:wf'];
    // factory defaults generate write arrays without wf role
    const orderId = generated_underage[1]._id.toString();
    app.get(searchEndpoint, (req, res) => {
      const params = test_util.buildParams(req.query)
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return search.protectedGet(paramsWithValues, res, next)
    });

    request(app)
      .get(searchEndpoint)
      .query(qs.stringify({ dataset: ['Item'], _schemaName: 'Order', _id: orderId, populate: true}))
      .expect(200)
      .expect('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          console.log(err)
          return done(err)
        }
        expect(res.body.length).toBe(1)
        let record = res.body[0];
        expect(record._id).toMatch(orderId)
        expect(record.issuedTo.firstName).toBe(unpublished_val)
        expect(record.issuedTo.lastName).toBe(unpublished_val)
        expect(record.issuedTo.fullName).toBe(unpublished_val)
        expect(record.issuedTo.dateOfBirth).toBeFalsy()
        return done();
      })
  })

  test('IssuedTo company name is not redacted', async (done) => {
    const roles = ['admin:nrced'];
    const orderId = generated_Company[0]._id.toString();
    const expected = generated_Company[0];
    app.get(searchEndpoint, (req, res) => {
      const params = test_util.buildParams(req.query)
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return search.protectedGet(paramsWithValues, res, next)
    });

    request(app)
      .get(searchEndpoint)
      .query(qs.stringify({ dataset: ['Item'], _schemaName: 'Order', _id: orderId, populate: true}))
      .expect(200)
      .expect('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          console.log(err)
          return done(err)
        }
        expect(res.body.length).toBe(1)
        let record = res.body[0];
        expect(record._id).toMatch(orderId)
        expect(record.issuedTo.type).toBe(CONSTANTS.IssuedToEntityTypes.Company)
        expect(record.issuedTo.companyName).toBe(expected.issuedTo.companyName)
        expect(record.issuedTo.firstName).toBe('')
        expect(record.issuedTo.lastName).toBe('')
        expect(record.issuedTo.fullName).toBe('')
        expect(record.issuedTo.dateOfBirth).toBeFalsy()
        return done();
      })
  })

  test('Lookup by dataset returns items', async (done) => {
    const roles = ['sysadmin','admin:nrced'];
    app.get(searchEndpoint, (req, res) => {
      const params = test_util.buildParams(req.query)
      const paramsWithValues = test_util.createSwaggerParams(params, roles, testUser);
      return search.protectedGet(paramsWithValues, res, next)
    });

    request(app)
      .get(searchEndpoint)
      .query({ dataset: ['Order','Inspection']})
      .expect(200)
      .expect('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          console.log(err)
          return done(err)
        }
        console.log(JSON.stringify(res.body))
        expect(res.body[0].searchResults.length).toBe(11)
        return done();
      })
  })
})
