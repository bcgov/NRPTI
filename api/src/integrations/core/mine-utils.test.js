const MineUtils = require('./mine-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('MineUtils', () => {
  describe('constructor', () => {
    it('throws an error if no recordType provided', () => {
      expect(() => {
        new MineUtils({}, null);
      })
      .toThrow('MineUtils - required recordType must be non-null.');

    });
  });

  describe('transformRecord', () => {
    it('throws error if no mineRecord provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.transformRecord(null, [])).toThrow('transformRecord - required mineRecord must be non-null.');
    });

    it('throws error if no commodityTypes provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.transformRecord({}, null)).toThrow('transformRecord - required commodityTypes must be non-null.');
    });

    it('returns transformed Core record', () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      const coreRecord = { 
        mine_guid: 1,
        mine_name: 'test',
        mine_permit_numbers: 'test',
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
        location: { type: 'Point', coordinates: [ 123, 456 ]},
        permittee: '',
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
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
     expect(() => mineUtils.getCommodities(null, [])).toThrow('getCommodities - required mineRecord and mineRecord.mine_type must be non-null.');
    });

    it('throws error if no commodityTypes provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
     expect(() => mineUtils.getCommodities({}, null)).toThrow('getCommodities - required commodityTypes must be non-null.');
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
            status_labels: [  'test', 'label' ]
          },
          {
            status_labels: [ 'should', 'be', 'this' ]
          }
        ]
      };

      const result = mineUtils.getLatestStatus(mineRecord);

      expect(result).toEqual('test label');
    })
  });

  describe('getParty', () => {
    it('throws error if no partyCode provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.getParty(null, {})).toThrow('getParty - partyCode must not be null.');
    });

    it('throws error if no parties provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.getParty('PMT', {}, null)).toThrow('getParty - parties must not be null.');
    });

    it('throws error if no permit provided', async () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      expect(() => mineUtils.getParty('PMT', null, {})).toThrow('getParty - permit must not be null.');
    });

    it('gets the correct party', () => {
      const mineUtils = new MineUtils({}, RECORD_TYPE.MineBCMI);
      const permit = { _sourceRefId: 'test' };
      const parties = [
        {
          mine_party_appt_type_code: 'POR',
          related_guid: 'notRight',
          party: {
            name: 'Not Me'
          }
        },
        {
          mine_party_appt_type_code: 'PMT',
          related_guid: 'test',
          party: {
            name: 'Find Me'
          }
        }
    ];

      const result = mineUtils.getParty('PMT', permit, parties);

      expect(result).toEqual('Find Me');
    });
  });
});
