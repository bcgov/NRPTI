const ManagementPlans = require('./management-plans-utils');
const RECORD_TYPE = require('../../utils/constants/record-type-enum');

describe('ManagementPlans', () => {
  describe('transformRecord', () => {
    it('transforms an epic management plan record correctly', async () => {
      const epicRecord =  {'recordName': 'test abc'}
      const managementPlans = new ManagementPlans({}, RECORD_TYPE.ManagementPlan);
      const transformedRecord = await managementPlans.transformRecord(epicRecord);

      expect(transformedRecord.issuingAgency).toEqual('AGENCY_EAO');
    });

    it('throws an error if epic record is not provided', async () => {
      const managementPlans = new ManagementPlans({}, RECORD_TYPE.ManagementPlan);
      await expect(managementPlans.transformRecord(null)).rejects.toThrow('transformRecord - required record must be non-null.');
    });
  });
});
