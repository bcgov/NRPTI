/**
 * Defines a single text filter.
 *
 * @export
 * @class TextFilter
 */
export class TextFilter {
  displayName: string;
  fieldName: string;
  documentFieldName: string;
  documentFieldValues: string[] = [];

  constructor(obj?: any) {
    this.displayName = (obj && obj.displayName) || null;
    this.fieldName = (obj && obj.fieldName) || null;
    this.documentFieldName = (obj && obj.documentFieldName) || null;

    if (obj && obj.documentFieldValues && obj.documentFieldValues.length) {
      this.documentFieldValues = obj.documentFieldValues;
    } else {
      this.documentFieldValues = [];
    }
  }
}

/**
 * Defines a filter panel section, which can contain many filters.
 *
 * @export
 * @class FilterSection
 */
export class FilterSection {
  displayName: string;
  textFilters: TextFilter[] = [];

  constructor(obj?: any) {
    this.displayName = (obj && obj.displayName) || null;

    if (obj && obj.textFilters && obj.textFilters.length) {
      for (const textFilter of obj.textFilters) {
        this.textFilters.push(new TextFilter(textFilter));
      }
    }
  }
}
