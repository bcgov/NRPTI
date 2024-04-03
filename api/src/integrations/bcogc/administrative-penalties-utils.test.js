const AdministrativePenalty = require('./administrative-penalties-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');
const { createURLDocument } = require('../../controllers/document-controller');
const { getActTitleFromDB } = require('../../controllers/acts-regulations-controller')
const { energyActCode } = require('../../utils/constants/legislation-code-map.js');

const actName = getActTitleFromDB(energyActCode);

const createAdminPenaltyInstance = (authPayload, recordType, baseCsvRow) => {
  return new AdministrativePenalty(authPayload, recordType, baseCsvRow);
};

describe('AdministrativePenalty', () => {
  let authPayload;
  let baseCsvRow;

  beforeEach(() => {
    authPayload = 'authPayload';
    baseCsvRow = {
      'Title': '123',
      'author': 'AGENCY_OGC',
      'issuingAgency': 'AGENCY_OGC',
      'recordName': 'record name',
      'Date Issued': '11-07-2023',
      'Proponent': 'Proponent',
      'Filename': 'Filename',
      'File URL': 'File URL',
    };
  
    // eslint-disable-next-line no-undef
    generateExpectedResult = (penalties) => {
      return {
        'recordType': 'Administrative Penalty',
        '_sourceRefOgcPenaltyId': baseCsvRow['Title'],
        'author': 'AGENCY_OGC',
        'issuingAgency': 'AGENCY_OGC',
        'recordName': baseCsvRow['Title'],
        'dateIssued': new Date(baseCsvRow['Date Issued']),
        'location': 'British Columbia',
        'penalties': [penalties],
        'legislation': [
          {
            'act': actName,
            'section': 63,
            'offence': 'Penalty for failure to comply with the Act or associated regulations'
          }
        ],
        'issuedTo': {
          'type': 'Company',
          'companyName': baseCsvRow['Proponent']
        },
        'document': {
          'fileName': 'Filename',
          'url': 'File URL',
        },
        'sourceSystemRef': 'bcogc'
      };
    };
  });

  describe('constructor', () => {
    it('should set auth_payload, recordType, and csvRow', () => {
      const auth_payload = 'authPayload';
      const recordType = RECORD_TYPE.AdministrativePenalty._schemaName;
      const csvRow = 'csvRow';
      const dataSource = new AdministrativePenalty(auth_payload, recordType, csvRow);
      expect(dataSource.auth_payload).toEqual(auth_payload);
      expect(dataSource.recordType).toEqual('AdministrativePenalty');
      expect(dataSource.csvRow).toEqual(csvRow);
    });
    it('should throw an error if the constructor is called without all required parameters', () => {
      expect(() => {
        new AdministrativePenalty();
      }).toThrow('BaseRecordUtils - required recordType must be non-null');
    });
  });

  describe('transformRecord', () => {
    let administrativePenalty;

    beforeEach(() => {
      administrativePenalty = createAdminPenaltyInstance(authPayload, RECORD_TYPE.AdministrativePenalty._schemaName, baseCsvRow);
    });

    it('throws error if no csvRow provided', () => {
      expect(() => { administrativePenalty.transformRecord(null) }).toThrow('transformRecord - required csvRow must be non-null.');
    });
  
    it('returns transformed csvRow record with the penalties in dollars', () => {
      baseCsvRow['Penalty Amount (CAD)'] = '$123';
      // eslint-disable-next-line no-undef
      const expectedResult = generateExpectedResult({
        type: 'Fined',
        penalty: {
          type: 'Dollars',
          value: 123
        },
        description: ''
      });
  
      const result = administrativePenalty.transformRecord(baseCsvRow);
  
      expect(result).toEqual(expectedResult);
    });
  
    it('returns transformed csvRow record with contravention but no penalty assessed', () => {
      baseCsvRow['Penalty Amount (CAD)'] = '$0';
      // eslint-disable-next-line no-undef
      const expectedResult = generateExpectedResult({
        type: '',
        penalty: null,
        description: 'Although a contravention occurred, a penalty was not assessed. See the attached document for additional details.'
      });

      const result = administrativePenalty.transformRecord(baseCsvRow);
  
      expect(result).toEqual(expectedResult);
    });
  
    it('returns transformed csvRow record with no contravention and no penalty assessed', () => {
      baseCsvRow['Penalty Amount (CAD)'] = '';
      // eslint-disable-next-line no-undef
      const expectedResult = generateExpectedResult({
        type: '',
        penalty: null,
        description: 'No contravention was found to have occurred, and no penalty was assessed. See the attached document for additional details.'
      });

      const result = administrativePenalty.transformRecord(baseCsvRow);
  
      expect(result).toEqual(expectedResult);
    });
  });

  
  describe('it creates an item', () => {
    let administrativePenalty;

    beforeEach(() => {
      administrativePenalty = createAdminPenaltyInstance(authPayload, RECORD_TYPE.AdministrativePenalty._schemaName, baseCsvRow);
    });

    const mongoose = require('mongoose');
    const Document = require ('../../models/document');
    const utils = require('../../utils/constants/misc');
    const mongo = 'mongodb://127.0.0.1/nrpti-testing'
    mongoose.connect(mongo);

    beforeAll(async () => {
      await Document.remove({});
    });
    
    beforeEach(async () => {
      await Document.remove({});
    });

    afterAll(async () => {
      mongoose.connection.db.dropDatabase();
      await mongoose.connections.close();
    });

    jest.fn('../../controllers/document-controller', () => ({
      createURLDocument: jest.fn((fileName, addedBy, url, readRoles = [], writeRoles = []) => {
        const Document = mongoose.model('Document');
        let document = new Document();

        document.fileName = fileName;
        document.addedBy = addedBy;
        document.url = url;
        document.read = [utils.ApplicationRoles.ADMIN, ...readRoles];
        document.write = [utils.ApplicationRoles.ADMIN, ...writeRoles];;

        return document.save();
      })
    }));

    it('throws error when nrptiRecord is not provided', async () => {
      await expect(administrativePenalty.createItem(null)).rejects.toThrow(
        'createItem - required nrptiRecord must be non-null.'
      );
    });

    it('creates a document', async () => {
      baseCsvRow['Penalty Amount (CAD)'] = '$123';
      const nrptiRecord = await administrativePenalty.transformRecord(baseCsvRow);

      const result = await createURLDocument(nrptiRecord.document.fileName, 'BCOGC Import', nrptiRecord.document.url, ['public'])
      const resultRead = [...result.read];
      const resultWrite = [...result.write];

      expect(result.fileName).toEqual('Filename')
      expect(result.url).toEqual('File URL')
      expect(result.addedBy).toEqual('BCOGC Import')
      expect(resultRead).toEqual(['sysadmin', 'public'])
      expect(resultWrite).toEqual(['sysadmin'])
    });
  });

  describe('it finds an existing item', () => {
    let administrativePenalty;

    beforeEach(() => {
      administrativePenalty = createAdminPenaltyInstance(authPayload, RECORD_TYPE.AdministrativePenalty._schemaName, baseCsvRow);
    });

    const mongoose = require('mongoose');
    const AdminPenalty = require ('../../models/master/administrativePenalty');
    const utils = require('../../utils/constants/misc');
    const mongo = 'mongodb://127.0.0.1/nrpti-testing'
    mongoose.connect(mongo);

    beforeAll(async () => {
      await AdminPenalty.remove({});
    });
    
    beforeEach(async () => {
      await AdminPenalty.remove({});
    });

    afterAll(async () => {
      mongoose.connection.db.dropDatabase();
      await mongoose.connections.close();
    });

    jest.fn('../../controllers/document-controller', () => ({
      createURLDocument: jest.fn((fileName, addedBy, url, readRoles = [], writeRoles = []) => {
        const Document = mongoose.model('Document');
        let document = new Document();

        document.fileName = fileName;
        document.addedBy = addedBy;
        document.url = url;
        document.read = [utils.ApplicationRoles.ADMIN, ...readRoles];
        document.write = [utils.ApplicationRoles.ADMIN, ...writeRoles];;

        return document.save();
      })
    }));

    it('finds any existing records', async () => {
        baseCsvRow['Penalty Amount (CAD)'] = '$123';
    
        const nrptiRecord = await administrativePenalty.transformRecord(baseCsvRow);
    
        const mockRecord = { _schemaName: 'AdministrativePenalty', _sourceRefOgcPenaltyId: nrptiRecord._sourceRefOgcPenaltyId };
    
        const masterRecordModel = mongoose.model(RECORD_TYPE.AdministrativePenalty._schemaName);
    
        const findOneMock = jest.spyOn(masterRecordModel, 'findOne').mockResolvedValue(mockRecord);
    
        const result = await masterRecordModel.findOne({
          _schemaName: RECORD_TYPE.AdministrativePenalty._schemaName,
          _sourceRefOgcPenaltyId: nrptiRecord._sourceRefOgcPenaltyId,
        });
    
        expect(findOneMock).toHaveBeenCalledWith({
          _schemaName: RECORD_TYPE.AdministrativePenalty._schemaName,
          _sourceRefOgcPenaltyId: nrptiRecord._sourceRefOgcPenaltyId,
        });
        expect(result).toMatchObject(mockRecord);
        expect(result._schemaName).toEqual('AdministrativePenalty');
    });
  });
});
