const MineUtils = require('./mine-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('MineUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new MineUtils(null);
      })
      .toThrow('MineUtils - required recordType must be non-null.');

    });
  });

  describe('transformRecord', () => {
    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);
     expect(() => mineUtils.transformRecord(null, [])).toThrow('transformRecord - required mineRecord must be non-null.');
    });

    it('throws error if no commodityTypes provided', async () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);
      expect(() => mineUtils.transformRecord({}, null)).toThrow('transformRecord - required commodityTypes must be non-null.');
    });

    it('returns transformed Core record', () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);

      const coreRecord = { 
        mine_guid: 1,
        mine_name: 'test',
        mine_permit_numbers: ['1', '2'],
        mine_status: [
          {
            status_labels: [ 'testLabel' ]
          }
        ],
        mine_type: [],
        mine_tailings_storage_facilities: [ 'test', 'testing' ],
        mine_region: 'TE',
        coordinates: [ 123, 456 ],
        parties: [
          {
            mine_party_appt_type_code: 'PMT',
            party: {
              name: 'Test Party'
            }
          }
        ]
      };

      const expectedResult = {
        _schemaName: 'Mine',
        _sourceRefId: 1,
        dateAdded: expect.any(Date),
        dateUpdated: expect.any(Date),
        addedBy: 'SYSTEM_USER',
        updatedBy: 'SYSTEM_USER',
        sourceSystemRef: 'core',

        name: 'test',
        permitNumbers: ['1', '2'],
        status: 'testLabel',
        commodities: [],
        tailingsImpoundments: 2,
        region: 'TE',
        location: { type: 'Point', coordinates: [ 123, 456 ]},
        permittee: 'Test Party',
        type: '',
        summary: '',
        description: '',
        links: []
      };

      const result = mineUtils.transformRecord(coreRecord, []);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('getCommodities', () => {
    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);
     expect(() => mineUtils.getCommodities(null, [])).toThrow('getCommodities - required mineRecord and mineRecord.mine_type must be non-null.');
    });

    it('throws error if no commodityTypes provided', async () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);
     expect(() => mineUtils.getCommodities({}, null)).toThrow('getCommodities - required commodityTypes must be non-null.');
    });
  });


  describe('getLatestStatus', () => {
    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);
      expect(() => mineUtils.getLatestStatus(null)).toThrow('getLatestStatus - mineRecord must not be null.');
    });

    it('gets the latest status', () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);

      const mineRecord = {
        mine_status: [
          {
            status_labels: [  'test', 'label' ]
          },
          {
            status_labels: [ 'should', 'be', 'this' ]
          }
        ]
      };

      const result = mineUtils.getLatestStatus(mineRecord);

      expect(result).toEqual('should be this');
    })
  });

  describe('getParty', () => {
    it('throws error if no partyCode provided', async () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);
      expect(() => mineUtils.getParty(null, {})).toThrow('getParty - partyCode must not be null.');
    });

    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);
      expect(() => mineUtils.getParty('PMT', null)).toThrow('getParty - mineRecord must not be null.');
    });

    it('gets the correct party', () => {
      const mineUtils = new MineUtils(RECORD_TYPE.Mine);

      const mineRecord = {
        parties: [
          {
            mine_party_appt_type_code: 'POR',
            party: {
              name: 'Not Me'
            }
          },
          {
            mine_party_appt_type_code: 'PMT',
            party: {
              name: 'Find Me'
            }
          }
        ]
      };

      const result = mineUtils.getParty('PMT', mineRecord);

      expect(result).toEqual('Find Me');
    });
  });
});
