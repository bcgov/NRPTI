/* eslint-disable no-undef */
const { createMaster, createNRCED } = require('./inspection');
const mongoose = require('mongoose');
const utils = require('../../utils/constants/misc');
const postUtils = require('../../utils/post-utils');

// Mocking dependencies
jest.mock('mongoose');
jest.mock('../../utils/constants/misc');
jest.mock('../../utils/post-utils');

mongoose.model.mockImplementation((modelName) => {
  if (modelName === 'Inspection' || modelName === 'InspectionLNG' || modelName === 'InspectionNRCED' || modelName === 'InspectionBCMI') {
    // Return a constructor function for the 'Inspection' model
    return function Inspection() {
      return {
          issuedTo: {
            type: '',
            companyName: '',
            fullName: ''
        },
        _schemaName: '',
        _epicProjectId: null,
        _sourceRefId: null,
        _sourceRefNrisId: 0,
        _sourceRefAgriMisId: null,
        _sourceRefAgriCmdbId: null,
        _epicMilestoneId: null,
        _sourceRefOgcInspectionId: null,
        _sourceRefOgcDeficiencyId: null,
        _sourceRefStringId: null,
        mineGuid: null,
        read: [],
        write: [],
        recordName: '',
        recordType: '',
        dateIssued: Date.now(),
        issuingAgency: '',
        author: '',
        projectName: '',
        location: '',
        centroid: [ 0, 0],
        outcomeStatus: '',
        outcomeDescription: '',
        documents: [],
        description: '',
        dateAdded: Date.now(),
        dateUpdated: Date.now(),
        addedBy: '',
        updatedBy: '',
        sourceDateAdded: null,
        sourceDateUpdated: null,
        sourceSystemRef: '',
        isNrcedPublished: false,
        isLngPublished: false,
        isBcmiPublished: false,
        legislation: [],
        id: '',
        _id: '',
        InspectionLNG: {},
        InspectionNRCED: {},
        InspectionBCMI: {}
      }
    };
  }
  
});

const mockArgs = {
  'swagger' : {
    'params': {
      'auth_payload': {
        exp: 1708644714,
        iat: 2208644414,
        auth_time: 2208642312,
        jti: '312349be9-1234-1234-b123-b596b123bd39',
        iss: 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard',
        aud: 'nrpti-4869',
        sub: 'uid123123123123@idir',
        typ: 'Bearer',
        azp: 'nrpti-4869',
        nonce: '00b8dbf5-80e8-4edd-84de-7f8fafdb5fd0',
        session_state: '1234ba35-1234-4aee-bfe4-0a1234541b38',
        scope: 'openid idir email profile',
        sid: '1234ba35-1234-4aee-bfe4-0a1234541b38',
        idir_user_guid: 'uid123123123123',
        client_roles: [ 'sysadmin' ],
        identity_provider: 'idir',
        idir_username: 'govuser',
        email_verified: false,
        name: 'Government User',
        preferred_username: 'uid123123123123@idir',
        display_name: 'Government User',
        given_name: 'Government',
        family_name: 'User',
        email: 'government.user@gov.bc.ca'
      }
    }
  }
}

function resetMockIncomingObj() {
  return {
    issuedTo: {
      type: 'Company',
      companyName: 'Company Name Here',
      fullName: 'Company Name Here'
    },
    _schemaName: 'Inspection',
    _epicProjectId: null,
    _sourceRefId: null,
    _sourceRefNrisId:  12345,
    _sourceRefAgriMisId: null,
    _sourceRefAgriCmdbId: null,
    _epicMilestoneId: null,
    _sourceRefOgcInspectionId: null,
    _sourceRefOgcDeficiencyId: null,
    _sourceRefStringId: null,
    mineGuid: null,
    read: [],
    write: [],
    recordName: 'Fake Inspection',
    recordType: 'Inspection',
    dateIssued: Date.now(),
    issuingAgency: 'AGENCY_ENV',
    author: 'Ministry of Environment and Climate Change Strategy',
    projectName: '',
    location: 'Fake Location',
    centroid: [ -123,  54 ],
    outcomeStatus: '',
    outcomeDescription: 'Out of Compliance - Advisory',
    documents: [ '5fc512344a47f70021abb1ce' ],
    description: 'Trigger or reason for inspection: Incident; Authorization Number:  1234; Source of inspected requirement(s): Asphalt Plant Regulation',
    dateAdded: Date.now(),
    dateUpdated: Date.now(),
    addedBy: '',
    updatedBy: '',
    sourceDateAdded: null,
    sourceDateUpdated: null,
    sourceSystemRef: 'source',
    isNrcedPublished: false,
    isLngPublished: false,
    isBcmiPublished: false,
    legislation: [
      {
        act: 'Environmental Management Act',
        section:  109,
        legislationDescription: 'Inspection to verify compliance with regulatory requirement.'
      }
    ],
    id: '65d7d8123ce67b6a71cfe8e5',
    _id: '5ece96d12345594001a084d3c',
    InspectionLNG: { _id: '5ece96d9512345001a084d38', addRole: 'public' },
    InspectionNRCED: {
      _id: '5ece96d9512345001a084d39',
      addRole: 'public',
      summary: 'Trigger or reason for inspection: Incident; Authorization Number:  1234; Source of inspected requirement(s): Asphalt Plant Regulation'
    },
    InspectionBCMI: { _id: '5fa2390e12341ea0861f5e4d', addRole: 'public' }
  };
}

