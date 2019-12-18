import { Type } from '@angular/core';
import { IPageSizePickerOption } from '../page-size-picker/page-size-picker.component';

export const DEFAULT_TABLE_PAGE_SIZE = 25;
export const DEFAULT_TABLE_PAGE_SIZE_OPTIONS: IPageSizePickerOption[] = [
  { displayText: '10', value: 10 },
  { displayText: '25', value: 25 },
  { displayText: '50', value: 50 },
  { displayText: '100', value: 100 },
  { displayText: 'All', value: Number.MAX_SAFE_INTEGER }
];
export const DEFAULT_TABLE_CURRENT_PAGE = 1;
export const DEFAULT_TABLE_SORT_BY = '';
export const DEFAULT_TABLE_KEYWORDS = '';
export const DEFAULT_TABLE_DATASET = '';
export const DEFAULT_TABLE_FILTER = {};

/**
 * The parameters used to define the header (<thead>) section of the table.
 *
 * @export
 * @interface IColumnObject
 */
export interface IColumnObject {
  /**
   * Column header name.
   *
   * @type {string}
   * @memberof IColumnObject
   */
  name?: string;
  /**
   * Column header data value which is emitted by the columnSort function.
   *
   * @type {string}
   * @memberof IColumnObject
   */
  value?: string;
  /**
   * Width of the column.
   *
   * @type {string}
   * @memberof IColumnObject
   */
  width?: string;
  /**
   * Disables column sorting, if set to true.
   *
   * @type {boolean}
   * @memberof IColumnObject
   */
  nosort?: boolean;
}
export interface ITableObjectParams {
  /**
   * Column definitions.
   *
   * @type {IColumnObject[]}
   * @memberof ITableObjectParams
   */
  columns?: IColumnObject[];
  /**
   * The component that is used to render the rows (<tr>) of the table.
   *
   * @type {Type<any>}
   * @memberof ITableObjectParams
   */
  component: Type<any>;
  // TODO populate dataset doc
  /**
   *
   *
   * @type {string}
   * @memberof ITableObjectParams
   */
  dataset?: string;
  /**
   * The current table page. Used for pagination.
   *
   * @type {number}
   * @memberof ITableObjectParams
   */
  currentPage?: number;
  // TODO populate filter doc
  /**
   *
   *
   * @type {*}
   * @memberof ITableObjectParams
   */
  filter?: any;
  /**
   * Array of table data items.
   *
   * @type {any[]}
   * @memberof ITableObjectParams
   */
  items?: any[];
  // TODO populate keywords doc
  /**
   *
   *
   * @type {string}
   * @memberof ITableObjectParams
   */
  keywords?: string;
  /**
   * The page size options for the page size picker.
   *
   * @type {IPageSizePickerOption[]}
   * @memberof ITableObjectParams
   */
  pageSizeOptions?: IPageSizePickerOption[];
  /**
   * The number of items (rows) to render.  Used for pagination.
   *
   * @type {number}
   * @memberof ITableObjectParams
   */
  pageSize?: number;
  /**
   * The table column to sort by.
   *
   * @type {string}
   * @memberof ITableObjectParams
   */
  sortBy?: string;
  /**
   * The total number of table data items.
   *
   * @type {number}
   * @memberof ITableObjectParams
   */
  totalListItems?: number;
}
/**
 * Main class that should contain all information needed to render a table, and handle pagination, sorting, etc.
 *
 * @export
 * @class TableObject
 */
export class TableObject {
  public columns: IColumnObject[];
  public component: Type<any>;
  public dataset: string;
  public currentPage: number;
  public filter: any;
  public items: any[];
  public keywords: string;
  public pageSizeOptions: IPageSizePickerOption[];
  public pageSize: number;
  public sortBy: string;
  public totalListItems: number;
  constructor(params: ITableObjectParams = { component: null }) {
    this.columns = (params && params.columns) || [];
    this.component = params && params.component;
    this.dataset = (params && params.dataset) || DEFAULT_TABLE_DATASET;
    this.currentPage = (params && params.currentPage) || DEFAULT_TABLE_CURRENT_PAGE;
    this.filter = (params && params.filter) || DEFAULT_TABLE_FILTER;
    this.items = (params && params.items) || [];
    this.keywords = (params && params.keywords) || DEFAULT_TABLE_KEYWORDS;
    this.pageSizeOptions = (params && params.pageSizeOptions) || DEFAULT_TABLE_PAGE_SIZE_OPTIONS;
    this.pageSize = (params.pageSize && params.pageSize) || DEFAULT_TABLE_PAGE_SIZE;
    this.sortBy = (params && params.sortBy) || DEFAULT_TABLE_SORT_BY;
    this.totalListItems = (params && params.totalListItems) || 0;
  }
}
