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

export class EpicProjectIds {
  public static readonly lngCanadaId = '588511c4aaecd9001b825604';
  public static readonly coastalGaslinkId = '588510cdaaecd9001b815f84';
}

/**
 * Note: Picklist values should be alphabetical (A -> Z).  The only exception is with catch-all values like 'None' -
 * which should always be at the start, and 'Other' - which should always be at the end.
 *
 * @export
 * @class Picklists
 */
export class Picklists {
  public static readonly orderSubtypePicklist = ['None', 'Cease', 'Remedy', 'Stop Work', 'Other'];
  public static readonly permitSubtypePicklist = ['Ancillary Site', 'General', 'Investigative Use', 'Road', 'Water'];
  public static readonly certificateSubtypePicklist = [
    'Amendment',
    'General',
    'Project Conditions',
    'Project Description',
    'Other'
  ];

  public static readonly agencyPicklist = [
    'Agricultural Land Commission',
    'BC Oil and Gas Commission',
    'BC Parks',
    'BC Wildfire Service',
    'Climate Action Secretariat',
    'Conservation Officer Service (COS)',
    'Environmental Assessment Office',
    'Environmental Protection Division',
    'LNG Secretariat',
    'Ministry of Agriculture',
    'Ministry of Energy, Mines and Petroleum Resources',
    'Ministry of Forests, Lands, Natural Resource Operations and Rural Development',
    'Natural Resource Officers (NRO)'
  ];

  public static readonly authorPicklist = ['BC Government', 'Proponent', 'Other'];

  public static readonly outcomeStatusPicklist = ['Closed', 'Open'];
}
