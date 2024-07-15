const integrationUtils = require('./integration-utils');
const {getCoreAccessToken, getAuthHeader } = require('./integration-utils');

const CORE_CLIENT_ID = process.env.CORE_CLIENT_ID || null;
const CORE_CLIENT_SECRET = process.env.CORE_CLIENT_SECRET || null;
const CORE_GRANT_TYPE = process.env.CORE_GRANT_TYPE || null;
const TIME_BUFFER = 30000;
const SECONDS_TO_MILLISECONDS_MULTIPLIER = 1000;


class CoreUtil {

    async getToken(){
        console.log('Updating CORE Token...');
        const apiAccess = await getCoreAccessToken(CORE_CLIENT_ID, CORE_CLIENT_SECRET, CORE_GRANT_TYPE);
        this.apiAccessExpiry = this.getExpiryTime(apiAccess.expires_in);
        this.client_token = apiAccess.access_token;
        console.log('CORE Token updated.');
    }

    getExpiryTime(tokenDuration) {
        return Date.now() + ( tokenDuration * SECONDS_TO_MILLISECONDS_MULTIPLIER ) - TIME_BUFFER;
    }

    async getRecords(url, additionalOptions = {}) {
        if (this.client_token == null || Date.now() >= this.apiAccessExpiry) {
            await this.getToken();
        }
        return await integrationUtils.getRecords(url, getAuthHeader(this.client_token, additionalOptions));
    }
}

module.exports = CoreUtil;