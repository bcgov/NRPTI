/**
 * @summary service for accessing issuing agencies.
 * @description the service provides methods for getting agency codes and names from ApplicationAgencyService.
 * @class AgencyDataService
 */

import { FactoryService } from '../../../../public-nrpti/src/app/services/factory.service';

/**
 * @class
 * @description Service for accessing issuing agencies from ApplicationAgencyService.
 */
export class ActDataServiceNRCED {
  /**
   * @constructor
   * @param {FactoryService} factoryService - the factory service for accessing application agency data.
   */
  constructor(private factoryService: FactoryService) {}

  /**
   * Get all Acts and Regulations
   * @returns {[string: string]}
   */

  getAllActsAndRegulations() {
    const actService = this.factoryService.actService;
    const actsRegulationsData = actService ? actService.getAllActsAndRegulations() : null;
    if (actsRegulationsData) {
      const actsRegulationsMap = Object.keys(actsRegulationsData).reduce((acc, key) => {
        const { actName, regulations } = actsRegulationsData[key];
        acc[actName] = regulations;
        return acc;
      }, {});
      return actsRegulationsMap;
    } else {
      return {};
    }
  }

  /**
   * Get the full name of the agency based on the agency's code
   * retrieved from the agency data using the FactoryService.
   * @param {string} actCode - an agency's code
   * @returns {string} - the agency's full name
   */
  displayActTitleFull(actCode): string {
    // Access cached act data from FactoryService
    const actService = this.factoryService.actService;
    const actsRegulationsMap = actService ? actService.getAllActsAndRegulations() : null;
    return actsRegulationsMap && actsRegulationsMap[actCode] ? actsRegulationsMap[actCode]['actName'] : actCode;
  }

  /**
   * Get the intermediate act code based on the full act name
   * retrieved from the act data using the FactoryService.
   * @param {string} actTitle - an act's full name
   * @returns {string} - the act's itermediate code else null if no code can be found
   */
  getCodeFromTitle(actTitle): string {
    const actService = this.factoryService.actService;
    const actsRegulationsData = actService ? actService.getAllActsAndRegulations() : {};
    for (const [actCode, actDetails] of Object.entries(actsRegulationsData)) {
      if (actDetails['actName'] === actTitle) {
        return actCode;
      }
    }
    return null;
  }
}
