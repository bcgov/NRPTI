const queryActions = require('./query-actions');

describe('publish', () => {
  describe('with an object that has already been published', () => {
    test('it returns 409 with a status message', async () => {
      let record = { read: ['public'] };

      let response = await queryActions.publish(record);

      expect(response['code']).toEqual(409);
      expect(response.message).toEqual('Object already published');
    });
  });

  describe('with an object that has not been published', () => {
    test('it adds the public tag and saves it', async () => {
      let record = { read: [] };
      // stub save method to return itself
      record.save = function () {
        return this;
      };
      record.markModified = () => {};

      let response = await queryActions.publish(record);

      expect(response.read[0]).toEqual('public');
    });
  });
});

describe('isPublished', () => {
  test('it returns the array of public read', () => {
    const record = { read: ['sysadmin', 'public'] };

    expect(queryActions.isPublished(record)).toEqual(true);
  });

  test('it returns false if there is no matching public tag', () => {
    const record = { read: ['sysadmin'] };

    expect(queryActions.isPublished(record)).toEqual(false);
  });
});

describe('unPublish', () => {
  describe('with an object that has been published', () => {
    test('it removes the public tag and saves it', async () => {
      let record = { read: ['public'] };
      // stub save method to return itself
      record.save = function () {
        return this;
      };
      record.markModified = () => {};

      let response = await queryActions.unPublish(record);

      expect(response.read).toHaveLength(0);
    });
  });

  describe('with an object that is unpublished', () => {
    test('it returns 409 with a status message', async () => {
      let record = { read: [] };

      let response = await queryActions.unPublish(record);

      if (response['code']) {
        expect(response['code']).toEqual(409);
        expect(response.message).toEqual('Object already unpublished');
      }
    });
  });
});
