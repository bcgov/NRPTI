const MineUtils = require('./mine-utils');
const BaseRecordUtils = require('./base-record-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('MineUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new MineUtils({}, null);
      }).toThrow('MineUtils - required recordType must be non-null.');
    });

    it('creats an instance of Mines', () => {
      const mockMines = {
        auth_payload: 'super_auth_payload',
        recordType: {
          _schemaName: 'MineBCMI',
          displayName: 'MineBCMI',
          recordControllerName: 'mines',
          flavours: {}
        }
      };
      const mineUtils = new MineUtils('super_auth_payload', RECORD_TYPE.MineBCMI);
      expect(mineUtils).toEqual(mockMines);
    });
  });

  describe('transformRecord', () => {
    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.transformRecord(null, [])).toThrow(
        'transformRecord - required mineRecord must be non-null.'
      );
    });

    it('throws error if no commodityTypes provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.transformRecord({}, null)).toThrow(
        'transformRecord - required commodityTypes must be non-null.'
      );
    });

    it('returns transformed Core record', () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      const coreRecord = {
        mine_guid: 1,
        mine_name: 'test',
        mine_permit_numbers: 'test',
        mine_status: [
          {
            status_labels: ['testLabel']
          }
        ],
        mine_type: [],
        mine_tailings_storage_facilities: ['test', 'testing'],
        mine_region: 'TE',
        coordinates: [123, 456],
        parties: [
          {
            mine_party_appt_type_code: 'PMT',
            related_guid: 'test',
            party: {
              name: 'Test Party'
            }
          }
        ]
      };

      const expectedResult = {
        _schemaName: 'MineBCMI',
        _sourceRefId: 1,
        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        addedBy: undefined,
        updatedBy: undefined,
        sourceSystemRef: 'core',

        name: 'test',
        permitNumber: '',
        permit: null,
        status: 'testLabel',
        commodities: [],
        tailingsImpoundments: 2,
        region: 'TE',
        location: { type: 'Point', coordinates: [123, 456] },
        permittee: ''
      };

      const result = mineUtils.transformRecord(coreRecord, []);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCommodities', () => {
    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.getCommodities(null, [])).toThrow(
        'getCommodities - required mineRecord and mineRecord.mine_type must be non-null.'
      );
    });

    it('throws error if no commodityTypes provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.getCommodities({}, null)).toThrow(
        'getCommodities - required commodityTypes must be non-null.'
      );
    });

    it('gets the commodities', () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      const commodityTypes = [
        {
          mine_commodity_code: '12345',
          description: 'Metallurgic'
        }
      ];

      const coreRecord = {
        mine_guid: 1,
        mine_name: 'test',
        mine_permit_numbers: 'test',
        mine_status: [
          {
            status_labels: ['testLabel']
          }
        ],
        mine_type: [
          {
            mine_type_detail: [
              {
                mine_commodity_code: '12345'
              }
            ]
          }
        ],
        mine_tailings_storage_facilities: ['test', 'testing'],
        mine_region: 'TE',
        coordinates: [123, 456],
        parties: [
          {
            mine_party_appt_type_code: 'PMT',
            related_guid: 'test',
            party: {
              name: 'Test Party'
            }
          }
        ]
      };

      const commodity = mineUtils.getCommodities(coreRecord, commodityTypes);

      expect(commodity).toEqual(['Metallurgic']);
    });
  });

  describe('getLatestStatus', () => {
    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.getLatestStatus(null)).toThrow('getLatestStatus - mineRecord must not be null.');
    });

    it('gets the latest status', () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);

      const mineRecord = {
        mine_status: [
          {
            status_labels: ['test', 'label']
          },
          {
            status_labels: ['should', 'be', 'this']
          }
        ]
      };

      const result = mineUtils.getLatestStatus(mineRecord);

      expect(result).toEqual('test label');
    });
  });

  describe('addPermitToRecord', () => {
    it('returns the mineRecord with permit info', () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);

      const mineRecord = {
        _schemaName: 'MineBCMI',
        _sourceRefId: 1,
        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        addedBy: undefined,
        updatedBy: undefined,
        sourceSystemRef: 'core',

        name: 'test',
        permitNumber: '',
        permit: null,
        status: 'testLabel',
        commodities: [],
        tailingsImpoundments: 2,
        region: 'TE',
        location: { type: 'Point', coordinates: [123, 456] },
        permittee: ''
      };

      const permitInfo = {
        permitNumber: '12345',
        permittee: 'Test Permittee'
      };

      const record = mineUtils.addPermitToRecord(mineRecord, permitInfo);

      expect(record.permitNumber).toEqual('12345');
      expect(record.permittee).toEqual('Test Permittee');
    });
  });

  describe('updateRecord', () => {
    it('calls the updateRecord function', async () => {
      const superUpdateRecordMock = jest.spyOn(BaseRecordUtils.prototype, 'updateRecord');
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);

      const nrptiRecord = {
        _schemaName: 'MineBCMI',
        _sourceRefId: 1,
        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        addedBy: undefined,
        updatedBy: undefined,
        sourceSystemRef: 'core',

        name: 'test',
        permitNumber: '',
        permit: null,
        status: 'testLabel',
        commodities: [],
        tailingsImpoundments: 2,
        region: 'TE',
        location: { type: 'Point', coordinates: [123, 456] },
        permittee: ''
      };

      const existingRecord = {
        _schemaName: 'MineBCMI',
        _sourceRefId: 1,
        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        addedBy: undefined,
        updatedBy: undefined,
        sourceSystemRef: 'core',

        name: 'test',
        permitNumber: '',
        permit: null,
        status: 'testLabel',
        commodities: [],
        tailingsImpoundments: 2,
        region: 'TE',
        location: { type: 'Point', coordinates: [123, 456] },
        permittee: ''
      };

      const permitInfo = {
        permitNumber: '12345',
        permittee: 'Test Permittee'
      };

      await mineUtils.updateRecord(nrptiRecord, permitInfo, existingRecord);

      expect(superUpdateRecordMock).toHaveBeenCalledTimes(1);
    });
  });
});
