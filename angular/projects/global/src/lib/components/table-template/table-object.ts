import { Type } from '@angular/core';
import { IPageSizePickerOption } from '../page-size-picker/page-size-picker.component';
import { TableRowComponent } from './table-row-component';

export const DEFAULT_TABLE_OPTIONS: ITableOptions = {
  showHeader: true,
  showPagination: true,
  showPageSizePicker: true,
  showPageCountDisplay: true
};
export const DEFAULT_TABLE_PAGE_SIZE = 25;
export const DEFAULT_TABLE_PAGE_SIZE_OPTIONS: IPageSizePickerOption[] = [
  { displayText: '10', value: 10 },
  { displayText: '25', value: 25 },
  { displayText: '50', value: 50 },
  { displayText: '100', value: 100 }
];
export const DEFAULT_TABLE_CURRENT_PAGE = 1;
export const DEFAULT_TABLE_SORT_BY = '';
export const DEFAULT_TABLE_KEYWORDS = '';
export const DEFAULT_TABLE_DATASET = '';

/**
 * Miscellaneous table options.
 *
 * @export
 * @interface ITableOptions
 */
export interface ITableOptions {
  /**
   * Whether or not to render the table header (<thead>) section of the table (default: true).
   *
   * @type {boolean}
   * @memberof ITableOptions
   */
  showHeader?: boolean;
  /**
   * Whether or not to render the table pagination control (default: true).
   *
   * @type {boolean}
   * @memberof ITableOptions
   */
  showPagination?: boolean;
  /**
   * Whether or not to render the table page size picker (# of records per page) control (default: true).
   *
   * @type {boolean}
   * @memberof ITableOptions
   */
  showPageSizePicker?: boolean;
  /**
   * Whether or not to render the table page count display (`showing 1 - 10 of 20 records`) control (default: true).
   *
   * @type {boolean}
   * @memberof ITableOptions
   */
  showPageCountDisplay?: boolean;
}

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

/**
 * The parameters used to render a row of the table.
 *
 * @export
 * @interface IRowObject
 */
export interface IRowObject {
  /**
   * Data used when rendering this row.
   *
   * @type {*}
   * @memberof IRowObject
   */
  rowData?: any;
  /**
   * The component used to render this row.
   *
   * @type {Type<TableRowComponent>}
   * @memberof IRowObject
   */
  component?: Type<TableRowComponent>;
}

/**
 * All parameters used by the table template component.
 *
 * @export
 * @interface ITableObjectParams
 */
export interface ITableObjectParams {
  /**
   * Misc table options.
   *
   * @type {ITableOptions}
   * @memberof ITableObjectParams
   */
  options?: ITableOptions;
  /**
   * Component to render for each row.
   *
   * Note: This is overridden by IRowObject.component if set, on a row-by-row basis.
   *
   * @type {Type<TableRowComponent>}
   * @memberof ITableObjectParams
   */
  component?: Type<TableRowComponent>;
  /**
   * Column definitions.
   *
   * @type {IColumnObject[]}
   * @memberof ITableObjectParams
   */
  columns?: IColumnObject[];
  /**
   * Array of table row objects.
   *
   * @type {IRowObject[]}
   * @memberof ITableObjectParams
   */
  items?: IRowObject[];
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
  public options: ITableOptions;
  public component: Type<TableRowComponent>;
  public columns: IColumnObject[];
  public items: IRowObject[];
  public dataset: string;
  public currentPage: number;
  public keywords: string;
  public pageSizeOptions: IPageSizePickerOption[];
  public pageSize: number;
  public sortBy: string;
  public totalListItems: number;
  constructor(params?: ITableObjectParams) {
    this.options = (params && params.options) || DEFAULT_TABLE_OPTIONS;
    this.component = (params && params.component) || null;
    this.columns = (params && params.columns) || [];
    this.items = (params && params.items) || [];
    this.dataset = (params && params.dataset) || DEFAULT_TABLE_DATASET;
    this.currentPage = (params && params.currentPage) || DEFAULT_TABLE_CURRENT_PAGE;
    this.keywords = (params && params.keywords) || DEFAULT_TABLE_KEYWORDS;
    this.pageSizeOptions = (params && params.pageSizeOptions) || DEFAULT_TABLE_PAGE_SIZE_OPTIONS;
    this.pageSize = (params && params.pageSize) || DEFAULT_TABLE_PAGE_SIZE;
    this.sortBy = (params && params.sortBy) || DEFAULT_TABLE_SORT_BY;
    this.totalListItems = (params && params.totalListItems) || 0;
  }
}
