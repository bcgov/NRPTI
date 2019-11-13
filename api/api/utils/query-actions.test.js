const queryActions = require('./queryActions');
const Record = require('../models/record');

describe('#publish', () => {
  describe('with an object that has already been published', () => {
    test('it returns 409 with a status message', done => {
      let publishedOrg = new Record({ tags: ['public'] });
      queryActions.publish(publishedOrg).catch(error => {
        expect(error.code).toEqual(409);
        expect(error.message).toEqual('Object already published');
        done();
      });
    });
  });

  describe('with an object that has not been published', () => {
    test('it adds the public tag and saves it', () => {
      let newOrg = new Record({ tags: [] });
      queryActions.publish(newOrg);
      expect(newOrg.tags[0]).toEqual(expect.arrayContaining(['public']));
    });
  });
});

test('Testing publish', () => {
  let obj = {};
  obj.tags = [['sysadmin']];

  expect(queryActions.isPublished(obj)).toEqual(undefined);

  obj.tags = [['sysadmin'], ['public']];
  expect(queryActions.isPublished(obj)).toEqual(['public']);
});

describe('#isPublished', () => {
  let record = new Record({});

  test('it returns the array of public tags', () => {
    record.tags = [['sysadmin'], ['public']];
    expect(queryActions.isPublished(record)).toEqual(expect.arrayContaining(['public']));
  });

  test('it returns undefined if there is no matching public tag', () => {
    record.tags = [['sysadmin']];
    expect(queryActions.isPublished(record)).toBeUndefined();
  });
});

describe('#unpublish', () => {
  describe('with an object that has been published', () => {
    test('it removes the public tag and saves it', () => {
      let publishedOrg = new Record({ tags: ['public'] });
      queryActions.unPublish(publishedOrg);
      expect(publishedOrg.tags).toHaveLength(0);
    });
  });

  describe('with an object that is unpublished', () => {
    test('it returns 409 with a status message', done => {
      let newOrg = new Record({ tags: [] });
      queryActions.unPublish(newOrg).catch(error => {
        expect(error.code).toEqual(409);
        expect(error.message).toEqual('Object already unpublished');
        done();
      });
    });
  });
});

describe('#delete', () => {
  test('it removes the public tag', () => {
    let publishedOrg = new Record({ tags: ['public'] });
    queryActions.delete(publishedOrg);
    expect(publishedOrg.tags).toHaveLength(0);
  });

  test('it soft-deletes the object', () => {
    let newOrg = new Record({ tags: [] });
    queryActions.delete(newOrg);
    expect(newOrg.isDeleted).toEqual(true);
  });
});
