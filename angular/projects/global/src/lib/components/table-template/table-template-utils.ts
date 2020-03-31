import { Injectable } from '@angular/core';
import { Router, Params } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import {
  TableObject,
  DEFAULT_TABLE_PAGE_SIZE,
  DEFAULT_TABLE_CURRENT_PAGE,
  DEFAULT_TABLE_SORT_BY,
  DEFAULT_TABLE_KEYWORDS
} from './table-object';

@Injectable()
export class TableTemplateUtils {
  constructor(private platformLocation: PlatformLocation, private router: Router) {}

  // Use this to change the query params, causes a window navigate.
  // Call this when you handle onSubmit()
  public updateUrl(tableObject: TableObject) {
    if (tableObject == null) {
      throw Error('Navigation Object cannot be null.');
    }

    let currentUrl = this.getBaseUrl();
    this.setPaginationInUrl(currentUrl, tableObject.currentPage, tableObject.pageSize);
    this.setKeywordsInUrl(currentUrl, tableObject.keywords);
    this.setSortByInUrl(currentUrl, tableObject.sortBy);
    this.setFilterInUrl(currentUrl, tableObject.filter);
    currentUrl += ';ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  public getBaseUrl(): string {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split(';')[0];
    return currentUrl;
  }

  public setPaginationInUrl(currentUrl: string, currentPage: number, pageSize: number) {
    currentUrl += `;currentPage=${currentPage || DEFAULT_TABLE_CURRENT_PAGE};pageSize=${pageSize ||
      DEFAULT_TABLE_PAGE_SIZE}`;
    return currentUrl;
  }

  public setKeywordsInUrl(currentUrl: string, keywords: string) {
    if (keywords) {
      currentUrl += `;keywords=${keywords}`;
    }
    return currentUrl;
  }

  public setSortByInUrl(currentUrl: string, sortBy: string) {
    if (sortBy) {
      currentUrl += `;sortBy=${sortBy}`;
    }
    return currentUrl;
  }

  public setFilterInUrl(currentUrl: string, filter: object) {
    if (filter && filter !== {}) {
      Object.keys(filter).forEach(key => {
        if (filter[key] === true || filter[key] === false) {
          currentUrl += `;${key}=${filter[key]}`;
        } else {
          currentUrl += `;${key}=`;
          filter[key].split(',').forEach(item => {
            currentUrl += `${item},`;
          });
          currentUrl = currentUrl.slice(0, -1);
        }
      });
    }
    return currentUrl;
  }

  public updateTableObjectWithUrlParams(routeParams: Params, tableObject: TableObject, filterFieldList: any[] = []) {
    tableObject.pageSize = +routeParams.pageSize || DEFAULT_TABLE_PAGE_SIZE;
    // tslint:disable-next-line: max-line-length
    tableObject.currentPage = +routeParams.currentPage || DEFAULT_TABLE_CURRENT_PAGE;
    tableObject.sortBy = routeParams.sortBy || DEFAULT_TABLE_SORT_BY;
    tableObject.keywords = routeParams.keywords || DEFAULT_TABLE_KEYWORDS;
    filterFieldList.map(field => {
      if (routeParams[field]) {
        tableObject.filter[field] = routeParams[field];
      }
    });

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
    params['dataset'] = tableObject.dataset;
    params['keywords'] = tableObject.keywords;
    params['currentPage'] = tableObject.currentPage;
    params['pageSize'] = tableObject.pageSize;
    params['filter'] = tableObject.filter;
    params['sortBy'] = tableObject.sortBy;
    return params;
  }
}
