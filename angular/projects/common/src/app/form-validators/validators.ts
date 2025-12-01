import { AbstractControl } from '@angular/forms';

/**
 * Validates a URL.
 *
 * @param {AbstractControl} control control whos value is a URL string
 * @returns {({ [key: string]: any } | null)}
 */
export const UrlValidator = (control: AbstractControl): { [key: string]: any } | null => {
  if (!control.value) {
    // empty urls are valid
    return null;
  }

  try {
    // will throw an error if url is invalid
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    new URL(control.value).href;
  } catch (error) {
    return { urlInvalid: true };
  }

  // url valid
  return null;
};
