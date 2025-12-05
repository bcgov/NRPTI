'use strict';

const moment = require('moment');
const winston = require('winston');

/**
 * Centralized logger that uses Winston 2.x.
 *
 * Note:
 * updating to 3.x will require code changes.
 *
 * Usage:
 * const log = require('./logger')('my label')
 * log.info('Some info!')
 * log.error('An error:', error)
 * ...etc
 *
 * Example Output:
 * [15-09-2019 14:44:30] [info] (my label): Some info!
 * [02-12-2019 14:45:02] [error] (my label): An error: 404 Not Found
 * ...etc
 *
 * Note:
 * If you wish to print an object, you must JSON.stringify() it first.
 *
 * Valid LOG_LEVEL (from least logging to most logging):
 * error, warn, info, debug
 *
 * Default LOG_LEVEL if non specified:
 * info
 */

/**
 * Get or create a logger for the given logLabel.
 *
 * @param {*} logLabel label for the logger.
 * @returns
 */
const getLogger = function (logLabel) {
  return winston.loggers.get(logLabel || 'default', {
    transports: [
      new winston.transports.Console({
        level: process.env.LOG_LEVEL || 'info',
        label: logLabel || '',
        formatter: info => {
          return `[${moment().format('DD-MM-YYYY HH:mm:ss')}] [${info.level}] (${info.label}): ${info.message}`;
        }
      })
    ]
  });
};

module.exports = label => getLogger(label);