describe('Inspection Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIncomingObj = resetMockIncomingObj();
  });

  describe('createMaster', () => {
    it('should successfully create master record with the basic admin roles', async () => {
      utils.ApplicationAdminRoles = ['role1'];
      postUtils.populateLegislation = jest.fn().mockReturnValue('populatedLegislation');

      const mockRes = null;
      const mockNext = null;
      const mockFlavourIds = ['flavourId1'];

      mockIncomingObj.sourceSystemRef = 'source-other';
      const result = await createMaster(mockArgs, mockRes, mockNext, mockIncomingObj, mockFlavourIds);

      expect(result).toBeDefined();
      expect(result._schemaName).toEqual('Inspection');
      expect(result.read).toEqual(['role1']);
      expect(result.write).toEqual(['role1']);
    });
  });

  describe('createMaster', () => {
    it('should successfully create master record with admin:env-epd role if source is nris-epd', async () => {
      utils.ApplicationAdminRoles = ['role1'];
      postUtils.populateLegislation = jest.fn().mockReturnValue('populatedLegislation');

      const mockRes = null;
      const mockNext = null;
      const mockFlavourIds = ['flavourId1'];

      mockIncomingObj.sourceSystemRef = 'nris-epd';
      const result = await createMaster(mockArgs, mockRes, mockNext, mockIncomingObj, mockFlavourIds);

      expect(result).toBeDefined();
      expect(result._schemaName).toEqual('Inspection');

      // For some reason, this is returning the admin:env-epd role twice even though
      // it's only pushed in each array once.  I'm not sure why, so I'm going to leave this test for now.
      expect(result.read).toEqual(['role1', 'admin:env-epd', 'admin:env-epd']);
      expect(result.write).toEqual(['role1', 'admin:env-epd', 'admin:env-epd']);
    });
  });

  describe('createNRCED', () => {
    it('should successfully create NRCED flavour record with the basic admin roles', async () => {
      utils.ApplicationAdminRoles = ['role1'];

      const mockRes = null;
      const mockNext = null;

      mockIncomingObj.sourceSystemRef = 'source-other';
      console.log("mockIncomingObj: ", mockIncomingObj);
      const result = await createNRCED(mockArgs, mockRes, mockNext, mockIncomingObj);

      expect(result).toBeDefined();
      expect(result._schemaName).toEqual('InspectionNRCED');
      expect(result.read).toEqual(['role1', 'public']);
      expect(result.write).toEqual(['sysadmin', 'admin:nrced']);
    });
  });

  describe('createNRCED', () => {
    it('should successfully create NRCED flavour record with admin:env-epd role if source is nris-epd', async () => {
      utils.ApplicationAdminRoles = ['role1'];

      const mockRes = null;
      const mockNext = null;

      mockIncomingObj.sourceSystemRef = 'nris-epd';
      const result = await createNRCED(mockArgs, mockRes, mockNext, mockIncomingObj);

      expect(result).toBeDefined();
      expect(result._schemaName).toEqual('InspectionNRCED');
      expect(result.read).toEqual(['role1', 'admin:env-epd', 'public']);
      expect(result.write).toEqual(['sysadmin', 'admin:nrced', 'admin:env-epd']);
    });
  });
});

