(function (window) {
    window.__env = window.__env || {};

    // Ideally in our app we have a wrapper around our logger class in the angular front ends to
    // turn on/off the console.log's
    window.__env.enableDebug = false;

    // Environment name
    window.__env.ENVIRONMENT = 'local';  // local | dev | test | prod

    window.__env.API_LOCATION = 'http://localhost:3000';
    window.__env.API_PATH = '/api';
    window.__env.API_PUBLIC_PATH = '/api/public';

    // This is a hardcoded variable that does not come from the backend
    window.__env.APPLICATION = 'NRPTI';

    // Add any feature-toggles
    // window.__env.coolFeatureActive = false;
}(this));