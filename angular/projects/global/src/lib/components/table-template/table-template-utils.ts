import { Injectable } from '@angular/core';
import { Router, Params } from '@angular/router';
import {
  TableObject,
  DEFAULT_TABLE_PAGE_SIZE,
  DEFAULT_TABLE_CURRENT_PAGE,
  DEFAULT_TABLE_SORT_BY,
  DEFAULT_TABLE_KEYWORDS
} from './table-object';

@Injectable()
export class TableTemplateUtils {
  constructor(private router: Router) { }

  public updateTableObjectWithUrlParams(routeParams: Params, tableObject: TableObject) {
    tableObject.pageSize = +routeParams.pageSize || DEFAULT_TABLE_PAGE_SIZE;
    // tslint:disable-next-line: max-line-length
    tableObject.currentPage = +routeParams.currentPage || DEFAULT_TABLE_CURRENT_PAGE;
    tableObject.sortBy = routeParams.sortBy || DEFAULT_TABLE_SORT_BY;
    tableObject.keywords = routeParams.keywords || DEFAULT_TABLE_KEYWORDS;

    // TODO: Get fields from URL.

    return tableObject;
  }

  /**
   * Navigates using the current tableObject params and any optional additional params.
   *
   * Note: If duplicate parameters are found, the ones from tableOject will take precedence.
   *
   * @param {TableObject} tableObject table object where standard table template query parameters will be take from.
   * @param {any[]} path url path to navigate to.
   * @param {object} [additionalParams={}] additional query parameters to include. If duplicate parameters are found,
   *   the ones from tableOject will take precedence. (optional)
   * @memberof TableTemplateUtils
   */
  public navigateUsingParams(tableObject: TableObject, path: any[], additionalParams: object = {}) {
    if (!tableObject) {
      throw Error('Navigation Object cannot be null.');
    }

    if (!path || !path.length) {
      path = ['/'];
    }

    const params = this.getNavParamsObj(tableObject, additionalParams);
    path.push(params);
    this.router.navigate(path);
  }

  /**
   * Builds a query param object from the known table object params, and any optional additional params.
   *
   * @param {TableObject} tableObject table object where standard table template query parameters will be take from.
   * @param {object} [additionalParams={}] additional query parameters to include. If duplicate parameters are found,
   *   the ones from tableOject will take precedence. (optional)
   * @returns
   * @memberof TableTemplateUtils
   */
  public getNavParamsObj(tableObject: TableObject, additionalParams: object = {}) {
    const params = { ...additionalParams };
    params['ms'] = new Date().getMilliseconds();

    Object.keys(tableObject).forEach(item => {
      if (
        !tableObject ||
        tableObject[item] === undefined ||
        tableObject[item] === null ||
        tableObject[item].length === 0
      ) {
        // console.log('skipping:', item);
      } else {
        params[item] = tableObject[item];
      }
    });

    delete params['columns'];
    delete params['component'];
    delete params['options'];
    delete params['items'];
    delete params['totalListItems'];
    delete params['pageSizeOptions'];

    return params;
  }
}
