'use strict';

const axios = require('axios');

/**
 * Performs an HTTP get request against the provided URL.
 *
 * @async
 * @param {URL} url a URL object (see https://nodejs.org/api/url.html#url_url)
 * @returns {Promise<any>} promise that resolves with the data property of the response object, or null.
 * @throws {Error} if any errors occur, or necessary function calls fail.
 */
exports.getRecords = async function(url) {
  let response;

  try {
    response = await axios.get(url.href);
  } catch (error) {
    throw Error(`getRecords - error: ${error.message}.`);
  }

  if (!response) {
    throw Error(`getRecords - returned null response.`);
  }

  if (response.status !== 200) {
    throw Error(`getRecords - returned non-200 status: ${response.status}.`);
  }

  return response.data;
};
