require('../../tests/test-utils');
const queryActions = require('./query-actions');
const Order = require('../models/master/order');
const Audit = require('../models/audit');

describe('## publish ##', () => {
  describe('with an object that has already been published', () => {
    test('it returns 409 with a status message', async () => {
      let publishedOrg = new Order({ read: ['public'] });
      try {
        let res = await queryActions.publish(publishedOrg);
        expect(res.code).toEqual(409);
        expect(res.message).toEqual('Object already published');
      } catch (e) {
        console.log('err:', e);
      }
    });
  });

  describe('with an object that has not been published', () => {
    test('it adds the public tag and saves it', async () => {
      let newOrg = new Order({ read: [] });
      try {
        let res = await queryActions.publish(newOrg);
        expect(res.read[0]).toEqual('public');
      } catch (e) {
        console.log('err:', e);
      }
    });
  });

  describe('with an object that has not been published, but has other roles in the read array', () => {
    test('Testing publish', () => {
      let obj = {};
      obj.read = ['sysadmin'];

      expect(queryActions.isPublished(obj)).toEqual(false);

      obj.read = ['sysadmin', 'public'];
      expect(queryActions.isPublished(obj)).toEqual(true);
    });
  });
});

describe('## isPublished ##', () => {
  let record = new Order({});

  test('it returns the array of public read', () => {
    record.read = ['sysadmin', 'public'];
    expect(queryActions.isPublished(record)).toEqual(true);
  });

  test('it returns false if there is no matching public tag', () => {
    record.read = ['sysadmin'];
    expect(!queryActions.isPublished(record)).toEqual(true);
  });
});

describe('## unpublish ##', () => {
  describe('with an object that has been published', () => {
    test('it removes the public tag and saves it', async () => {
      let publishedOrg = new Order({ read: ['public'] });
      let res = await queryActions.unPublish(publishedOrg);
      expect(res.read).toHaveLength(0);
    });
  });

  describe('with an object that is unpublished', () => {
    test('it returns 409 with a status message', async () => {
      let newOrg = new Order({ read: [] });
      let res = await queryActions.unPublish(newOrg);
      if (res.code) {
        expect(res.code).toEqual(409);
        expect(res.message).toEqual('Object already unpublished');
      }
    });
  });
});
