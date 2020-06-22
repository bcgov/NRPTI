'use strict';

/**
 * This file contains general purpose utility functions.
 */

const moment = require('moment');

/**
 * Creates a formatted date from the dateString and dateFormat.
 *
 * @param {*} dateString
 * @param {*} dateFormat
 * @returns the formatted date, or null if invalid dateString or dateFormat provided.
 */
exports.parseDate = function(dateString, dateFormat) {
  if (!dateString || !dateFormat) {
    return null;
  }

  const date = moment(dateString, dateFormat);

  if (!date.isValid()) {
    return null;
  }

  return date.toDate();
};
