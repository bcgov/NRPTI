'use strict';

const axios = require('axios');
const QS = require('qs');

const CORE_TOKEN_ENDPOINT =
  process.env.CORE_TOKEN_ENDPOINT || 'https://oidc.gov.bc.ca/auth/realms/mds/protocol/openid-connect/token';

/**
 * Performs an HTTP get request against the provided URL.
 *
 * @async
 * @param {URL} url a URL object (see https://nodejs.org/api/url.html#url_url)
 * @returns {Promise<any>} promise that resolves with the data property of the response object, or null.
 * @throws {Error} if any errors occur, or necessary function calls fail.
 */
exports.getRecords = async function (url, options = undefined) {
  let response;

  try {
    response = await axios.get(url.href, options);
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

/**
 * Builds the integration URL string.
 *
 * @param {string} hostname the url hostname. Example: 'www.example.com'
 * @param {string} pathname the url pathname. Example: '/api/some/route'
 * @param {object} queryParams the url query params. Example: { type: 'document', other: true }
 * @returns {URL} integration URL (see https://nodejs.org/api/url.html#url_url)
 * @memberof CoreDataSource
 */
exports.getIntegrationUrl = function (hostname, pathname, queryParams = {}) {
  const query = QS.stringify(queryParams);
  const path = `${pathname}?${query}`;
  const url = new URL(path, hostname);

  return url;
};

/**
 * Gets a new Core API access token.
 *
 * @param {string} clientId Core client ID.
 * @param {string} clientSecret Core client secret.
 * @param {string} grantType Core SSO grant type.
 * @returns {Object?} payload - the res.data obj which includes the access_token as well as its time to live.
 * @memberof CoreDataSource
 */
exports.getCoreAccessToken = async function (clientId, clientSecret, grantType) {
  if (!clientId) {
    throw new Error('coreLogin - param clientId cannot be null.');
  }

  if (!clientSecret) {
    throw new Error('coreLogin - param clientSecret cannot be null.');
  }

  if (!grantType) {
    throw new Error('coreLogin - param grantType cannot be null.');
  }

  const requestBody = {
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: grantType
  };

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  const res = await axios.post(CORE_TOKEN_ENDPOINT, QS.stringify(requestBody), config);

  const payload = res.data ? res.data : null;

  if (!payload || !payload.access_token) {
    throw new Error('coreLogin - unable to log in to Core API.');
  }

  return payload;
};

/**
 * Creates the authentication header for protected requests.
 *
 * @param {string} token Bearer token.
 * @param {object} additionalOptions Additional HTTP options.
 * @returns {object} Axios header with the bearer token set
 * @memberof CoreDataSource
 */
exports.getAuthHeader = function (token, additionalOptions = {}) {
  return {
    headers: {
      Authorization: `Bearer ${token}`
    },
    ...additionalOptions
  };
};
