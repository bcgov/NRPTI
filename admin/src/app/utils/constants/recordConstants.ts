import { ICodeSet, ICodeGroup } from './constantInterfaces';

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
