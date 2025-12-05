'use strict';

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const defaultLog = require('./logger')('auth-utils');
const utils = require('./constants/misc');

const SSO_ISSUER = process.env.SSO_ISSUER || 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard';
const SSO_JWKSURI =
  process.env.SSO_JWKSURI || 'https://dev.loginproxy.gov.bc.ca/auth/realms/standard/protocol/openid-connect/certs';
const JWT_SIGN_EXPIRY = process.env.JWT_SIGN_EXPIRY || '1440'; // 24 hours in minutes.
const SECRET = process.env.SECRET || 'defaultSecret';

/**
 * TODO: populate this documentation
 *
 * @param {*} req
 * @param {*} authOrSecDef
 * @param {*} token
 * @param {*} callback
 * @returns
 */
exports.verifyToken = function (req, authOrSecDef, token, callback) {
  defaultLog.info('verifying token');
  defaultLog.debug('token:', token);

  // scopes/roles defined for the current endpoint
  let currentScopes = req.swagger.operation['x-security-scopes'];
  function sendError() {
    return req.res.status(403).json({ message: 'Error: Access Denied' });
  }

  // validate the 'Authorization' header. it should have the following format: `Bearer tokenString`
  if (token && token.indexOf('Bearer ') == 0) {
    let tokenString = token.split(' ')[1];

    defaultLog.debug('Remote JWT verification');

    // Get the SSO_JWKSURI and process accordingly.
    const client = jwksClient({
      strictSsl: true, // Default value
      jwksUri: SSO_JWKSURI
    });

    const kid = jwt.decode(tokenString, { complete: true }).header.kid;

    client.getSigningKey(kid, (err, key) => {
      if (err) {
        defaultLog.error('Signing Key Error:', err);
        callback(sendError());
      } else {
        const signingKey = key.publicKey || key.rsaPublicKey;
        verifySecret(currentScopes, tokenString, signingKey, req, callback, sendError);
      }
    });
  } else {
    defaultLog.warn("Token didn't have a bearer.");
    return callback(sendError());
  }
};

/**
 * TODO: populate this documentation
 *
 * @param {*} user
 * @param {*} deviceId
 * @param {*} scopes
 * @returns
 */
exports.issueToken = function (user, deviceId, scopes) {
  defaultLog.debug('Issuing new token');
  defaultLog.debug('user:', user);
  defaultLog.debug('deviceId:', deviceId);
  defaultLog.debug('scopes:', scopes);

  let crypto = require('crypto');
  let randomString = crypto.randomBytes(32).toString('hex');
  let jti = crypto
    .createHash('sha256')
    .update(user.username + deviceId + randomString)
    .digest('hex');

  defaultLog.debug('JTI:', jti);

  let payload = {
    name: user.username,
    preferred_username: user.username,
    userID: user._id,
    deviceId: deviceId,
    jti: jti,
    iss: SSO_ISSUER,
    realm_access: {
      roles: scopes
    }
  };

  let token = jwt.sign(payload, SECRET, { expiresIn: JWT_SIGN_EXPIRY + 'm' });
  defaultLog.info('Issued new token - expires in:', JWT_SIGN_EXPIRY + 'm');

  return token;
};

/**
 * TODO: populate this documentation
 *
 * @param {*} currentScopes
 * @param {*} tokenString
 * @param {*} secret
 * @param {*} req
 * @param {*} callback
 * @param {*} sendError
 */
function verifySecret(currentScopes, tokenString, secret, req, callback, sendError) {
  jwt.verify(tokenString, secret, function (verificationError, decodedToken) {
    // check if the JWT was verified correctly
    if (verificationError == null && Array.isArray(currentScopes) && decodedToken && decodedToken.client_roles) {
      defaultLog.info('JWT decoded');

      defaultLog.debug('currentScopes', JSON.stringify(currentScopes));
      defaultLog.debug('decoded token:', decodedToken);

      defaultLog.debug('decodedToken.iss', decodedToken.iss);
      defaultLog.debug('decodedToken.client_roles', decodedToken.client_roles);

      defaultLog.debug('SSO_ISSUER', SSO_ISSUER);

      // check if the role is valid for this endpoint
      let roleMatch = currentScopes.some(role => decodedToken.client_roles.indexOf(role) >= 0);

      defaultLog.debug('role match', roleMatch);

      // check if the dissuer matches
      let issuerMatch = decodedToken.iss == SSO_ISSUER;

      defaultLog.debug('issuerMatch', issuerMatch);

      if (roleMatch && issuerMatch) {
        // add the token to the request so that we can access it in the endpoint code if necessary
        req.swagger.params.auth_payload = decodedToken;
        defaultLog.info('JWT Verified');
        return callback(null);
      } else {
        defaultLog.info('JWT Role/Issuer mismatch');
        return callback(sendError());
      }
    } else {
      // return the error in the callback if the JWT was not verified
      defaultLog.warn('JWT Verification Error:', verificationError);
      return callback(sendError());
    }
  });
}

/**
 * Checks if a user has a role against an array of valid roles.
 *
 * @param {Array<string>|string} validRoles Roles to search for a match.
 * @param {Array<string>|string} userRoles Roles to match against.
 * @returns {boolean} Indication if a match is found.
 */
exports.userHasValidRoles = function (validRoles, userRoles) {
  // Convert to array if a single value was used.
  if (!Array.isArray(validRoles)) {
    validRoles = [validRoles];
  }

  if (!Array.isArray(userRoles)) {
    userRoles = [userRoles];
  }

  for (const validRole of validRoles) {
    if (userRoles.includes(validRole)) {
      return true;
    }
  }

  return false;
};

/**
 * Checks if a user is a wildfire user based on their role.
 * The user is a wildfire user if their role only contains the admin:wf role
 * and no other admin roles.
 *
 * @param {Array<string>} userRoles All roles the current user has
 * @param {string} targetRole The role to check for
 * @returns {boolean} Indication if user if wildfire user
 */
exports.userIsOnlyInRole = function (userRoles, targetRole) {
  if (!userRoles) return false;

  // Remove all the default user roles first
  const rolesToCheck = userRoles.filter(
    role =>
      role !== utils.ApplicationRoles.PUBLIC &&
      role !== utils.KeycloakDefaultRoles.OFFLINE_ACCESS &&
      role !== utils.KeycloakDefaultRoles.UMA_AUTHORIZATION
  );

  if (!rolesToCheck) return false;

  // Not a targetRole user because this user has no application roles.
  if (rolesToCheck.length === 0) return false;

  // Not a targetRole user because this user has more than 1 application role.
  // targetRole users should only have targetRole in their roles
  if (rolesToCheck.length > 1) return false;

  // Check if the single remaining user role is targetRole
  return rolesToCheck[0] === targetRole;
};
