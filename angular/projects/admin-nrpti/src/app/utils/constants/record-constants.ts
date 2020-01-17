import { ICodeSet, ICodeGroup } from './constant-interfaces';

/**
 * Demo codes.
 *
 * @export
 * @class DemoCodes
 * @implements {ICodeSet}
 */
export class DemoCodes implements ICodeSet {
  public static readonly BUILD_COMPLETE: ICodeGroup = {
    code: 'COMPLETE',
    param: 'BC',
    text: { long: 'Construction Completed', short: 'Complete' },
    mappedCodes: ['Demo', 'Example', 'Constructed', 'Built', 'Building Finished']
  };

  /**
   * @inheritdoc
   * @memberof DemoCodes
   */
  public getCodeGroups(): ICodeGroup[] {
    return [DemoCodes.BUILD_COMPLETE];
  }
}

export class Picklists {
  public static readonly orderSubtypesPicklist = [
    'Cease',
    'Remedy',
    'Stop Work',
    'None',
    'Other'
  ];

  public static readonly agenciesPicklist = [
    'Environmental Assessment Office',
    'BC Oil and Gas Commission',
    'Agricultural Land Commission',
    'Ministry of Agriculture',
    'Ministry of Environment',
    'Ministry of Energy, Mines and Petroleum Resources',
    'LNG Secretariat',
    'Conservation Officer Service (COS)',
    'Natural Resource Officers (NRO)',
    'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
    'BC Parks',
    'Environmental Protection Division'
  ];

  public static readonly authorPicklist = [
    'BC Government',
    'Proponent',
    'Other',
  ];

  public static readonly outcomeStatusPicklist = [
    'Open',
    'Closed'
  ];
}