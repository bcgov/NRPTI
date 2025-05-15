/**
 * Activity feed types, used by the html to determine which material icons to render.
 * Enum string value should be the string value of a valid material icon.
 *
 * @export
 * @enum {string}
 */
export enum ActivityTypes {
  // General catch all icon
  INFO = 'info',

  // New document added
  DOCUMENT_ADDED = 'attach_file',

  // New report added
  REPORT_ADDED = 'description',

  // New authorization added
  AUTHORIZATION_ADDED = 'done_outline',

  // Inspection complete
  INSPECTION_COMPLETE = 'assignment',

  // Enforcement action
  ENFORCEMENT_ACTION = 'warning',

  // Upcoming/important date
  IMPORTANT_DATE = 'insert_invitation'
}
