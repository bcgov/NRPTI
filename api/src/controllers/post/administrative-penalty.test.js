const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let AddAdministrativePenalty = require('./administrative-penalty');
const utils = require('../../utils/constants/misc');

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 600000;
let mongoServer;

// Setup mongoose with mongodb-memory-server
beforeAll(async () => {
  mongoServer = new MongoMemoryServer();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri, {}, err => {
    if (err) console.error(err);
  });

  require('../../models');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const wfRole = [utils.ApplicationRoles.ADMIN_WF];

const args = {
  swagger: {
    params: {
      auth_payload: {
        displayName: 'test_user',
        realm_access: { roles: [utils.ApplicationRoles.ADMIN] }
      }
    }
  }
};

const wfArgs = {
  swagger: {
    params: {
      auth_payload: {
        displayName: 'test_user',
        realm_access: { roles: [utils.ApplicationRoles.ADMIN_WF] }
      }
    }
  }
};

describe('administrative-penalty', () => {
  describe('createMaster', () => {
    it('creates master record without admin:wf roles when user is not wildfire user', async () => {
      const result = AddAdministrativePenalty.createMaster(args, null, null, {});

      expect(result.read).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.write).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.issuedTo.read).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.issuedTo.write).toEqual(expect.not.arrayContaining(wfRole));
    });

    it('creates master record with admin:wf roles when user is wildfire user', async () => {
      const result = AddAdministrativePenalty.createMaster(wfArgs, null, null, {});

      expect(result.read).toEqual(expect.arrayContaining(wfRole));
      expect(result.write).toEqual(expect.arrayContaining(wfRole));
      expect(result.issuedTo.read).toEqual(expect.arrayContaining(wfRole));
      expect(result.issuedTo.write).toEqual(expect.arrayContaining(wfRole));
    });
  });

  describe('createNRCED', () => {
    it('creates NRCED record without admin:wf roles when user is not wildfire user', async () => {
      const result = AddAdministrativePenalty.createNRCED(args, null, null, {});

      expect(result.read).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.write).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.issuedTo.read).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.issuedTo.write).toEqual(expect.not.arrayContaining(wfRole));
    });

    it('creates NRCED record with admin:wf roles when user is wildfire user', async () => {
      const result = AddAdministrativePenalty.createNRCED(wfArgs, null, null, {});

      expect(result.read).toEqual(expect.arrayContaining(wfRole));
      expect(result.write).toEqual(expect.arrayContaining(wfRole));
      expect(result.issuedTo.read).toEqual(expect.arrayContaining(wfRole));
      expect(result.issuedTo.write).toEqual(expect.arrayContaining(wfRole));
    });
  });

  describe('createLNG', () => {
    it('creates LNG record without admin:wf roles when user is not wildfire user', async () => {
      const result = AddAdministrativePenalty.createLNG(args, null, null, {});

      expect(result.read).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.write).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.issuedTo.read).toEqual(expect.not.arrayContaining(wfRole));
      expect(result.issuedTo.write).toEqual(expect.not.arrayContaining(wfRole));
    });

    it('creates LNG record with admin:wf roles when user is wildfire user', async () => {
      const result = AddAdministrativePenalty.createLNG(wfArgs, null, null, {});

      expect(result.read).toEqual(expect.arrayContaining(wfRole));
      expect(result.write).toEqual(expect.arrayContaining(wfRole));
      expect(result.issuedTo.read).toEqual(expect.arrayContaining(wfRole));
      expect(result.issuedTo.write).toEqual(expect.arrayContaining(wfRole));
    });
  });
});
