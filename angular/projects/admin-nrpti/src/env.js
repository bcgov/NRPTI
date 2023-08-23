(function (window) {
    window.__env = window.__env || {};

    // Ideally in our app we have a wrapper around our logger class in the angular front ends to
    // turn on/off the console.log's
    window.__env.debugMode = false;

    // Environment name
    window.__env.ENVIRONMENT = 'local';  // local | dev | test | prod

    window.__env.API_LOCATION = 'http://localhost:3000';
    window.__env.API_PATH = '/api';
    window.__env.API_PUBLIC_PATH = '/api/public';
    window.__env.KEYCLOAK_CLIENT_ID = 'nrpti-4869';
    window.__env.KEYCLOAK_URL = 'https://dev.loginproxy.gov.bc.ca/auth';
    window.__env.KEYCLOAK_REALM = 'standard';
    window.__env.KEYCLOAK_ENABLED = true;
    
    // This is a hardcoded variable that does not come from the backend
    window.__env.APPLICATION = 'NRPTI';
    window.__env.FEATURE_FLAG = {
      "nris-emli-importer": true
    };

    // Import component defaults
    window.__env.IMPORT_TABLE_INTERVAL = 15000;
    window.__env.DEFAULT_IMPORT_TABLE_QUERY_PARAMS = {
        pathAPI: window.__env.API_LOCATION + window.__env.API_PATH,
        keys: '',
        dataset: ['Task'],
        fields: [],
        pageNum: 1,
        pageSize: 20,
        sortBy: '-startDate'
    };

    // Add any feature-toggles
    // window.__env.coolFeatureActive = false;
}(this));