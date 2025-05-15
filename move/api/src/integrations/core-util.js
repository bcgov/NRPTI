const integrationUtils = require('./integration-utils');
const {getCoreAccessToken, getAuthHeader } = require('./integration-utils');

const CORE_CLIENT_ID = process.env.CORE_CLIENT_ID || null;
const CORE_CLIENT_SECRET = process.env.CORE_CLIENT_SECRET || null;
const CORE_GRANT_TYPE = process.env.CORE_GRANT_TYPE || null;
const TIME_BUFFER = 30000;
const SECONDS_TO_MILLISECONDS_MULTIPLIER = 1000;


class CoreUtil {

    /**
     * Sets the CORE API token and marks when the token will expire
     *
     */
    async getToken(){
        console.log('Updating CORE Token...');
        const apiAccess = await getCoreAccessToken(CORE_CLIENT_ID, CORE_CLIENT_SECRET, CORE_GRANT_TYPE);
        this.apiAccessExpiry = this.getExpiryTime(apiAccess.expires_in);
        this.client_token = apiAccess.access_token;
        console.log('CORE Token updated.');
    }

    /**
     * Gives a time for when the given duration will pass with a buffer
     *
     * @param {int} tokenDuration the number of seconds that the token is valid for.
     * @returns {int} the epoch time when the token is expected to expire ( - the buffer ) = current time + token duration - buffer
     *
     */
    getExpiryTime(tokenDuration) {
        return Date.now() + ( tokenDuration * SECONDS_TO_MILLISECONDS_MULTIPLIER ) - TIME_BUFFER;
    }

    /**
     * Checks if the current token is valid and requests a new token if necessasary
     */
    async checkTokenExpiry(){
        if (this.client_token == null || Date.now() >= this.apiAccessExpiry) {
            await this.getToken();
        }
    }

    /**
     * Wrapper for integration-utils.getRecords with additional logic to check if the token is expired
     * 
     */
    async getRecords(url, additionalOptions = {}) {
        await this.checkTokenExpiry();
        return await integrationUtils.getRecords(url, getAuthHeader(this.client_token, additionalOptions));
    }
}

module.exports = CoreUtil;